const ApiErrors = require('../exceptions/api-errors')
const { getAllUserNotes, saveUserNote, deleteUserNote, deleteAllUserNotes } = require('../services/note-service')
const { validateRefreshToken } = require('../services/token-service')

class noteController {
  async getAllNotes(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = validateRefreshToken(refreshToken)
      if (userData === null) throw ApiErrors.UnauthorizeError('User not authorized')

      const notes = await getAllUserNotes(userData.id)
      return res.json(notes)
    } catch (e) {
      next(e)
    }
  }
  async saveNote(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = validateRefreshToken(refreshToken)
      if (userData === null) throw ApiErrors.UnauthorizeError('User not authorized')

      const data = JSON.parse(req.body)
      if (!data) throw ApiErrors.BedRequest('note data in undefined')

      const completeSend = await saveUserNote(userData.id, data)
      return res.json({ message: completeSend })
    } catch (e) {
      next(e)
    }
  }
  async deleteNote(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = validateRefreshToken(refreshToken)
      if (userData === null) throw ApiErrors.UnauthorizeError('User not authorized')

      const data = JSON.parse(req.body)
      if (!data) throw ApiErrors.BedRequest('note data in undefined')

      const completeSend = await deleteUserNote(userData.id, data.noteId)
      return res.json({ message: completeSend })
    } catch (e) {
      next(e)
    }
  }
  async deleteAllNotes(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const userData = validateRefreshToken(refreshToken)
      if (userData === null) throw ApiErrors.UnauthorizeError('User not authorized')

      const completeSend = await deleteAllUserNotes(userData.id)
      return res.json({ message: completeSend })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new noteController()
