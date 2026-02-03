"use client"
import { useEffect, useRef } from "react"

interface CanvasProps {
  className?: string
  onCreated?: (canvas: any) => void
}

export function Canvas({ className, onCreated }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && onCreated) {
      onCreated(canvasRef.current)
    }
  }, [onCreated])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
      }}
    />
  )
}
