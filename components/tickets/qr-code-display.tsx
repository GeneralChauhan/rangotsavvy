"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error)
        },
      )
    }
  }, [value, size])

  return (
    <div className="rounded-xl bg-white p-4">
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  )
}
