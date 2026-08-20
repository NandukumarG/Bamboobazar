import { useReveal } from '../hooks/useReveal'

// Wraps a section so it rises into place (3D tilt + fade) the first time it
// scrolls into view. `delay` staggers multiple Reveals in the same section.
// Renders as `as` (default div) and passes through any other props (id, etc.)
// so it can stand in for the section itself instead of double-wrapping it.
function Reveal({ children, className = '', delay = 0, as: Tag = 'div', ...rest }) {
  const { ref, visible } = useReveal()

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Reveal
