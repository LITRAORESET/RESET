import './Swoosh.css'

export function SwooshTop({ className = '' }) {
  return <div className={`swoosh swoosh--top ${className}`} aria-hidden="true" />
}

export function SwooshBottom({ className = '' }) {
  return <div className={`swoosh swoosh--bottom ${className}`} aria-hidden="true" />
}
