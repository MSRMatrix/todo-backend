import nodemailer from "nodemailer";
import "dotenv/config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_UN,
    pass: process.env.GMAIL_PW,
  },
});

export const mailerFunction = async (data, topic, message) => {
  try {
    const mailOptions = {
      from: process.env.GMAIL_UN,
      to: data.email,
      subject: topic,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email was not sent:", error);
  }
};
