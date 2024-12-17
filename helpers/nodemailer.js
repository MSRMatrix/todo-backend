import nodemailer from "nodemailer"
import "dotenv/config.js"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_UN,
      pass: process.env.GMAIL_PW
    }
  });

  export const emailWelcome = async (data) => {
    try {
      const mailOptions = {
        from: process.env.GMAIL_UN,
        to: data.email,
        subject: 'Account Nachricht',
        text: `You created a profile! Use this code to verify your email: ${data.code}! You have 3 hours to verify your email adress!`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('E-Mail wurde erfolgreich gesendet:', info.messageId);
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
    }
  };
 
  export const userDelete = async (email) => {
    try {
      const mailOptions = {
        from: process.env.GMAIL_UN,
        to: email,
        subject: 'Nachricht an Sie',
        text: `Your profile was deleted!`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('E-Mail wurde erfolgreich gesendet:', info.messageId);
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
    }
  };

  export const emailUpdate = async (email) => {
    try {
      const mailOptions = {
        from: process.env.GMAIL_UN,
        to: email,
        subject: 'Nachricht an Sie',
        text: `You changed your email!`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('E-Mail wurde erfolgreich gesendet:', info.messageId);
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
    }
  };  
  
  
  export const newCode = async (data) => {
    try {
      const mailOptions = {
        from: process.env.GMAIL_UN,
        to: data.email,
        subject: 'Nachricht an Sie',
        text: `You have exceeded the maximum number of attempts! Please try again in 1 hour. Your new code ${data.code}`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('E-Mail wurde erfolgreich gesendet:', info.messageId);
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
    }
  };