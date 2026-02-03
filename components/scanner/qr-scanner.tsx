"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Camera, SwitchCamera } from "lucide-react"
import { BarcodeDetector } from "barcode-detector"

interface QrScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedRef = useRef<string>("")

  useEffect(() => {
    let mounted = true

    const startCamera = async () => {
      try {
        // Stop existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }

        // Start scanning
        startScanning()
      } catch (err) {
        setError("Unable to access camera. Please grant camera permissions.")
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
    }
  }, [facingMode])

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }

    scanIntervalRef.current = setInterval(() => {
      scanQRCode()
    }, 200)
  }

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Use BarcodeDetector API if available
    if ("BarcodeDetector" in window) {
      try {
        const barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] })
        const barcodes = await barcodeDetector.detect(canvas)

        if (barcodes.length > 0) {
          const data = barcodes[0].rawValue
          // Prevent duplicate scans
          if (data && data !== lastScannedRef.current) {
            lastScannedRef.current = data
            onScan(data)
            // Reset after 3 seconds to allow re-scanning same code
            setTimeout(() => {
              lastScannedRef.current = ""
            }, 3000)
          }
        }
      } catch (err) {
        // BarcodeDetector failed, fallback would go here
      }
    }
  }

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  return (
    <div className="relative">
      {error ? (
        <div className="p-6 text-center">
          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <>
          <div className="relative aspect-square bg-black overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                {/* Scan line animation */}
                <div className="absolute inset-x-4 top-4 h-0.5 bg-primary/50 animate-pulse" />
              </div>
            </div>
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" onClick={toggleCamera}>
                <SwitchCamera className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <p className="text-center text-sm text-muted-foreground py-3">Position the QR code within the frame</p>
        </>
      )}
    </div>
  )
}
