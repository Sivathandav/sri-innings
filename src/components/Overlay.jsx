/**
 * Overlay.jsx — All portfolio HTML sections
 *
 * FIXES:
 *  - All content replaced with Sri Siva Thandavan's REAL data from 3 CVs
 *  - Removed all fabricated projects (Project Alpha, CrickMetrics, etc.)
 *  - Removed placeholder stats ("5+ years", "40+ projects", "99ms LCP")
 *  - Removed placeholder contacts (yourusername, sri@example.com)
 *  - Added Experience section (3 real internships)
 *  - Skills updated to real stack (Python, Flask/FastAPI, LLM/GenAI…)
 *  - About bio corrected (entry-level, SSN grad, Coimbatore/Chennai)
 *  - gsap.registerPlugin removed — already registered once in App.jsx
 *  - useReveal dependency array fixed: [ref] → []
 *  - Hero selector scoped to ref element, not global document
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ── Reveal on scroll ───────────────────────────────────────────────────
function useReveal(ref) {
  useEffect(() => {
    if (!ref.current) return
    const els = ref.current.querySelectorAll('[data-reveal]')
    const ctx = gsap.context(() => {
      gsap.set(els, { y: 36, opacity: 0 })
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 78%',
        onEnter: () => {
          gsap.to(els, { y: 0, opacity: 1, duration: 0.85, stagger: 0.11, ease: 'power3.out' })
        },
        onLeaveBack: () => {
          gsap.to(els, { y: -18, opacity: 0, duration: 0.35, stagger: 0.05 })
        },
      })
    }, ref.current)
    return () => ctx.revert()
  }, []) // eslint-disable-line
}

// ── Camera travel spacer ───────────────────────────────────────────────
function CameraTravel({ height = '50vh' }) {
  return <div style={{ height, pointerEvents: 'none' }} />
}

// ═══════════════════════════════════════════════════════════════════════
// 1. HERO
// ═══════════════════════════════════════════════════════════════════════
function Hero() {
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return
    // FIX: scoped to ref.current, not global document
    const els = ref.current.querySelectorAll('[data-hero]')
    const ctx = gsap.context(() => {
      gsap.from(els, { y: 55, opacity: 0, duration: 1.1, stagger: 0.14,
        ease: 'expo.out', delay: 0.9 })
    }, ref.current)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="section" id="hero"
      style={{ minHeight:'100vh', alignItems:'flex-end',
        paddingBottom:'clamp(60px,8vh,120px)' }}>
      <div className="hero-content">
        <p className="eyebrow" data-hero>
          Software Engineer · Chennai, India
        </p>

        <h1 className="display" data-hero>
          Sri Siva<br /><em>Thandavan</em>
        </h1>

        <p className="body-large" data-hero style={{ maxWidth:500, marginTop:8 }}>
          Entry-level engineer with a production mindset — building
          {' '}<span style={{ color:'var(--clr-yellow)' }}>AI-powered backends,
          RESTful APIs, and full-stack MERN applications</span>.
          From Chennai. CSK fanatic. Code ships like a last-over chase.
        </p>

        <div className="hero-ctas" data-hero>
          <a href="#projects" className="btn btn-primary">See Projects ↓</a>
          <a href="#contact"  className="btn btn-ghost">Get in Touch</a>
        </div>

        {/* Real, honest stats */}
        <div className="hero-stat-row" data-hero>
          {[
            { num: '3',   label: 'Internships' },
            { num: '5',   label: 'Projects Built' },
            { num: '1',   label: 'IJERT Publication' },
          ].map(s => (
            <div key={s.label}>
              <div className="hero-stat__num">{s.num}</div>
              <div className="hero-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 2. ABOUT
// ═══════════════════════════════════════════════════════════════════════
function About() {
  const ref = useRef()
  useReveal(ref)

  // Real skills from CV
  const techStack = [
    { label: 'Python',     active: true  },
    { label: 'Flask',      active: true  },
    { label: 'FastAPI',    active: true  },
    { label: 'LLM / GenAI', active: true },
    { label: 'React',      active: true  },
    { label: 'Node.js',    active: false },
    { label: 'PostgreSQL', active: false },
    { label: 'MongoDB',    active: false },
    { label: 'Docker',     active: false },
    { label: 'REST APIs',  active: false },
  ]

  return (
    <section ref={ref} className="section" id="about">
      <div className="about-grid">
        <div>
          <p className="eyebrow" data-reveal>Opening Over</p>
          <h2 className="section-title" data-reveal>
            The Player<br />Behind<br />the Code
          </h2>
          <p className="body-large" style={{ marginTop:24 }} data-reveal>
            I'm Sri — a B.Tech Information Technology graduate from
            {' '}<span style={{ color:'var(--clr-yellow)' }}>
              Sri Sivasubramaniya Nadar College of Engineering (SSN), Chennai
            </span>.
            Grown up in Coimbatore, shaped by terminals and Chepauk.
          </p>
          <p className="body-large" style={{ marginTop:14 }} data-reveal>
            I specialise in Python backend development, REST API design, and
            Generative AI integration. I've built production-ready AI apps
            using LLM APIs, and shipped full-stack MERN platforms during
            my internships. Clean code. Secure practices. Zero jank.
          </p>
          <div className="about-tags" data-reveal>
            {techStack.map(t => (
              <span key={t.label} className={`tag ${t.active ? 'active' : ''}`}>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <div data-reveal>
          <div className="glass-card" style={{ padding:'36px 32px' }}>
            <p className="eyebrow" style={{ marginBottom:28 }}>Match Card</p>
            {[
              { label: 'Languages',  val: 'Python · JavaScript  · SQL' },
              { label: 'AI / GenAI', val: 'LLM APIs · RAG · AI Agents · Prompt Engineering '  },
              { label: 'Backend',    val: 'Flask · FastAPI  · REST APIs' },
              { label: 'Frontend',   val: 'React · Vue.js · HTML/CSS' },
              { label: 'Databases',  val: 'PostgreSQL · MongoDB · MySQL · Oracle' },
              { label: 'DevOps',     val: 'Docker · Git · CI/CD · GCP · AWS (In Progress)' },
            ].map(row => (
              <div key={row.label} style={{
                display:'grid', gridTemplateColumns:'110px 1fr',
                gap:14, padding:'12px 0',
                borderBottom:'1px solid var(--clr-border)',
              }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10,
                  textTransform:'uppercase', letterSpacing:'0.1em',
                  color:'var(--clr-yellow)' }}>
                  {row.label}
                </span>
                <span style={{ fontSize:13, color:'var(--clr-muted)', lineHeight:1.55 }}>
                  {row.val}
                </span>
              </div>
            ))}
            {/* Education */}
            <div style={{ marginTop:20 }}>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:10,
                textTransform:'uppercase', letterSpacing:'0.12em',
                color:'var(--clr-yellow)', marginBottom:12 }}>
                Education
              </p>
              <p style={{ fontSize:13, color:'var(--clr-white)', marginBottom:4 }}>
                B.Tech Information Technology — SSN College, Chennai
              </p>
              <p style={{ fontSize:12, color:'var(--clr-muted)', marginBottom:10 }}>
                CGPA 7.1 · Oct 2022 – May 2025
              </p>
              <p style={{ fontSize:13, color:'var(--clr-white)', marginBottom:4 }}>
                Diploma in Information Technology — PSG Polytechnic, Coimbatore
              </p>
              <p style={{ fontSize:12, color:'var(--clr-muted)' }}>
                86% · Aug 2019 – May 2022
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 3. EXPERIENCE  (new section — Sri's 3 real internships)
// ═══════════════════════════════════════════════════════════════════════
const EXPERIENCE = [
  {
    role:    'Full Stack Developer Intern',
    company: 'Cuvette Tech Pvt. Ltd.',
    sub:     'Mentored by IIT Kharagpur, Amazon & Google Alumni',
    period:  'Jul 2025 – Dec 2025',
    location:'Bangalore',
    bullets: [
      'Built TroubleTracker — a microservices ticketing platform (React, Node.js, Express, MongoDB, JWT) with structured ticket management and performance dashboards.',
      'Developed TableEase — a full-stack reservation system with automated conflict resolution; optimised NoSQL query latency by 35% via indexing and caching.',
      'Completed a 6-month Full Stack + DSA program applying OOP, REST API design, and clean code standards throughout.',
    ],
  },
  {
    role:    'Automation & Python Developer',
    company: 'SocialSync Automation',
    sub:     'Remote · United Kingdom',
    period:  'Feb 2025 – Apr 2025',
    location:'Remote',
    bullets: [
      'Engineered Python-based REST API integration workflows, reducing manual data processing by ~70% — directly applicable to CRM data pipeline automation.',
      'Managed task orchestration in Unix/Linux environments, maintaining 99.9% uptime for production automation modules.',
    ],
  },
  {
    role:    'Full Stack Developer Intern',
    company: 'National Informatics Centre (GePNIC)',
    sub:     '',
    period:  'Jun 2024 – Jul 2024',
    location:'Chennai, TN',
    bullets: [
      'Developed a Python + PostgreSQL digital archival system processing 10,000+ enterprise records with ETL-like data pipelines.',
      'Built and documented REST APIs, applied OOP principles, and deployed via Docker with Git-based CI/CD.',
    ],
  },
]

function Experience() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section ref={ref} className="section" id="experience"
      style={{ flexDirection:'column', alignItems:'flex-start', gap:48 }}>
      <div data-reveal>
        <p className="eyebrow">Power Play</p>
        <h2 className="section-title">Experience</h2>
      </div>

      <div className="exp-timeline" data-reveal>
        {EXPERIENCE.map((job, i) => (
          <div key={i} className="exp-card">
            <div className="exp-card__left">
              <div className="exp-card__period">{job.period}</div>
              <div className="exp-card__location">{job.location}</div>
            </div>
            <div className="exp-card__divider">
              <div className="exp-card__dot" />
              {i < EXPERIENCE.length - 1 && <div className="exp-card__line" />}
            </div>
            <div className="exp-card__right">
              <div className="exp-card__role">{job.role}</div>
              <div className="exp-card__company">{job.company}</div>
              {job.sub && <div className="exp-card__sub">{job.sub}</div>}
              <ul className="exp-card__bullets">
                {job.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 4. PROJECTS  (Sri's 5 real projects + this portfolio)
// ═══════════════════════════════════════════════════════════════════════
const PROJECTS = [
  {
    num:   '01',
    title: 'ATS Pro',
    desc:  'LLM-powered resume optimiser. Analyses job descriptions and generates ATS-optimised resumes using the Claude API with iterative prompt engineering and smart caching for single-API-call efficiency.',
    stack: ['Python', 'Flask', 'Claude API', 'Prompt Engineering'],
    year:  '2025',
    link:  'https://github.com/Sivathandav',
  },
  {
    num:   '02',
    title: 'FormSaathi',
    desc:  'Conversational AI assistant for GST registration targeting India\'s MSME segment. Integrates LLM-driven dialogue, document upload, and session persistence. Demonstrated at VibeCon India (Y Combinator\'s Startup School India).',
    stack: ['Python', 'FastAPI', 'Generative AI', 'LLM'],
    year:  '2025',
    link:  'https://github.com/Sivathandav',
  },
  {
    num:   '03',
    title: 'TroubleTracker',
    desc:  'Centralised support platform with JWT-based secure authentication. Features structured ticket management, real-time status tracking, and performance dashboards — built during Cuvette Tech internship.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    year:  '2025',
    link:  'https://github.com/Sivathandav',
  },
  {
    num:   '04',
    title: 'TableEase',
    desc:  'Scalable restaurant reservation platform with automated conflict resolution. Optimised NoSQL queries and indexing reduced database latency by 35% under load — built during Cuvette Tech internship.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker'],
    year:  '2025',
    link:  'https://github.com/Sivathandav',
  },
  {
    num:   '05',
    title: 'VoiceCraft',
    desc:  'Automated media processing backend: translates English videos into 8+ Indian regional languages and generates dubbed audio via EdgeTTS and ffmpeg — modular, single-user scalable architecture.',
    stack: ['Python', 'Flask', 'ffmpeg', 'EdgeTTS', 'REST API'],
    year:  '2024',
    link:  'https://github.com/Sivathandav',
  },
  {
    num:   '06',
    title: "Sri's Innings",
    desc:  "You're looking at it. Chepauk Stadium procedurally reconstructed in Three.js — no imported 3D assets. Scroll-driven cinematic camera, GSAP animations, Bloom post-processing. The portfolio IS the project.",
    stack: ['React', 'Three.js / R3F', 'GSAP', 'Lenis'],
    year:  '2025',
    link:  'https://github.com/Sivathandav',
  },
]

function Projects() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section ref={ref} className="section" id="projects"
      style={{ flexDirection:'column', alignItems:'flex-start', gap:48 }}>
      <div data-reveal>
        <p className="eyebrow">Middle Overs</p>
        <h2 className="section-title">Selected<br />Deliveries</h2>
      </div>

      <div className="projects-grid" data-reveal>
        {PROJECTS.map(p => (
          <a key={p.num} className="project-card"
            href={p.link} target="_blank" rel="noreferrer"
            style={{ textDecoration:'none', display:'block' }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:4 }}>
              <div className="project-card__num">/{p.num}</div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10,
                color:'var(--clr-muted)', letterSpacing:'0.1em' }}>{p.year}</span>
            </div>
            <div className="project-card__title">{p.title}</div>
            <p className="project-card__desc">{p.desc}</p>
            <div className="project-card__stack">
              {p.stack.map(s => <span key={s} className="stack-chip">{s}</span>)}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 5. SKILLS  (Sri's actual skill set from CVs)
// ═══════════════════════════════════════════════════════════════════════
const SKILLS = [
  { label: 'Python (Advanced)',          pct: 90 },
  { label: 'LLM / Generative AI',        pct: 85 },
  { label: 'REST APIs (Flask / FastAPI)', pct: 84 },
  { label: 'SQL / PostgreSQL',            pct: 82 },
  { label: 'JavaScript / React',          pct: 80 },
  { label: 'Node.js / Express',           pct: 83 },
  { label: 'Docker / DevOps',             pct: 79 },
]

function Skills() {
  const ref     = useRef()
  const barsRef = useRef([])
  useReveal(ref)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 72%',
        onEnter: () => {
          barsRef.current.forEach(el => { if (el) el.classList.add('animate') })
          gsap.from(ref.current.querySelectorAll('[data-skill]'), {
            y: 28, opacity: 0, duration: 0.65, stagger: 0.06, ease: 'power2.out',
          })
        },
      })
    }, ref.current)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="section" id="skills">
      <div className="skills-layout">
        <div>
          <p className="eyebrow" data-reveal>Death Overs</p>
          <h2 className="section-title" data-reveal>The<br />Skill Set</h2>
          <p className="body-large" style={{ marginTop:22 }} data-reveal>
            Built through three internships and five shipped projects.
            I optimise for what matters:{' '}
            <span style={{ color:'var(--clr-yellow)' }}>
              clean architecture, reliable APIs, and AI that actually works.
            </span>
          </p>

          <div style={{ marginTop:36, display:'flex', gap:14, flexWrap:'wrap' }} data-reveal>
            {['Open to Work', 'Remote / Hybrid', 'Chennai · India'].map(badge => (
              <span key={badge} style={{
                fontFamily:'var(--font-mono)', fontSize:10,
                letterSpacing:'0.1em', textTransform:'uppercase',
                padding:'7px 14px',
                border:'1px solid var(--clr-yellow)',
                borderRadius:2, color:'var(--clr-yellow)',
              }}>{badge}</span>
            ))}
          </div>

          {/* Certifications */}
          <div style={{ marginTop:36 }} data-reveal>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:10,
              textTransform:'uppercase', letterSpacing:'0.12em',
              color:'var(--clr-yellow)', marginBottom:14 }}>
              Certifications & Publications
            </p>
            {[
              { name:'AWS Solutions Architect Associate', org:'In Progress · 2026' },
              { name:'MERN - Full Satck Developer', org:'Completed · 2025' },
              { name:'Forecasting Vehicle Price using ML', org:'Published · IJERT' },
            ].map(c => (
              <div key={c.name} style={{ display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', padding:'10px 0',
                borderBottom:'1px solid var(--clr-border)', gap:12 }}>
                <span style={{ fontSize:13, color:'var(--clr-white)' }}>{c.name}</span>
                <span style={{ fontSize:11, color:'var(--clr-muted)',
                  fontFamily:'var(--font-mono)', whiteSpace:'nowrap', flexShrink:0 }}>
                  {c.org}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="skill-bars">
          {SKILLS.map((skill, i) => (
            <div key={skill.label} data-skill>
              <div className="skill-row__label">
                <span style={{ color:'var(--clr-white)' }}>{skill.label}</span>
                <span>{skill.pct}%</span>
              </div>
              <div className="skill-row__track">
                <div ref={el => barsRef.current[i] = el}
                  className="skill-row__fill"
                  style={{ width:`${skill.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 6. CONTACT  (Sri's real links)
// ═══════════════════════════════════════════════════════════════════════
function Contact() {
  const ref = useRef()
  useReveal(ref)

  return (
    <section ref={ref} className="section" id="contact">
      <div className="contact-layout">
        <div>
          <p className="eyebrow" data-reveal>Last Ball</p>
          <h2 className="section-title" data-reveal>
            Let's Build<br />Something<br />
            <em style={{ fontFamily:'var(--font-display)', fontStyle:'italic',
              color:'var(--clr-yellow)' }}>Real</em>
          </h2>
          <p className="body-large" style={{ marginTop:22 }} data-reveal>
            Whether it's a backend system, an AI product, or a tight
            deadline — I'm ready to open the batting. Drop me a message.
          </p>
          <div style={{ marginTop:32, display:'flex', gap:14, flexWrap:'wrap' }} data-reveal>
            <a href="mailto:srisivathandavan@gmail.com" className="btn btn-primary">
              Email Me →
            </a>
            <a href="https://linkedin.com/in/sri-siva-thandavan"
              className="btn btn-ghost" target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>

        <div className="contact-links" data-reveal>
          {[
            {
              icon: '⚡',
              label: 'GitHub',
              href: 'https://github.com/Sivathandav',
              sub: 'github.com/Sivathandav',
            },
            {
              icon: '💼',
              label: 'LinkedIn',
              href: 'https://linkedin.com/in/sri-siva-thandavan',
              sub: 'linkedin.com/in/sri-siva-thandavan',
            },
            {
              icon: '✉️',
              label: 'Email',
              href: 'mailto:srisivathandavan@gmail.com',
              sub: 'srisivathandavan@gmail.com',
            },
          ].map(link => (
            <a key={link.label} className="contact-link"
              href={link.href} target="_blank" rel="noreferrer">
              <span className="contact-link__icon">{link.icon}</span>
              <div>
                <div style={{ color:'var(--clr-white)', marginBottom:2 }}>{link.label}</div>
                <div style={{ fontSize:10, opacity:0.5 }}>{link.sub}</div>
              </div>
              <span style={{ marginLeft:'auto', opacity:0.4 }}>↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <span>© 2026 Sri Siva Thandavan G · Chennai</span>
      <span style={{ color:'var(--clr-yellow)', fontFamily:'var(--font-mono)', fontSize:10 }}>
        React · Three.js · GSAP · Lenis
      </span>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Master Overlay
// ═══════════════════════════════════════════════════════════════════════
export default function Overlay() {
  return (
    <>
      {/* Hero — camera at aerial approach */}
      <Hero />

      <CameraTravel height="45vh" />

      {/* About — camera descends to stands */}
      <About />

      <CameraTravel height="35vh" />

      {/* Experience — camera at mid-wicket */}
      <Experience />

      <CameraTravel height="30vh" />

      {/* Projects — camera sweeps outfield */}
      <Projects />

      <CameraTravel height="30vh" />

      {/* Skills — camera at mid-on */}
      <Skills />

      <CameraTravel height="30vh" />

      {/* Contact — camera high stand + aerial */}
      <Contact />

      <Footer />
    </>
  )
}
