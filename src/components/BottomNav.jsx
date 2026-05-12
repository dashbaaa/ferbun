import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, BookOpen, CreditCard, Zap, MessageSquare } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard',       icon: LayoutDashboard, label: 'Mal'   },
  { path: '/lessons',         icon: BookOpen,         label: 'Ders'  },
  { path: '/flashcards',      icon: CreditCard,       label: 'Kart'  },
  { path: '/daily-challenge', icon: Zap,              label: 'Pirs'  },
  { path: '/phrases',         icon: MessageSquare,    label: 'Hevok' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10"
      style={{
        background: 'rgba(26, 35, 50, 0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-[65px] px-1">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 flex-1 py-1"
            >
              {/* Indicateur actif : ligne verte en haut de l'onglet */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-green-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              <motion.div
                whileTap={{ scale: 0.82 }}
                className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-green-400/10' : ''}`}
              >
                <item.icon
                  style={{ width: 22, height: 22 }}
                  className={isActive ? 'text-green-400' : 'text-white/40'}
                />
              </motion.div>

              <span
                className={`text-[10px] leading-none ${
                  isActive ? 'text-green-400 font-semibold' : 'text-white/40 font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
