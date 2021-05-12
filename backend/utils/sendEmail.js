const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const sendEmail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    })
  );
  return await transporter.sendMail({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    html,
  });
};
module.exports = sendEmail;
