const userService = require('../services/user-service')
const { validationResult } = require('express-validator')
const ApiErrors = require('../exceptions/api-errors')
const tokenService = require('../services/token-service')
const { render } = require('ejs')

class authController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(ApiErrors.BedRequest('Validation error', errors.array()))
      }
      const { email, password } = req.body
      const userData = await userService.registration(email, password)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json({ message: 'Пользователь разлогинен', token })
    } catch (e) {
      next(e)
    }
  }

  async forgot(req, res, next) {
    try {
      const { forgotEmail } = req.body
      const forgotData = await userService.forgotPassword(forgotEmail)
      return res.json(forgotData)
    } catch (e) {
      next(e)
    }
  }

  async forgotPage(req, res, next) {
    try {
      const forgotLink = req.params.forgotLink
      const userForgotData = tokenService.validateForgotToken(forgotLink)
      if (!userForgotData) {
        throw ApiErrors.BedRequest('Неактивная ссылка. Ссылка для восстановления пароля работает 30мин')
      }
      res.render('forgot', { email: userForgotData.email, forgotLink })
    } catch (e) {
      next(e)
    }
  }

  async forgotLink(req, res, next) {
    try {
      const forgotLink = req.params.forgotLink

      const userForgotData = tokenService.validateForgotToken(forgotLink)
      if (!userForgotData) {
        throw ApiErrors.BedRequest('Неактивная ссылка. Ссылка для восстановления пароля работает 30мин')
      }
      const newPassword = req.body.slice(4, -2)
      if (newPassword.length < 3 || newPassword.length > 10) {
        throw ApiErrors.BedRequest('Пароль должен быть больше 3х но меньше 10 символов')
      }
      const completeSend = userService.changePassword(userForgotData.email, newPassword)
      return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = await userService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      userService.activate(activationLink)
      return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers()
      return res.json(users)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new authController()
