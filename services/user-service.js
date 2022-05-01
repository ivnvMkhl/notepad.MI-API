const db = require('../db')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDtoSQL = require('../dtos/user-dto')
const ApiErrors = require('../exceptions/api-errors')
const noteService = require('./note-service')

class userService {
  async registration(email, password) {
    const candidate = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (candidate.rows.length > 0) {
      throw ApiErrors.BedRequest(`Пользователь с таким e-mail (${email}) уже зарегистрирован`)
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const activationLink = uuid.v4()
    const user = await db.query('INSERT INTO users (email, password, activationLink) VALUES ($1, $2, $3) RETURNING *', [
      email,
      hashPassword,
      activationLink,
    ])

    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

    const userDto = new UserDtoSQL(user.rows[0])
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    // await noteService.createUserNotesTable(userDto.id)

    return { ...tokens, ...userDto }
  }

  async activate(activationLink) {
    const user = await db.query('SELECT * FROM users WHERE activationlink = $1', [activationLink])
    if (user.rows.length === 0) {
      throw ApiErrors.BedRequest('Некорректная ссылка авторизации')
    }
    await db.query('UPDATE users SET isactivated = false WHERE activationlink = $1', [activationLink])
    return `USER ${user.rows[0].email} ACTIVATE`
  }

  async login(email, password) {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (user.rows.length === 0) {
      throw ApiErrors.BedRequest('Пользователь с таким email не зарегистрирован')
    }
    const isPassEquals = await bcrypt.compare(password, user.rows[0].password)
    if (!isPassEquals) {
      throw ApiErrors.BedRequest('Неверный пароль')
    }

    const userDto = new UserDtoSQL(user.rows[0])
    const tokens = tokenService.generateTokens({ ...userDto })

    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, ...userDto }
  }

  async logout(refreshToken) {
    const completeSend = await tokenService.removeToken(refreshToken)
    return { message: completeSend }
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiErrors.UnauthorizeError()
    }
    const userData = tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = await tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDb.token) {
      throw ApiErrors.UnauthorizeError()
    }

    const user = await db.query('SELECT * FROM users WHERE user_id = $1', [userData.id])
    const userDto = new UserDtoSQL(user.rows[0])
    const tokens = tokenService.generateTokens({ ...userDto })
    await tokenService.saveToken(userDto.id, tokens.refreshToken)

    return { ...tokens, ...userDto }
  }

  async forgotPassword(forgotEmail) {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [forgotEmail])
    if (user.rows.length === 0) {
      throw ApiErrors.BedRequest('Не найден пользователь для восстановления пароля')
    }
    const forgotToken = tokenService.generateForgotToken({ email: user.rows[0].email })
    await mailService.sendForgotMail(user.rows[0].email, `${process.env.API_URL}/api/forgot/${forgotToken}`)

    return { message: `Ссылка для восстановления пароля выслана на почту ${user.rows[0].email}` }
  }

  async changePassword(email, password) {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (user.rows.length === 0) {
      throw ApiErrors.BedRequest('Не найден email пользователя для смены пароля')
    }
    const hashPassword = await bcrypt.hash(password, 3)
    await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashPassword, email])
    return { message: 'PASSWORD CHANGE COMPLETE' }
  }

  async getAllUsers() {
    const users = await db.query('SELECT user_id, email, first_name, last_name, registration FROM users')
    return users.rows
  }
}

module.exports = new userService()
