import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#1B7D4E', '#D4940A', '#E74C5E', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']
const SHAPES = ['rounded-sm', 'rounded-full', 'rounded-none rotate-45']

export default function Confetti({ count = 40 }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x:        Math.random() * 100,        // vw %
      drift:    (Math.random() - 0.5) * 160, // px horizontal drift
      duration: 2 + Math.random() * 2,
      delay:    Math.random() * 0.6,
      color:    COLORS[i % COLORS.length],
      shape:    SHAPES[i % SHAPES.length],
      size:     6 + Math.random() * 6,
      rotate:   Math.random() * 720,
    }))
  )

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className={`absolute ${p.shape}`}
          style={{
            left:            `${p.x}%`,
            top:             -20,
            width:           p.size,
            height:          p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y:       '110vh',
            x:       p.drift,
            rotate:  p.rotate,
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay:    p.delay,
            ease:     'easeIn',
          }}
        />
      ))}
    </div>
  )
}
