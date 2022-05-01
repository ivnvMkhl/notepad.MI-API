const ApiErrors = require('../exceptions/api-errors')
const tokenService = require('../services/token-service')

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return next(ApiErrors.UnauthorizeError())
    }

    const accessToken = authHeader.split(' ')[1]
    if (!accessToken) {
      return next(ApiErrors.UnauthorizeError())
    }

    const userData = tokenService.validateAccessToken(accessToken)
    if (!userData) {
      return next(ApiErrors.UnauthorizeError())
    }

    req.user = userData
    next()
  } catch (e) {
    return next(ApiErrors.UnauthorizeError())
  }
}
