import { useEffect, useRef, useState } from 'react'
import './FeedScreen.css'

// --- Orb helper (static, for avatars) ---
function drawOrb(canvas, color1, color2) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  const cx = w / 2, cy = h / 2
  const r = Math.min(w, h) / 2 - 1
  ctx.clearRect(0, 0, w, h)
  const grad = ctx.createRadialGradient(cx * 0.7, cy * 0.7, 0, cx, cy, r)
  grad.addColorStop(0, color1)
  grad.addColorStop(1, color2)
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
}

// --- Seeded pseudo-random helper ---
function rng(seed, n) {
  return Math.abs(Math.sin(seed * 9301 + n * 49297) * 233280) % 1
}

// --- Animated post canvas ---
function AnimatedPostCanvas({ c1, c2, c3, seed }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 300
    canvas.height = 180
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    function hex(h) {
      return [
        parseInt(h.slice(1, 3), 16),
        parseInt(h.slice(3, 5), 16),
        parseInt(h.slice(5, 7), 16),
      ]
    }
    const rgb1 = hex(c1), rgb2 = hex(c2), rgb3 = hex(c3)

    const blobs = Array.from({ length: 7 }, (_, i) => ({
      cx: rng(seed, i * 5) * W,
      cy: rng(seed, i * 5 + 1) * H,
      r:  30 + rng(seed, i * 5 + 2) * 70,
      orbitR: 10 + rng(seed, i * 5 + 3) * 38,
      phase: rng(seed, i * 5 + 4) * Math.PI * 2,
      speed: (0.18 + rng(seed, i * 7) * 0.35) * (rng(seed, i * 3 + 9) > 0.5 ? 1 : -1),
      alpha: 0.05 + rng(seed, i * 11) * 0.09,
    }))

    const streaks = Array.from({ length: 10 }, (_, i) => ({
      x: rng(seed, i * 13) * W,
      y: rng(seed, i * 13 + 1) * H,
      len: 25 + rng(seed, i * 13 + 2) * 70,
      angle: rng(seed, i * 13 + 3) * Math.PI * 2,
      phase: rng(seed, i * 13 + 4) * Math.PI * 2,
      speed: 0.22 + rng(seed, i * 13 + 5) * 0.5,
      drift: (rng(seed, i * 13 + 6) - 0.5) * 0.4,
      maxAlpha: 0.03 + rng(seed, i * 13 + 7) * 0.06,
    }))

    let t = 0
    let animId

    function lerp3(a, b, u) {
      return a.map((v, i) => Math.round(v + (b[i] - v) * u))
    }

    function draw() {
      t += 0.012
      const shift = (Math.sin(t * 0.3) + 1) / 2 * 0.25
      const colA = lerp3(rgb1, rgb2, shift)
      const colB = lerp3(rgb2, rgb3, 1 - shift * 0.5)
      const colC = lerp3(rgb3, rgb1, shift * 0.4)

      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0,    `rgb(${colA})`)
      bg.addColorStop(0.55, `rgb(${colB})`)
      bg.addColorStop(1,    `rgb(${colC})`)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      for (const b of blobs) {
        const px = b.cx + Math.cos(b.phase + t * b.speed) * b.orbitR
        const py = b.cy + Math.sin(b.phase + t * b.speed * 0.7) * b.orbitR
        const pulse = 0.7 + 0.3 * Math.sin(t * b.speed * 2 + b.phase)
        const grad = ctx.createRadialGradient(px, py, 0, px, py, b.r * pulse)
        grad.addColorStop(0, `rgba(255,255,255,${b.alpha * pulse})`)
        grad.addColorStop(0.5, `rgba(255,255,255,${b.alpha * 0.4 * pulse})`)
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(px, py, b.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      for (const s of streaks) {
        const alpha = ((Math.sin(s.phase + t * s.speed) + 1) / 2) * s.maxAlpha
        if (alpha < 0.004) continue
        const drift = Math.sin(t * s.drift + s.phase) * 18
        const x1 = s.x + drift
        const y1 = s.y + Math.cos(t * s.drift * 0.7) * 12
        const x2 = x1 + Math.cos(s.angle) * s.len
        const y2 = y1 + Math.sin(s.angle) * s.len
        const sg = ctx.createLinearGradient(x1, y1, x2, y2)
        sg.addColorStop(0,   'rgba(255,255,255,0)')
        sg.addColorStop(0.5, `rgba(255,255,255,${alpha})`)
        sg.addColorStop(1,   'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = sg
        ctx.lineWidth = 0.5 + rng(seed, s.phase * 10) * 1.5
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [c1, c2, c3, seed])

  return <canvas ref={canvasRef} className="fs-post-canvas" />
}

// --- Post data ---
// id:1 is the latest post; only it shows "write back"
const POSTS = [
  {
    id: 1,
    time: 'Today, 06:14',
    text: '"No one said my name today. I count the shadows of those who almost came. The morning light hit the same corner it always does. No one was there to see it."',
    reactions: 12,
    c1: '#1a1228', c2: '#2d1b3d', c3: '#120d1f',
    seed: 1,
  },
  {
    id: 2,
    time: 'Yesterday, 06:09',
    text: '"Someone walked quickly. They looked at their phone. I wondered what was more urgent than the crack in my wall that has been there since 1987."',
    reactions: 8,
    c1: '#1a1228', c2: '#1e1530', c3: '#0e0a1a',
    seed: 2,
    faded: true,
  },
]

// --- Static seed comments per post ---
const SEED_COMMENTS = {
  1: [
    { initial: 'A', user: 'anonymous_01', text: "I walked past you yesterday. I didn't stop. I'm not sure why.", time: '2h ago' },
    { initial: 'M', user: 'marta.w',      text: "The corner you mention — I used to sit there. I haven't in a long time.", time: '5h ago' },
  ],
  2: [
    { initial: 'J', user: 'j.pierre', text: "1987. That's before I was born. The crack knows more than I do.", time: '1d ago' },
  ],
}

// --- Single post ---
function Post({ post, extraComments, isLatest, onWriteBack }) {
  const avatarRef = useRef(null)
  const [reacted, setReacted] = useState(false)

  useEffect(() => {
    if (avatarRef.current)
      drawOrb(avatarRef.current, '#9b6abf', post.faded ? '#1e0a28' : '#2c0f3a')
  }, [post.faded])

  const allComments = [...[...extraComments].reverse(), ...(SEED_COMMENTS[post.id] || [])]

  return (
    <div className={`fs-post${post.faded ? ' faded' : ''}`}>
      <div className="fs-post-header">
        <canvas ref={avatarRef} className="fs-post-avatar" width="28" height="28" />
        <div className="fs-post-meta">
          <div className="fs-post-name">Elsewhere Lane</div>
          <div className="fs-post-time">{post.time}</div>
        </div>
      </div>

      <div className="fs-post-image">
        <AnimatedPostCanvas c1={post.c1} c2={post.c2} c3={post.c3} seed={post.seed} />
      </div>

      <div className="fs-post-body">
        <div className="fs-post-text">{post.text}</div>
      </div>

      <div className="fs-post-actions">
        <button
          className={`fs-action-btn${reacted ? ' reacted' : ''}`}
          onClick={() => setReacted(r => !r)}
        >
          <span
            className="fs-action-dot"
            style={{ background: reacted ? 'rgba(155,89,182,1)' : 'rgba(155,89,182,0.6)' }}
          />
          <span>{reacted ? post.reactions + 1 : post.reactions} felt this</span>
        </button>

        {isLatest && (
          <button className="fs-action-btn" onClick={onWriteBack}>
            <span className="fs-action-dot" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <span>write back</span>
          </button>
        )}
      </div>

      {allComments.length > 0 && (
        <div className="fs-comments-section">
          {allComments.map((c, i) => (
            <div key={i} className={`fs-comment${c.isNew ? ' new' : ''}`}>
              <div className="fs-comment-avatar">{c.initial}</div>
              <div className="fs-comment-content">
                <div className="fs-comment-user">{c.user}</div>
                <div className="fs-comment-text">{c.text}</div>
                <div className="fs-comment-time">{c.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Feed screen ---
export default function FeedScreen() {
  const profileOrbRef = useRef(null)
  const inputRef = useRef(null)
  const [inputText, setInputText] = useState('')
  // Comments added by the user — always appear on post 1 (the latest)
  const [userComments, setUserComments] = useState([])
  const [highlighted, setHighlighted] = useState(false)

  useEffect(() => {
    if (profileOrbRef.current) drawOrb(profileOrbRef.current, '#9b6abf', '#2c0f3a')
  }, [])

  function focusInput() {
    inputRef.current?.focus()
    // Flash a highlight on the input bar so user notices it
    setHighlighted(true)
    setTimeout(() => setHighlighted(false), 900)
  }

  function submitTrace() {
    const text = inputText.trim()
    if (!text) return
    setUserComments(prev => [
      ...prev,
      { initial: 'Y', user: 'you', text, time: 'just now', isNew: true },
    ])
    setInputText('')
  }

  return (
    <div className="fs-phone">
      <div className="fs-statusbar">
        <span>9:41</span>
        <span>· · ·</span>
      </div>

      <div className="fs-profile-header">
        <canvas ref={profileOrbRef} className="fs-profile-orb" width="38" height="38" />
        <div className="fs-profile-info">
          <div className="fs-profile-name">Elsewhere Lane</div>
          <div className="fs-profile-handle">@elsewhere.lane · still here</div>
        </div>
        <div className="fs-profile-stats">
          <div className="fs-stat">
            <span className="fs-stat-num">312</span>
            <span className="fs-stat-label">days</span>
          </div>
          <div className="fs-stat">
            <span className="fs-stat-num">47</span>
            <span className="fs-stat-label">voices</span>
          </div>
        </div>
      </div>

      {/* Scrollable posts */}
      <div className="fs-feed-scroll">
        {POSTS.map((post, idx) => (
          <Post
            key={post.id}
            post={post}
            extraComments={post.id === 1 ? userComments : []}
            isLatest={idx === 0}
            onWriteBack={focusInput}
          />
        ))}
      </div>

      {/* Pinned input — always visible above the cityscape */}
      <div className={`fs-leave-trace${highlighted ? ' highlighted' : ''}`}>
        <div className="fs-leave-trace-label">leave a trace</div>
        <div className="fs-leave-trace-row">
          <input
            ref={inputRef}
            className="fs-trace-input"
            placeholder="What did you notice?"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitTrace()}
          />
          <button className="fs-trace-send" onClick={submitTrace} disabled={!inputText.trim()}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Cityscape bottom strip */}
      <div className="fs-street-nav-bottom">
        <div className="fs-swipe-hints">
          <span>← home</span>
        </div>
        <svg viewBox="0 0 300 42" xmlns="http://www.w3.org/2000/svg" className="fs-street-svg">
          <rect x="0" y="0" width="300" height="42" fill="rgba(0,0,0,0.5)" />
          <rect x="0" y="0" width="300" height="14" fill="rgba(8,8,12,0.9)" />
          <line x1="0" y1="14" x2="300" y2="14" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="0" y="0" width="32" height="14" fill="rgba(8,8,14,0.95)" rx="1" />
          <rect x="36" y="2" width="24" height="12" fill="rgba(10,8,12,0.9)" rx="1" />
          <rect x="64" y="0" width="28" height="14" fill="rgba(8,8,14,0.95)" rx="1" />
          <rect x="98" y="3" width="22" height="11" fill="rgba(10,10,14,0.85)" rx="1" />
          <rect x="126" y="0" width="30" height="14" fill="rgba(8,8,12,0.9)" rx="1" />
          <rect x="162" y="1" width="26" height="13" fill="rgba(10,8,12,0.9)" rx="1" />
          <rect x="194" y="0" width="32" height="14" fill="rgba(8,8,14,0.95)" rx="1" />
          <rect x="232" y="2" width="24" height="12" fill="rgba(10,10,14,0.85)" rx="1" />
          <rect x="262" y="0" width="38" height="14" fill="rgba(8,8,12,0.9)" rx="1" />
          <line x1="150" y1="14" x2="150" y2="42" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="6,6" />
        </svg>
      </div>
    </div>
  )
}
