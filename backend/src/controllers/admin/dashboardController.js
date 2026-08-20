const asyncHandler = require('../../utils/asyncHandler')
const dashboardModel = require('../../models/dashboardModel')

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardModel.getStats()
  res.json({ stats })
})

module.exports = { getDashboard }
