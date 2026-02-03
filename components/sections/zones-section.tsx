"use client"

import { useReveal } from "@/hooks/use-reveal"

export function ZonesSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-12 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-5xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Four Zones
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Immersive Experience</p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {[
            {
              number: "01",
              title: "Art & Life Gallery",
              description: "Explore Van Gogh's iconic artworks and walk through his extraordinary life journey",
              direction: "left",
            },
            {
              number: "02",
              title: "360° Immersive Room",
              description:
                "Step inside a state-of-the-art 360° projection room where paintings come alive with mesmerizing visuals",
              direction: "right",
            },
            {
              number: "03",
              title: "Neon Experience Zone",
              description: "Enter a glowing world inspired by Van Gogh's art—perfect for Instagram moments",
              direction: "left",
            },
            {
              number: "04",
              title: "Official Merchandise Store",
              description: "Take home exclusive Van Gogh-themed collectibles, art prints, and souvenirs",
              direction: "right",
            },
          ].map((zone, i) => (
            <ZoneCard key={i} zone={zone} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ZoneCard({
  zone,
  index,
  isVisible,
}: {
  zone: { number: string; title: string; description: string; direction: string }
  index: number
  isVisible: boolean
}) {
  const getRevealClass = () => {
    if (!isVisible) {
      return zone.direction === "left" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
    }
    return "translate-x-0 opacity-100"
  }

  return (
    <div
      className={`group flex flex-col gap-4 border-b border-foreground/10 py-6 transition-all duration-700 hover:border-foreground/20 md:flex-row md:items-baseline md:justify-between md:py-8 ${getRevealClass()}`}
      style={{
        transitionDelay: `${index * 150}ms`,
        marginLeft: index % 2 === 0 ? "0" : "auto",
        maxWidth: index % 2 === 0 ? "90%" : "85%",
      }}
    >
      <div className="flex items-baseline gap-4 md:gap-8">
        <span className="font-mono text-sm text-foreground/30 transition-colors group-hover:text-foreground/50 md:text-base">
          {zone.number}
        </span>
        <div>
          <h3 className="mb-1 font-sans text-2xl font-light text-foreground transition-transform duration-300 group-hover:translate-x-2 md:text-3xl lg:text-4xl">
            {zone.title}
          </h3>
          <p className="max-w-md font-mono text-xs text-foreground/50 md:text-sm">{zone.description}</p>
        </div>
      </div>
    </div>
  )
}
