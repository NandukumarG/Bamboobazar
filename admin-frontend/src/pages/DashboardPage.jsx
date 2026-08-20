import { useEffect, useState } from 'react'
import { getDashboardStats } from '../services/dashboardService'
import { formatCurrency } from '../utils/currency'

function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading dashboard…</p>
  if (error) return <div className="alert alert-error">{error}</div>

  const cards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Active Products', value: stats.activeProducts },
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue) },
  ]

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <span className="stat-card__label">{card.label}</span>
            <span className="stat-card__value">{card.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
