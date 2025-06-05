import nodemailer from "nodemailer"

const generateVerificationMail = async (email: string, title: string, body:string) : Promise<void> => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from : "Stock Image - Email Verification",
            to: email,
            subject: title,
            html: body
        })

        console.log("Response: %s", info.response);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Failed to send email:", error.message); 
        } else {
            console.error("Failed to send email: An unknown error occurred");
        }
        throw error; // Rethrow the error
    }
    
}

export const sendOtpMail = async (email:string, otp: string) => {
    await generateVerificationMail(
        email,
        "Email Verification",
      `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
  
              h2 {
                font-weight:500;
                color: #6b7280;
              }
      
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
              }
      
              .logo {
                  display: block;
                  margin: 0 auto 20px;
              }
      
              .header {
                  background-color: #152e5c;
                  color: #ffffff;
                  padding: 10px 20px;
                  border-radius: 5px;
                  text-align: left;
              }
      
              .otp-content {
                  margin-top: 30px;
                  font-size: 18px;
                  color: #333;
                  text-align: left;
                  background-color: #f9f9f9;
                  border: 1px solid #ddd;
                  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
                  padding: 20px;
                  border-radius: 5px;
              }
  
              .otp-nb {
                font-size: 14px;
              }
      
              .otp-code {
                  font-size: 24px;
                  font-weight: bold;
                  color: #152e5c;
              }
      
              .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #555;
                  text-align: left;
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <h2>Stock Image</h2>
              <div class="header">
                  <h1>Email Verification</h1>
              </div>
              <div class="otp-content">
                  <p>Dear User,</p>
                  <p>We have received a request to verify your email address. Please use the following OTP code to complete the verification:</p>
                  <p><span class="otp-code">${otp}</span></p>
                  <p class="otp-nb">If you didn't request this OTP, please ignore this email.</p>
              </div>
              <div class="footer">
                  <p>Best regards,</p>
                  <p>Stock Image</p>
                  <p>&copy; 2024 Stock Image. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
      `
    )
}