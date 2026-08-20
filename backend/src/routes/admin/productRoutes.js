const router = require('express').Router()
const productController = require('../../controllers/admin/productController')

router.get('/', productController.listProducts)
router.get('/:id', productController.getProduct)
router.post('/', productController.createProduct)
router.put('/:id', productController.updateProduct)
router.patch('/:id/status', productController.updateProductStatus)
router.delete('/:id', productController.deleteProduct)

module.exports = router
