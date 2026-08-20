import { Link } from 'react-router-dom'

function CategoryCard({ category }) {
  return (
    <Link to={`/categories/${category.slug}`} className="category-card">
      <h3>{category.name}</h3>
      {category.description && <p>{category.description}</p>}
    </Link>
  )
}

export default CategoryCard
