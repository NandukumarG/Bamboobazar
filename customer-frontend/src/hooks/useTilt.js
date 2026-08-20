import { useRef, useState } from 'react'

const MAX_TILT_DEG = 9

// Pointer-tracked 3D tilt: rotates the element toward the cursor and lifts
// it slightly, then eases back flat on mouse leave. CSS handles the
// prefers-reduced-motion override (see .tilt in index.css), so this hook
// doesn't need to branch on that itself.
export function useTilt() {
  const ref = useRef(null)
  const [style, setStyle] = useState(undefined)

  const onMouseMove = (event) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * MAX_TILT_DEG * 2
    const rotateX = (0.5 - y) * MAX_TILT_DEG * 2

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)`,
    })
  }

  const onMouseLeave = () => setStyle(undefined)

  return { ref, style, onMouseMove, onMouseLeave }
}
