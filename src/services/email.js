import nodemailer from "nodemailer";
export async function sendemail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAILSENDER,
      pass: process.env.EMAILPASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `ABR <${process.env.EMAILSENDER}>`, // Corrected the 'from' field
    to,
    subject,
    html,
  });
  return info;
};