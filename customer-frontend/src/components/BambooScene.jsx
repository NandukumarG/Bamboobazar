import { useState } from 'react'

const SLATS = Array.from({ length: 28 }, (_, index) => index)
export default function BambooScene() {
  const [rotation, setRotation] = useState(25)
  return (
    <section className="material-studio" aria-labelledby="studio-title">
      <div className="material-studio__copy">
        <span className="eyebrow">The material, reimagined</span>
        <h2 id="studio-title">A little nature.<br /><em>A new perspective.</em></h2>
        <p>Simple forms. Beautiful texture. Explore a sculptural study inspired by the natural rhythm of bamboo.</p>
        <label className="studio-control" htmlFor="sculpture-rotation">
          <span>Turn the sculpture <span aria-hidden="true">&#8596;</span></span>
          <input id="sculpture-rotation" type="range" min="0" max="360" value={rotation} onChange={event => setRotation(Number(event.target.value))} aria-valuetext={`${rotation} degrees`} />
        </label>
        <small>Interactive design study &middot; Inspired by bamboo</small>
      </div>
      <div className="sculpture-stage" role="img" aria-label="Three-dimensional open bamboo vessel made of golden vertical slats">
        <div className="sculpture-shadow" />
        <div className="sculpture" style={{ '--turn': `${rotation}deg` }}>
          {SLATS.map(index => <i key={index} className="sculpture__slat" style={{ '--angle': `${index * 360 / SLATS.length}deg` }} />)}
          <i className="sculpture__ring sculpture__ring--top" /><i className="sculpture__ring sculpture__ring--bottom" />
        </div>
        <span className="sculpture-caption">01 / FORM & TEXTURE</span>
      </div>
    </section>
  )
}
