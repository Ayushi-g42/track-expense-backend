import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  let transporter;

  if (process.env.SMTP_HOST) {
    // Create a transporter using provided SMTP settings
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    console.log("No SMTP settings found in .env. Generating a test account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Define the email options
  const message = {
    from: `${process.env.SMTP_FROM_NAME || 'Support'} <${process.env.SMTP_FROM_EMAIL || 'noreply@example.com'}>`,
    // from: 'ayushigothi012@gmail.com',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);

  // Log preview URL if using test account
  if (!process.env.SMTP_HOST) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;
