const Router = require('express')
const { body } = require('express-validator')
const authMiddleware = require('./middlewares/auth-middleware')

const authController = require('./controllers/authController')
const noteController = require('./controllers/noteController')

const router = new Router()

router.post('/registration', body('email').isEmail(), body('password').isLength({ min: 6, max: 12 }), authController.registration)
router.post('/login', body('email').isEmail(), authController.login)
router.post('/logout', authController.logout)
router.post('/forgot', authController.forgot)
router.post('/forgot/:forgotLink', authController.forgotLink)
router.get('/forgot/:forgotLink', authController.forgotPage)
router.get('/refresh', authController.refresh)
router.get('/activate/:link', authController.activate)
router.get('/users', authMiddleware, authController.getUsers)

router.get('/notes/getall', authMiddleware, noteController.getAllNotes)
router.post('/notes/save', authMiddleware, noteController.saveNote)
router.post('/notes/delete', authMiddleware, noteController.deleteNote)
router.post('/notes/deleteall', authMiddleware, noteController.deleteAllNotes)

module.exports = router
