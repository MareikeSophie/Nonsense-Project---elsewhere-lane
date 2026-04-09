import { useState, useRef } from 'react'
import HomeScreen from './screens/HomeScreen'
import FeedScreen from './screens/FeedScreen'
import './App.css'

// Screens in order: 0 = Home, 1 = Feed
const SCREENS = ['home', 'feed']

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(null)
  const PHONE_WIDTH = 300

  function onPointerDown(e) {
    startXRef.current = e.clientX
    setIsDragging(true)
    setDragX(0)
  }

  function onPointerMove(e) {
    if (!isDragging || startXRef.current === null) return
    const delta = e.clientX - startXRef.current
    const canGoLeft = currentIndex < SCREENS.length - 1
    const canGoRight = currentIndex > 0
    if (delta < 0 && canGoLeft) setDragX(delta)
    else if (delta > 0 && canGoRight) setDragX(delta)
    else setDragX(delta * 0.15)
  }

  function onPointerUp() {
    if (!isDragging) return
    setIsDragging(false)
    const threshold = PHONE_WIDTH * 0.3
    if (dragX < -threshold && currentIndex < SCREENS.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (dragX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
    setDragX(0)
    startXRef.current = null
  }

  const translateX = -currentIndex * PHONE_WIDTH + dragX

  return (
    <div className="scene">
      <div
        className="phone"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="screen-strip"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div className="screen-slot">
            <HomeScreen />
          </div>
          <div className="screen-slot">
            <FeedScreen />
          </div>
        </div>
      </div>
    </div>
  )
}
