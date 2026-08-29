const router = require('express').Router()
const authController = require('../controllers/authController')
const authenticate = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/me/avatar', authenticate, upload.single('image'), authController.uploadAvatar)

module.exports = router
