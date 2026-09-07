import { useEffect, useRef, useState } from 'react'

const SLATS = Array.from({ length: 28 }, (_, index) => index)
const FINISHES = [{ id: 'natural', name: 'Natural', color: '#c8aa6b' }, { id: 'forest', name: 'Forest', color: '#687c4b' }, { id: 'smoked', name: 'Smoked', color: '#625847' }]
export default function BambooScene() {
  const [rotation, setRotation] = useState(25)
  const [form, setForm] = useState('vessel')
  const [finish, setFinish] = useState('natural')
  const drag = useRef(null)
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  const move = event => {
    if (!drag.current) return
    const next = ((drag.current.angle + (event.clientX - drag.current.x) * 0.8) % 360 + 360) % 360
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => setRotation(Math.round(next)))
  }
  const stop = () => { drag.current = null }
  return (
    <section className="material-studio" aria-labelledby="studio-title" data-form={form} data-finish={finish}>
      <div className="material-studio__copy">
        <span className="eyebrow">The interactive material studio</span>
        <h2 id="studio-title">One material.<br /><em>So many possibilities.</em></h2>
        <p>A form, a finish, a fresh perspective. Play with our bamboo-inspired design study and see where your curiosity takes you.</p>
        <fieldset className="studio-options"><legend>01 / Choose a form</legend><div className="studio-segments">{['vessel', 'lantern', 'bowl'].map(value => <button key={value} aria-pressed={form === value} onClick={() => setForm(value)}>{value}</button>)}</div></fieldset>
        <fieldset className="studio-options"><legend>02 / Find your finish</legend><div className="studio-swatches">{FINISHES.map(value => <button key={value.id} aria-pressed={finish === value.id} onClick={() => setFinish(value.id)}><i style={{ background: value.color }} aria-hidden="true" />{value.name}</button>)}</div></fieldset>
        <label className="studio-control" htmlFor="sculpture-rotation"><span>03 / Turn it around <output>{rotation}&#176;</output></span><input id="sculpture-rotation" type="range" min="0" max="360" value={rotation} onChange={event => setRotation(Number(event.target.value))} aria-valuetext={`${rotation} degrees`} /></label>
        <div className="studio-footnote"><small>Concept study &middot; Not a product configurator</small><button onClick={() => { cancelAnimationFrame(frame.current); setRotation(25); setForm('vessel'); setFinish('natural') }}>Reset</button></div>
      </div>
      <div className="sculpture-stage" onPointerDown={event => { if (event.button !== 0) return; drag.current = { x: event.clientX, angle: rotation }; event.currentTarget.setPointerCapture(event.pointerId) }} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
        <span className="studio-stage-label">FORM EXPLORATION <span>0{['vessel','lantern','bowl'].indexOf(form) + 1}</span></span>
        <div className="studio-orbit" aria-hidden="true" /><div className="sculpture-shadow" />
        <div className="sculpture" role="img" aria-label={`Three-dimensional bamboo ${form} in ${finish} finish`} style={{ '--turn': `${rotation}deg` }}>
          {SLATS.map(index => <i key={index} className="sculpture__slat" style={{ '--angle': `${index * 360 / SLATS.length}deg` }} />)}
          <i className="sculpture__ring sculpture__ring--top" /><i className="sculpture__ring sculpture__ring--bottom" /><i className="sculpture__light" />
        </div>
        <span className="sculpture-caption">&#8596; DRAG TO EXPLORE &middot; OR USE THE SLIDER</span>
      </div>
    </section>
  )
}
