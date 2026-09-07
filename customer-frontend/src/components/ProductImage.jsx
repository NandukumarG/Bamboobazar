import { useState } from 'react'

export default function ProductImage({ src, name, loading = 'lazy' }) {
  const [failed, setFailed] = useState(null)
  return src && failed !== src
    ? <img src={src} alt={name} loading={loading} decoding="async" onError={() => setFailed(src)} />
    : <span className="image-fallback"><span aria-hidden="true">&#10035;</span><small>{name}</small></span>
}
