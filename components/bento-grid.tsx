"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

const galleryImages = Array.from({ length: 10 }, (_, i) => `/gallery/${i}.jpg`)

// Bento grid layout patterns - different sizes for visual interest
// Each pattern defines column and row spans for a 5-column grid
const gridPatterns = [
  // Pattern creates varied sizes
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-2", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-2" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-2", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-2" },
  { col: "col-span-2", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
  { col: "col-span-1", row: "row-span-1" },
]

// Generate a full grid row pattern (5 columns)
function generateGridRow(startIndex: number, numRows: number = 3) {
  const items = []
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < 5; col++) {
      const patternIndex = (startIndex + row * 5 + col) % gridPatterns.length
      const pattern = gridPatterns[patternIndex]
      const imageIndex = (startIndex + row * 5 + col) % galleryImages.length
      items.push({
        ...pattern,
        imageIndex,
        key: `item-${startIndex}-${row}-${col}`,
      })
    }
  }
  return items
}

export function BentoGrid() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    let animationFrameId: number
    let scrollPosition = 0
    const scrollSpeed = 0.25 // pixels per frame - subtle continuous scroll

    const animate = () => {
      scrollPosition += scrollSpeed
      
      // Calculate the height of one complete grid set
      // We have 3 sets, so one set is approximately 1/3 of total height
      const totalHeight = scrollElement.scrollHeight
      const setHeight = totalHeight / 3
      
      // Reset position when scrolled past one full set for seamless loop
      if (setHeight > 0 && scrollPosition >= setHeight) {
        scrollPosition = scrollPosition - setHeight
      }

      scrollElement.style.transform = `translateY(-${scrollPosition}px)`
      animationFrameId = requestAnimationFrame(animate)
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      animate()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Create multiple sets for seamless infinite scroll
  const gridSets = [0, 1, 2] // Three sets to ensure seamless scrolling

  return (
    <div
      className="absolute inset-0 overflow-hidden opacity-[0.12] md:opacity-[0.15] pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={scrollRef}
        className="grid grid-cols-5 auto-rows-[90px] md:auto-rows-[110px] lg:auto-rows-[130px] gap-1 md:gap-1.5 lg:gap-2"
      >
        {gridSets.map((setIndex) => {
          const rowItems = generateGridRow(setIndex * 15, 5) // 5 rows per set for better coverage
          return rowItems.map((item) => (
            <div
              key={`${item.key}-set-${setIndex}`}
              className={`${item.col} ${item.row} relative overflow-hidden rounded-sm md:rounded group`}
            >
              <Image
                src={galleryImages[item.imageIndex]}
                alt=""
                fill
                className="object-cover transition-transform duration-[3000ms] ease-out"
                sizes="(max-width: 768px) 20vw, (max-width: 1024px) 15vw, 12vw"
                unoptimized
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
            </div>
          ))
        })}
      </div>
    </div>
  )
}
