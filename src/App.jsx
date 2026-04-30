/**
 * App.jsx — Root component
 *
 * FIXES:
 *  - GSAP ticker cleanup: store the ticker fn ref so gsap.ticker.remove works
 *  - ScrollTrigger only registered once (removed duplicate in Overlay.jsx)
 *  - Nav links use lenis.scrollTo() instead of native scrollIntoView
 *  - scroll-root pointer-events stays none only on empty space; sections
 *    re-enable it correctly via CSS
 */

import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Scene from './components/Scene'
import Overlay from './components/Overlay'

gsap.registerPlugin(ScrollTrigger)

export const scrollState = { progress: 0 }

export default function App() {
  const [loadProgress, setLoadProgress] = useState(0)
  const [loaded, setLoaded]             = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const lenisRef   = useRef(null)
  const tickerFnRef = useRef(null)   // FIX: store ticker fn so we can remove it

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    // FIX: keep ref to ticker fn for clean removal on unmount
    tickerFnRef.current = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tickerFnRef.current)
    gsap.ticker.lagSmoothing(0)

    lenis.on('scroll', ({ scroll }) => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      scrollState.progress = total > 0 ? Math.min(1, scroll / total) : 0
      setScrolled(scroll > 80)
    })

    return () => {
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current)
      lenis.destroy()
    }
  }, [])

  // FIX: nav scroll through Lenis so it uses smooth easing, not native scroll
  const scrollToSection = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0, duration: 1.6 })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Loading screen */}
      <div className={`loader ${loaded ? 'hidden' : ''}`}>
        <div className="loader__logo">Sri's <span>Innings</span></div>
        <div className="loader__bar-wrap">
          <div className="loader__bar" style={{ width: `${loadProgress}%` }} />
        </div>
        <div className="loader__sub">Building Chepauk Stadium…</div>
      </div>

      {/* Fixed 3D canvas behind everything */}
      <div id="canvas-root">
        <Scene
          onProgress={setLoadProgress}
          onLoaded={() => setTimeout(() => setLoaded(true), 200)}
        />
      </div>

      {/* Navigation */}
      <nav className="nav">
        <a href="#hero" className="nav__logo"
          onClick={e => scrollToSection(e, 'hero')}>
          Sri<span>.</span>
        </a>
        <ul className="nav__links">
          {[
            { label: 'About',      id: 'about'      },
            { label: 'Experience', id: 'experience' },
            { label: 'Projects',   id: 'projects'   },
            { label: 'Contact',    id: 'contact'    },
          ].map(({ label, id }) => (
            <li key={id}>
              <a href={`#${id}`} onClick={e => scrollToSection(e, id)}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Scrollable overlay */}
      <div id="scroll-root">
        <Overlay />
      </div>

      {/* Scroll hint arrow */}
      <div className={`scroll-hint ${scrolled ? 'hidden' : ''}`}>
        <div className="scroll-hint__label">Scroll</div>
        <div className="scroll-hint__line" />
      </div>
    </>
  )
}
