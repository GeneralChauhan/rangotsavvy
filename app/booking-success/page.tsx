"use client"

import { Suspense, useRef, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { BookingSuccessContent } from "./booking-success-content"
import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { GrainOverlay } from "@/components/grain-overlay"

function LoadingFallback() {
  return null
}

export default function BookingSuccess() {
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#1275d8"
            colorB="#e19136"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0066ff"
            upColor="#0066ff"
            downColor="#d1d1d1"
            leftColor="#e19136"
            rightColor="#e19136"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-opacity duration-700 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}>
        {/* Logo Header */}
        <div className="mb-8">
          <Link href="/">
            <Image 
              src="/gallery/VG - Logos Black.png" 
              alt="Rangotsav Logo" 
              width={120} 
              height={40}
              className="w-auto h-14"
            />
          </Link>
        </div>
        <Suspense fallback={<LoadingFallback />}>
          <BookingSuccessContent />
        </Suspense>
      </div>
    </main>
  )
}
