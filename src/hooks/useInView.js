import { useEffect, useRef, useState } from 'react'

export function useInView({ rootMargin = '250px', triggerOnce = true } = {}) {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return undefined

    // Fallback if IntersectionObserver is not supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsInView(false)
        }
      },
      { rootMargin }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [rootMargin, triggerOnce])

  return [ref, isInView]
}
