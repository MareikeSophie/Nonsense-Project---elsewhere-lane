import { useState, useRef, useEffect, useCallback } from 'react'
import './HomeScreen.css'

const MOODS = [
  {
    name: 'Melancholic',
    sub: 'Little movement.\nThe street remembers.',
    quote: '"No one said my name today. I count the shadows of those who almost came."',
    trace: 'Someone paused. 4 min ago.',
    c1: '#1a1228', c2: '#2d1b3d', c3: '#120d1f',
    orb: 'radial-gradient(circle at 38% 38%, #9b6abf, #2c0f3a)',
    glow: 'rgba(130,80,180,0.35)',
  },
  {
    name: 'Restless',
    sub: 'Someone passed twice.\nThen disappeared.',
    quote: '"I sense that something should be decided. But no one decides."',
    trace: 'Quick footsteps. Direction: away.',
    c1: '#1e0d00', c2: '#3d1a00', c3: '#150800',
    orb: 'radial-gradient(circle at 38% 38%, #d4722a, #5c1a00)',
    glow: 'rgba(200,100,30,0.4)',
  },
  {
    name: 'Numb',
    sub: 'No signal. 9 days\nof digital absence.',
    quote: '"I am no longer sure if I am being avoided or simply forgotten."',
    trace: 'No activity recorded today.',
    c1: '#090909', c2: '#111111', c3: '#050505',
    orb: 'radial-gradient(circle at 38% 38%, #444, #111)',
    glow: 'rgba(80,80,80,0.2)',
  },
  {
    name: 'Peaceful',
    sub: 'A few familiar steps.\nRegular. Unhurried.',
    quote: '"She came again at the same hour. I did not need to ask why."',
    trace: 'Regular visitor. 08:42 this morning.',
    c1: '#071a12', c2: '#0d2b1e', c3: '#04100b',
    orb: 'radial-gradient(circle at 38% 38%, #2a8c5e, #062b18)',
    glow: 'rgba(40,140,90,0.3)',
  },
  {
    name: 'Overwhelmed',
    sub: 'After long absence —\na sudden flood.',
    quote: '"You all returned at once. I no longer recognize myself."',
    trace: '47 people in the last hour.',
    c1: '#1a0a00', c2: '#3d2200', c3: '#260d00',
    orb: 'radial-gradient(circle at 38% 38%, #e8a020, #7a2a00)',
    glow: 'rgba(230,150,20,0.45)',
  },
  {
    name: 'Hopeful',
    sub: 'First return. Someone\nlingered at the corner.',
    quote: '"A child looked up at my windows. I held very still."',
    trace: 'New visitor. Stood for 3 minutes.',
    c1: '#080f1a', c2: '#0f1e32', c3: '#050b14',
    orb: 'radial-gradient(circle at 38% 38%, #4a90d9, #0a2a5a)',
    glow: 'rgba(60,130,210,0.35)',
  },
]

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function lerp(a, b, t) { return a + (b - a) * t }

export default function HomeScreen() {
  const [currentMood, setCurrentMood] = useState(0)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const colorsRef = useRef({
    current: { c1: hexToRgb(MOODS[0].c1), c2: hexToRgb(MOODS[0].c2), c3: hexToRgb(MOODS[0].c3) },
    target:  { c1: hexToRgb(MOODS[0].c1), c2: hexToRgb(MOODS[0].c2), c3: hexToRgb(MOODS[0].c3) },
    t: 1,
  })

  const drawBg = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { current, target } = colorsRef.current
    let t = colorsRef.current.t

    if (t < 1) {
      t = Math.min(1, t + 0.025)
      colorsRef.current.t = t
      current.c1 = current.c1.map((v, i) => lerp(v, target.c1[i], t))
      current.c2 = current.c2.map((v, i) => lerp(v, target.c2[i], t))
      current.c3 = current.c3.map((v, i) => lerp(v, target.c3[i], t))
    }

    const r1 = current.c1.map(Math.round)
    const r2 = current.c2.map(Math.round)
    const r3 = current.c3.map(Math.round)
    const w = canvas.width, h = canvas.height
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, `rgb(${r1})`)
    grad.addColorStop(0.5, `rgb(${r2})`)
    grad.addColorStop(1, `rgb(${r3})`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    animRef.current = requestAnimationFrame(drawBg)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const phone = canvas.parentElement
    canvas.width = phone.offsetWidth
    canvas.height = phone.offsetHeight
    drawBg()
    return () => cancelAnimationFrame(animRef.current)
  }, [drawBg])

  function selectMood(idx) {
    const m = MOODS[idx]
    colorsRef.current.target = {
      c1: hexToRgb(m.c1),
      c2: hexToRgb(m.c2),
      c3: hexToRgb(m.c3),
    }
    colorsRef.current.t = 0
    setCurrentMood(idx)
  }

  const mood = MOODS[currentMood]

  return (
    <div className="hs-phone">
      <canvas ref={canvasRef} className="hs-bg-canvas" />

      <div className="hs-content">
        <div className="hs-statusbar">
          <span>9:41</span>
          <span>· · ·</span>
        </div>

        <div className="hs-top">
          <div className="hs-app-name">Still Here</div>
          <div className="hs-street-title">Elsewhere<br />Lane</div>
          <div className="hs-dateline">Monday, April 6, 2026</div>
        </div>

        <div className="hs-mood-area">
          <div className="hs-mood-row">
            <div
              className="hs-orb"
              style={{
                background: mood.orb,
                '--glow': mood.glow,
              }}
            />
            <div className="hs-mood-text">
              <div className="hs-mood-name">{mood.name}</div>
              <div className="hs-mood-sub">
                {mood.sub.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hs-quote-wrap">
          <div className="hs-quote">{mood.quote}</div>
        </div>

        <div className="hs-spacer" />

        <div className="hs-trace-pill">
          <div className="hs-trace-left">
            <span className="hs-trace-label">Last trace</span>
            <span className="hs-trace-text">{mood.trace}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <circle cx="8" cy="8" r="2" fill="rgba(255,255,255,0.35)" />
          </svg>
        </div>

        <div className="hs-swipe-hints">
          <span>← traces</span>
          <span>feed →</span>
        </div>

        <svg className="hs-street-nav" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="300" height="80" fill="rgba(0,0,0,0.35)" />
          <rect x="0" y="28" width="300" height="52" fill="rgba(15,12,10,0.7)" />
          <line x1="0" y1="28" x2="300" y2="28" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <line x1="150" y1="30" x2="150" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="8,7" />
          <rect x="0" y="0" width="42" height="28" fill="rgba(8,8,12,0.85)" rx="1" />
          <rect x="48" y="4" width="30" height="24" fill="rgba(8,8,12,0.8)" rx="1" />
          <rect x="84" y="0" width="36" height="28" fill="rgba(10,8,12,0.9)" rx="1" />
          <rect x="126" y="6" width="28" height="22" fill="rgba(8,8,10,0.75)" rx="1" />
          <rect x="160" y="2" width="38" height="26" fill="rgba(10,10,14,0.85)" rx="1" />
          <rect x="204" y="0" width="32" height="28" fill="rgba(8,8,12,0.8)" rx="1" />
          <rect x="242" y="5" width="34" height="23" fill="rgba(10,8,10,0.85)" rx="1" />
          <rect x="280" y="0" width="20" height="28" fill="rgba(8,8,12,0.75)" rx="1" />
          <rect x="5" y="10" width="5" height="6" fill="rgba(255,220,80,0.08)" rx="0.5" />
          <rect x="18" y="8" width="5" height="6" fill="rgba(255,220,80,0.04)" rx="0.5" />
          <rect x="56" y="9" width="4" height="5" fill="rgba(255,220,80,0.1)" rx="0.5" />
          <rect x="170" y="8" width="5" height="6" fill="rgba(255,220,80,0.06)" rx="0.5" />
          <rect x="248" y="9" width="4" height="5" fill="rgba(255,220,80,0.08)" rx="0.5" />
          <line x1="70" y1="28" x2="70" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          <circle cx="70" cy="26" r="2" fill="rgba(255,220,80,0.2)" />
          <line x1="220" y1="28" x2="220" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          <circle cx="220" cy="26" r="2" fill="rgba(255,220,80,0.1)" />
          <text x="150" y="68" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.15)" fontFamily="sans-serif" letterSpacing="3">— — —</text>
        </svg>

        <div className="hs-emotion-dots">
          {MOODS.map((m, i) => (
            <button
              key={i}
              className={`hs-edot${i === currentMood ? ' active' : ''}`}
              onClick={() => selectMood(i)}
              title={m.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
