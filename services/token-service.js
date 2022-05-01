const jwt = require('jsonwebtoken')
const db = require('../db')

class tokenService {
  generateTokens(userData) {
    const accessToken = jwt.sign(userData, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
    const refreshToken = jwt.sign(userData, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
    return {
      accessToken,
      refreshToken,
    }
  }

  generateForgotToken(userData) {
    const forgotToken = jwt.sign(userData, process.env.JWT_FORGOT_SECRET, { expiresIn: '30m' })
    return forgotToken
  }

  validateForgotToken(forgotToken) {
    try {
      const userForgotData = jwt.verify(forgotToken, process.env.JWT_FORGOT_SECRET)
      return userForgotData
    } catch (e) {
      return null
    }
  }

  validateAccessToken(accessToken) {
    try {
      const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
      return userData
    } catch (e) {
      return null
    }
  }

  validateRefreshToken(refreshToken) {
    try {
      const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      return userData
    } catch (e) {
      return null
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await db.query('SELECT * FROM tokens WHERE user_id = $1', [userId])
    if (tokenData.rows.length > 0) {
      await db.query('UPDATE tokens SET token = $1, token_date = now() WHERE user_id = $2', [refreshToken, userId])
      return 'SAVE TOKEN COMPLETE'
    }
    await db.query('INSERT INTO tokens (token, user_id) VALUES ($1, $2)', [refreshToken, userId])
    return 'SAVE TOKEN COMPLETE'
  }

  async removeToken(refreshToken) {
    const tokenData = await db.query('DELETE FROM tokens WHERE token = $1', [refreshToken])
    return 'REMOVE TOKEN COMPLETE'
  }

  async findToken(refreshToken) {
    const tokenData = await db.query('SELECT * FROM tokens WHERE token = $1', [refreshToken])
    return tokenData.rows[0]
  }
}

module.exports = new tokenService()
