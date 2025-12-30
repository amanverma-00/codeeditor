const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
      } else {
        console.log('SMTP Server is ready to take messages');
      }
    });
  }

  async sendEmail(to, subject, templateName, context) {
    try {
      const templatePath = path.join(__dirname, '../emails', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      const html = template(context);

      const mailOptions = {
        from: `"InterviewPrep Pro" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html,
        text: this.htmlToText(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async sendOTP(email, otp, name) {
    return this.sendEmail(email, 'Your OTP Code - InterviewPrep Pro', 'otp', {
      name,
      otp,
      expiryMinutes: 10,
      supportEmail: process.env.SUPPORT_EMAIL
    });
  }

  async sendWelcomeEmail(email, name) {
    return this.sendEmail(email, 'Welcome to InterviewPrep Pro!', 'welcome', {
      name,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL
    });
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    return this.sendEmail(email, 'Password Reset Request', 'password-reset', {
      name,
      resetUrl,
      expiryHours: 1,
      supportEmail: process.env.SUPPORT_EMAIL
    });
  }

  async sendPasswordChangedEmail(email, name) {
    return this.sendEmail(email, 'Password Changed Successfully', 'password-changed', {
      name,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      supportEmail: process.env.SUPPORT_EMAIL
    });
  }
}

module.exports = new EmailService();