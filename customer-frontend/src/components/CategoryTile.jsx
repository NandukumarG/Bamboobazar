import { Link } from 'react-router-dom'
import { useTilt } from '../hooks/useTilt'

// Categories have no image of their own in the schema, so the tile borrows a
// representative product photo when one is available; otherwise it falls
// back to a palette gradient rather than a fake stock photo.
const GRADIENTS = [
  'linear-gradient(160deg, #6B7A3D, #3F4A24)',
  'linear-gradient(160deg, #D8B56A, #C9A227)',
  'linear-gradient(160deg, #3F4A24, #292B22)',
  'linear-gradient(160deg, #C9A227, #6B7A3D)',
  'linear-gradient(160deg, #73766A, #3F4A24)',
  'linear-gradient(160deg, #D8B56A, #73766A)',
]

function CategoryTile({ category, imageUrl, index = 0 }) {
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const tilt = useTilt()

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="category-tile tilt"
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{ backgroundImage: gradient, ...tilt.style }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="category-tile__image"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
      <span className="category-tile__label">{category.name}</span>
    </Link>
  )
}

export default CategoryTile
