const router = require('express').Router()
const categoryController = require('../../controllers/admin/categoryController')
const upload = require('../../middleware/uploadMiddleware')

router.get('/', categoryController.listCategories)
router.get('/:id', categoryController.getCategory)
router.post('/upload-image', upload.single('image'), categoryController.uploadCategoryImage)
router.post('/', categoryController.createCategory)
router.put('/:id', categoryController.updateCategory)
router.patch('/:id/status', categoryController.updateCategoryStatus)

module.exports = router
