import React from 'react'
import { useInView } from '../hooks/useInView'

export function LazyMount({ children, fallback = null, minHeight = '300px', rootMargin = '300px' }) {
  const [ref, isInView] = useInView({ rootMargin, triggerOnce: true })

  return (
    <div ref={ref} style={{ minHeight: isInView ? undefined : minHeight }}>
      {isInView ? children : fallback}
    </div>
  )
}
