import React, { useState } from 'react'
import { Menu, Satellite, X } from 'lucide-react'

export function Nav() {
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <nav className="nav" aria-label="Main Navigation">
      <a className="brand" href="#overview" aria-label="Fieldnote Nepal Home">
        <span className="brand-mark">
          <Satellite size={16} aria-hidden="true" />
        </span>
        <span>
          FIELDNOTE
          <br />
          <i>NEPAL / 01</i>
        </span>
      </a>

      <div
        id="primary-navigation"
        className={`nav-links ${mobileNav ? 'is-open' : ''}`}
        role="navigation"
      >
        <a href="#overview" onClick={() => setMobileNav(false)}>OVERVIEW</a>
        <a href="#map" onClick={() => setMobileNav(false)}>MAP</a>
        <a href="#vantor" onClick={() => setMobileNav(false)}>VANTOR</a>
        <a href="#satellite" onClick={() => setMobileNav(false)}>PLANET</a>
        <a href="#sentinel" onClick={() => setMobileNav(false)}>SENTINEL-2</a>
        <a href="#impact" onClick={() => setMobileNav(false)}>IMPACT</a>
        <a href="#quality" onClick={() => setMobileNav(false)}>QUALITY</a>
        <a href="#understanding" onClick={() => setMobileNav(false)}>GUIDE</a>
        <a href="#data" onClick={() => setMobileNav(false)}>DATA</a>
      </div>

      <div className="nav-right">
        <span className="event-badge">
          <i aria-hidden="true" /> EVENT: 26 AUG 2026
        </span>
        <button
          className="menu-btn"
          onClick={() => setMobileNav(!mobileNav)}
          aria-label="Toggle navigation"
          aria-expanded={mobileNav}
          aria-controls="primary-navigation"
        >
          {mobileNav ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </nav>
  )
}
