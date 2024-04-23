
const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require('html-to-text');



class Email 
{
  constructor(user, url) 
  {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Rafa Hernandez <${process.env.EMAIL_FROM}>`;
  }

  createTransport() 
  {
    if (process.env.NODE_ENV === "production") 
    {
      // Sendgrid
      return nodemailer.createTransport(
      {
        service: "SendGrid",
        auth:
        {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        }
      });
    } 
    else 
    {
      return nodemailer.createTransport(
        {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EML_PASSWORD // Corregido de EML_PASSWORD
        }
      });
    }
  }

  // Enviar el correo electrónico real
  async send(template, subject) 
  {
    // 1) Renderizar HTML basado en una plantilla de pug
    const html = pug.renderFile(`views/emails/${template}.pug`, 
    {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Definir las opciones del correo electrónico
    const mailOptions = 
    {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // 3) Crear un transportador y enviar el correo electrónico
    await this.createTransport().sendMail(mailOptions); // Corregido de SendEmail
  }

  async sendWelcome() 
  {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset()
  {
    await this.send("passwordReset", "Your password reset token (valid for only 10 minutes)")
  } 
}

async function sendEmail(options) 
{
  // 1) Crear un transportador
  const transporter = nodemailer.createTransport(
  {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EML_PASSWORD // Corregido de EML_PASSWORD
    }
  });

  // 2) Definir las opciones de correo electrónico
  const mailOptions = 
  {
    from: "Rafa Hernandez <mail@mail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // 3) Enviar el correo electrónico con nodemailer
  await transporter.sendEmail(mailOptions);
}

module.exports = Email;