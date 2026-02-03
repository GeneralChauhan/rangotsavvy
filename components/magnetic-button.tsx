"use client"

import type React from "react"
import { useRef } from "react"

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "lg"
  onClick?: () => void
}

export function MagneticButton({
  children,
  className = "",
  variant = "primary",
  size = "default",
  onClick,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | undefined>(undefined)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    positionRef.current = { x: x * 0.15, y: y * 0.15 }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`
      }
    })
  }

  const handleMouseLeave = () => {
    positionRef.current = { x: 0, y: 0 }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (ref.current) {
        ref.current.style.transform = "translate3d(0px, 0px, 0)"
      }
    })
  }

  const variants = {
    primary:
      `bg-black text-white hover:bg-black/90 shadow-lg hover:scale-[1.02] active:scale-[0.98]`,
    secondary:
      `bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300 hover:border-gray-400`,
    ghost: `bg-transparent text-gray-900 hover:bg-gray-100 border border-gray-300 hover:border-gray-400`,
  }

  const sizes = {
    default: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-full font-medium
        transition-all duration-300 ease-out will-change-transform
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      style={{
        transform: "translate3d(0px, 0px, 0)",
        contain: "layout style paint",
      }}
      {...props}
    >
      <span>{children}</span>
    </button>
  )
}
