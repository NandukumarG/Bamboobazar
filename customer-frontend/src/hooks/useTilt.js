import { useEffect, useRef } from 'react'

// Update at most once per animation frame, without rendering React on pointer movement.
export function useTilt() {
  const ref = useRef(null)
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])
  const onMouseMove = (event) => {
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
    const { clientX, clientY } = event
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width - 0.5
      const y = (clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(1000px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-3px)`
    })
  }
  const onMouseLeave = () => {
    cancelAnimationFrame(frame.current)
    if (ref.current) ref.current.style.transform = ''
  }
  return { ref, onMouseMove, onMouseLeave }
}
