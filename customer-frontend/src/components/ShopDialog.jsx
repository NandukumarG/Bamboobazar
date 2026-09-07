import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

// Native dialogs contain focus and make the background inert while open.
export default function ShopDialog({ children, label, drawer = false, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])
  return createPortal(
    <dialog ref={ref} className={`shop-dialog${drawer ? ' shop-dialog--drawer' : ''}`}
      aria-label={label} onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="shop-dialog__surface">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close dialog" autoFocus>&#215;</button>
        {children}
      </div>
    </dialog>, document.body,
  )
}
