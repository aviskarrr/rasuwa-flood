import React from 'react'

export function SectionLabel({ children, number }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      {children}
    </div>
  )
}
