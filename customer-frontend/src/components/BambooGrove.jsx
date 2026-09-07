import { useEffect, useRef, useState } from 'react'
import './BambooGrove.css'

const TREES = [
  { left: 8, height: 77, depth: -65, lean: -9 },
  { left: 23, height: 94, depth: 15, lean: -5 },
  { left: 41, height: 83, depth: -40, lean: 4 },
  { left: 59, height: 100, depth: 45, lean: 2 },
  { left: 77, height: 86, depth: -20, lean: 9 },
  { left: 92, height: 72, depth: -80, lean: 13 },
]
const PARTICLES = Array.from({ length: 9 }, (_, index) => index)

// Only visible scenes listen for scrolling; pointer/scroll updates share one frame.
function useNatureMotion(ref, paused) {
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let frame = 0
    let pointerX = 0
    let pointerY = 0
    let listening = false
    const paint = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)))
      element.style.setProperty('--scroll-turn', `${(progress - 0.5) * 22}deg`)
      element.style.setProperty('--scroll-rise', `${(progress - 0.5) * -65}px`)
      element.style.setProperty('--pointer-x', `${pointerX * 7}deg`)
      element.style.setProperty('--pointer-y', `${pointerY * -4}deg`)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint) }
    const move = event => {
      if (event.pointerType === 'touch') return
      const rect = element.getBoundingClientRect()
      pointerX = (event.clientX - rect.left) / rect.width - 0.5
      pointerY = (event.clientY - rect.top) / rect.height - 0.5
      schedule()
    }
    const resetPointer = () => { pointerX = 0; pointerY = 0; schedule() }
    const detach = () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', resetPointer)
      cancelAnimationFrame(frame)
      frame = 0
      listening = false
    }
    const sync = () => {
      const running = visible && !document.hidden && !paused && !preference.matches
      element.dataset.moving = String(running)
      if (running && !listening) {
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule)
        element.addEventListener('pointermove', move, { passive: true })
        element.addEventListener('pointerleave', resetPointer)
        listening = true
        schedule()
      } else if (!running) detach()
      if (preference.matches) {
        for (const property of ['--scroll-turn', '--scroll-rise', '--pointer-x', '--pointer-y']) element.style.removeProperty(property)
      }
    }
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }) : null
    if (observer) observer.observe(element)
    else { visible = true; sync() }
    preference.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      detach()
      observer?.disconnect()
      preference.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [ref, paused])
}

export default function BambooGrove({ ambient = false }) {
  const ref = useRef(null)
  const [paused, setPaused] = useState(false)
  useNatureMotion(ref, paused)
  return (
    <section ref={ref} className={ambient ? 'nature-scene nature-scene--ambient' : 'nature-scene bamboo-grove'} aria-label={ambient ? 'Animated nature backdrop' : 'Interactive bamboo grove'}>
      <div className="nature-atmosphere" aria-hidden="true">
        <div className="nature-glow nature-glow--one" /><div className="nature-glow nature-glow--two" />
        <div className="nature-orbit" />
        {PARTICLES.map(index => <i className="nature-mote" key={index} style={{ '--i': index, left: `${8 + index * 10}%`, top: `${15 + (index * 19) % 70}%` }} />)}
      </div>
      {!ambient && <>
        <div className="grove-copy"><span className="eyebrow">A moment in nature</span><h2>Rooted in stillness.<br /><em>Alive with movement.</em></h2><p>Step into our little bamboo grove. Scroll to explore its layers, or move your cursor and watch the perspective shift.</p><span className="grove-scroll-hint" aria-hidden="true">&#8595; SCROLL TO WANDER</span></div>
        <div className="grove-window" aria-hidden="true">
          <div className="grove-sun" />
          <div className="grove-trees">
            {TREES.map((tree, index) => <div className="bamboo-tree" key={index} style={{ left: `${tree.left}%`, height: `${tree.height}%`, '--depth': `${tree.depth}px`, '--lean': `${tree.lean}deg`, '--i': index }}>
              <div className="bamboo-tree__sway"><div className="bamboo-tree__stem" />
                {[0, 1, 2].map(branch => <div className="bamboo-branch" key={branch} style={{ '--branch': branch, '--side': branch % 2 ? -1 : 1 }}>
                  {[0, 1, 2, 3, 4].map(leaf => <i className="bamboo-leaf" key={leaf} style={{ '--leaf': leaf }} />)}
                </div>)}
              </div>
            </div>)}
          </div>
          <div className="grove-ground" /><span className="grove-caption">BAMBOO / A LIVING MATERIAL</span>
        </div>
      </>}
      <button className="nature-motion-toggle" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button>
    </section>
  )
}
