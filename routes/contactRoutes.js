import 'dotenv/config'; // This line loads environment variables from your .env file
import express from 'express';
import nodemailer from 'nodemailer';
import { google } from 'googleapis'; // Import google from googleapis
import connection from '../models/db.js';

const router = express.Router();

// Initialize OAuth2 client
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.EMAIL_CLIENT_ID,
  process.env.EMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // This is a redirect URI, can be changed if you have your own
);

oauth2Client.setCredentials({
  refresh_token: process.env.EMAIL_REFRESH_TOKEN,
});

// Function to get a new access token
async function getAccessToken() {
  try {
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw new Error('Failed to obtain access token for email sending.');
  }
}

// Configure nodemailer transporter
// This transporter will be recreated for each email to ensure a fresh access token
const createTransporter = async () => {
  const accessToken = await getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.EMAIL_CLIENT_ID,
      clientSecret: process.env.EMAIL_CLIENT_SECRET,
      refreshToken: process.env.EMAIL_REFRESH_TOKEN,
      accessToken: accessToken, // The dynamically generated access token
    },
  });
};


// Enhanced validation middleware
const validateContact = (req, res, next) => {
  const { name, email, phone, message } = req.body;
  const errors = {};

  // Required field validation
  if (!name?.trim()) errors.name = 'Name is required';
  if (!email?.trim()) errors.email = 'Email is required';
  if (!phone?.trim()) errors.phone = 'Phone is required';
  if (!message?.trim()) errors.message = 'Message is required';

  // Format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email';
  }

  if (phone) {
    if (!phone.startsWith('+91')) {
      errors.phone = 'Phone must start with +91';
    } else if (phone.length !== 13) {
      errors.phone = 'Must be 10 digits after +91';
    } else if (!/^\+91\d{10}$/.test(phone)) {
      errors.phone = 'Only numbers allowed after +91';
    }
  }

  if (message?.trim() && message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Submit contact form
router.post('/contact', validateContact, async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // Save to database
    const query = 'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, email, phone, message], async (err, result) => { // Added async here
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          message: 'Failed to save contact',
          error: err.message
        });
      }

      let transporter;
      try {
        transporter = await createTransporter(); // Create transporter here
      } catch (emailAuthError) {
        console.error('Email authentication setup error:', emailAuthError);
        // If transporter creation fails, log error and proceed without sending emails
        return res.status(201).json({
          message: 'Contact saved but email features are disabled',
          warning: 'Could not set up email authentication. Confirmation email and company notification not sent.',
          data: { id: result.insertId }
        });
      }


      // 1. Send confirmation email to the user
      const userMailOptions = {
        from: `WebArtifacts <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Thanks for contacting WebArtifacts',
        text: `Dear ${name},\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nBest regards,\nWebArtifacts Team`,
        html: `<p>Dear ${name},</p>
               <p>Thank you for contacting us. We have received your message and will get back to you soon.</p>
               <p>Best regards,<br>WebArtifacts Team</p>`
      };

      transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
          console.error('User email error:', error);
          // Don't return here, attempt to send company email even if user email fails
          // This allows the company to still know about the submission
        }

        // 2. Send notification email to the company
        const companyMailOptions = {
          from: `WebArtifacts Contact Form <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER, // Company's email address
          subject: `New Contact Form Submission from ${name}`,
          text: `A new contact form has been submitted:\n\n` +
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Phone: ${phone}\n` +
                `Message:\n${message}\n\n` +
                `Please respond to them at your earliest convenience.`,
          html: `<p>A new contact form has been submitted:</p>
                 <ul>
                   <li><strong>Name:</strong> ${name}</li>
                   <li><strong>Email:</strong> ${email}</li>
                   <li><strong>Phone:</strong> ${phone}</li>
                   <li><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</li>
                 </ul>
                 <p>Please respond to them at your earliest convenience.</p>`
        };

        transporter.sendMail(companyMailOptions, (companyError, companyInfo) => {
          if (companyError) {
            console.error('Company notification email error:', companyError);
            return res.status(201).json({
              message: 'Contact saved and user email sent, but company notification failed',
              warning: 'Company notification email could not be sent',
              data: { id: result.insertId }
            });
          }

          if (error) { // Check if user email previously failed
            return res.status(201).json({
              message: 'Contact saved and company notification sent, but user confirmation failed',
              warning: 'Confirmation email could not be sent to the user',
              data: { id: result.insertId }
            });
          }

          res.status(201).json({
            message: 'Contact submitted successfully and emails sent',
            data: { id: result.insertId }
          });
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all contacts (for admin)
router.get('/contact', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  // Basic auth check (in real app, verify JWT properly)
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
      error: 'Missing authentication token'
    });
  }

  const query = 'SELECT * FROM contacts ORDER BY created_at DESC';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        message: 'Failed to fetch contacts',
        error: err.message
      });
    }

    res.json({
      message: 'Contacts retrieved successfully',
      data: results
    });
  });
});

// Delete contact (for admin)
router.delete('/contact/:id', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const id = parseInt(req.params.id);

  // Auth check
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
      error: 'Missing authentication token'
    });
  }

  // ID validation
  if (isNaN(id)) {
    return res.status(400).json({
      message: 'Invalid contact ID',
      error: 'ID must be a number'
    });
  }

  const query = 'DELETE FROM contacts WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        message: 'Failed to delete contact',
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Contact not found',
        error: `No contact with ID ${id} exists`
      });
    }

    res.json({
      message: 'Contact deleted successfully',
      deletedId: id
    });
  });
});

export default router;

























// import express from 'express';
// import nodemailer from 'nodemailer';
// import connection from '../models/db.js';
// import dotenv from 'dotenv';
// import { google } from 'googleapis';

// dotenv.config();

// const router = express.Router();

// // Initialize OAuth2 client
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.OAUTH_CLIENT_ID,
//   process.env.OAUTH_CLIENT_SECRET,
//   process.env.OAUTH_REDIRECT_URI
// );

// // Set credentials if refresh token is available
// if (process.env.OAUTH_REFRESH_TOKEN) {
//   oAuth2Client.setCredentials({
//     refresh_token: process.env.OAUTH_REFRESH_TOKEN
//   });
// }

// // Function to generate new access token with better error handling
// async function getAccessToken() {
//   try {
//     const { token } = await oAuth2Client.getAccessToken();
//     if (!token) {
//       throw new Error('No access token received');
//     }
//     return token;
//   } catch (error) {
//     console.error('Error generating access token:', error.message);
//     // If refresh token fails, try using the stored access token if available
//     if (process.env.OAUTH_ACCESS_TOKEN) {
//       console.log('Falling back to stored access token');
//       return process.env.OAUTH_ACCESS_TOKEN;
//     }
//     throw new Error('Failed to get access token');
//   }
// }

// // Configure transporter with OAuth2
// const createTransporter = async () => {
//   try {
//     const accessToken = await getAccessToken();
    
//     return nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL_USER,
//         clientId: process.env.OAUTH_CLIENT_ID,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.OAUTH_REFRESH_TOKEN,
//         accessToken: accessToken
//       }
//     });
//   } catch (error) {
//     console.error('Error creating transporter:', error);
//     // Fallback to basic auth if OAuth fails
//     if (process.env.EMAIL_PASS) {
//       console.log('Falling back to basic authentication');
//       return nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         }
//       });
//     }
//     throw error;
//   }
// };

// let transporter;

// // Initialize transporter on startup
// (async () => {
//   try {
//     transporter = await createTransporter();
    
//     // Verify connection
//     transporter.verify((error) => {
//       if (error) {
//         console.error('SMTP Connection Failed:', error);
//       } else {
//         console.log('Server is ready to send emails');
        
//         // Refresh token periodically (every 45 minutes)
//         setInterval(async () => {
//           try {
//             const newToken = await getAccessToken();
//             transporter.options.auth.accessToken = newToken;
//             console.log('Access token refreshed');
//           } catch (error) {
//             console.error('Error refreshing token:', error.message);
//           }
//         }, 45 * 60 * 1000);
//       }
//     });
//   } catch (error) {
//     console.error('Failed to initialize mail transporter:', error);
//   }
// })();

// // Validation middleware
// const validateContact = (req, res, next) => {
//   const { name, email, phone, message } = req.body;
//   const errors = {};

//   if (!name?.trim()) errors.name = 'Name is required';
//   if (!email?.trim()) errors.email = 'Email is required';
//   if (!phone?.trim()) errors.phone = 'Phone is required';
//   if (!message?.trim()) errors.message = 'Message is required';

//   if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     errors.email = 'Please enter a valid email address';
//   }

//   if (phone && !/^\+?\d{10,15}$/.test(phone)) {
//     errors.phone = 'Phone must be 10-15 digits';
//   }

//   if (message?.trim() && message.length < 10) {
//     errors.message = 'Message must be at least 10 characters';
//   }

//   if (Object.keys(errors).length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: 'Validation failed',
//       errors
//     });
//   }

//   next();
// };

// // Contact form submission
// router.post('/contact', validateContact, async (req, res) => {
//   const { name, email, phone, message } = req.body;
//   const companyEmail = process.env.COMPANY_EMAIL || process.env.EMAIL_USER;

//   try {
//     // 1. Save to database
//     const dbResult = await new Promise((resolve, reject) => {
//       const query = `
//         INSERT INTO contacts (name, email, phone, message, created_at) 
//         VALUES (?, ?, ?, ?, NOW())
//       `;
//       connection.query(query, [name, email, phone, message], (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       });
//     });

//     // 2. Prepare email
//     const mailOptions = {
//       from: `"Website Contact Form" <${process.env.EMAIL_USER}>`,
//       to: companyEmail,
//       replyTo: email,
//       subject: `New Contact Submission: ${name}`,
//       text: `
//         New contact form submission:
        
//         Name: ${name}
//         Email: ${email}
//         Phone: ${phone}
        
//         Message:
//         ${message}
        
//         Received at: ${new Date().toLocaleString()}
//       `,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 5px; padding: 20px;">
//           <h2 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Submission</h2>
          
//           <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
//             <tr>
//               <td style="padding: 8px; border: 1px solid #ddd; width: 30%; font-weight: bold;">Name:</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
//             </tr>
//             <tr>
//               <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
//             </tr>
//             <tr>
//               <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone:</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
//             </tr>
//             <tr>
//               <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message:</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">${message}</td>
//             </tr>
//           </table>
          
//           <p style="color: #7f8c8d; font-size: 0.9em; text-align: right;">
//             Received at: ${new Date().toLocaleString()}
//           </p>
//         </div>
//       `
//     };

//     // 3. Send email with retry logic
//     if (!transporter) {
//       transporter = await createTransporter();
//     }

//     let retries = 3;
//     let lastError;
    
//     while (retries > 0) {
//       try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent:', info.messageId);
        
//         return res.status(201).json({
//           success: true,
//           message: 'Thank you! Your message has been sent successfully.',
//           data: {
//             contactId: dbResult.insertId,
//             emailId: info.messageId
//           }
//         });
//       } catch (error) {
//         lastError = error;
//         retries--;
//         console.log(`Email send failed. Retries left: ${retries}`, error.message);
        
//         // Refresh token before retry
//         try {
//           transporter.options.auth.accessToken = await getAccessToken();
//         } catch (tokenError) {
//           console.error('Error refreshing token:', tokenError.message);
//         }
        
//         await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
//       }
//     }

//     throw lastError || new Error('Failed to send email after retries');
    
//   } catch (error) {
//     console.error('Error processing contact form:', error);
    
//     // Determine if the database save was successful
//     const dbSuccess = !error.message.includes('database');
    
//     res.status(dbSuccess ? 500 : 400).json({
//       success: false,
//       message: dbSuccess 
//         ? 'Your message was saved, but we encountered an error sending the notification' 
//         : 'Failed to save your message',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // Get all contacts (admin route)
// router.get('/contacts', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token || token !== process.env.ADMIN_TOKEN) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     const contacts = await new Promise((resolve, reject) => {
//       connection.query(
//         'SELECT id, name, email, phone, message, created_at FROM contacts ORDER BY created_at DESC',
//         (err, results) => {
//           if (err) return reject(err);
//           resolve(results);
//         }
//       );
//     });

//     res.json({
//       success: true,
//       data: contacts
//     });
//   } catch (error) {
//     console.error('Error fetching contacts:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch contacts'
//     });
//   }
// });

// // Delete contact (admin route)
// router.delete('/contacts/:id', async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token || token !== process.env.ADMIN_TOKEN) {
//       return res.status(401).json({
//         success: false,
//         message: 'Authentication required'
//       });
//     }

//     const id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid contact ID'
//       });
//     }

//     const result = await new Promise((resolve, reject) => {
//       connection.query(
//         'DELETE FROM contacts WHERE id = ?',
//         [id],
//         (err, result) => {
//           if (err) return reject(err);
//           resolve(result);
//         }
//       );
//     });

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contact not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Contact deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting contact:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete contact'
//     });
//   }
// });

// // Health check endpoint
// router.get('/health', (req, res) => {
//   const dbStatus = connection.state === 'authenticated' ? 'connected' : 'disconnected';
  
//   res.status(200).json({
//     status: 'healthy',
//     database: dbStatus,
//     email: transporter ? 'configured' : 'not configured',
//     timestamp: new Date().toISOString()
//   });
// });

// export default router;