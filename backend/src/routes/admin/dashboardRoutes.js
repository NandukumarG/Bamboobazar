const router = require('express').Router()
const dashboardController = require('../../controllers/admin/dashboardController')

router.get('/', dashboardController.getDashboard)

module.exports = router
