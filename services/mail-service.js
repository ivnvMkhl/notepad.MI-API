const nodemailer = require('nodemailer')

class mailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  async sendActivationMail(to, link) {
    this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Активация аккаунта ${to} в приложении Notepad.MI`,
      text: '',
      html: `
      
        <div> 
        <h1>Для активации аккаунта пройдите по ссылке</h1>
        <a href="${link}">${link}</a>
        </div>
      
      `,
    })
  }

  async sendForgotMail(to, link) {
    this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Восстановление пароля аккаунта ${to} в приложении Notepad.MI`,
      text: '',
      html: `
      
        <div> 
        <h1>Для восстановления пароля аккаунта пройдите по ссылке:</h1>
        <a href="${link}">${link}</a>
        </div>
      
      `,
    })
  }
}

module.exports = new mailService()
