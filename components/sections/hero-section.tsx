"use client"
import { useReveal } from "@/hooks/use-reveal"
import { MagneticButton } from "@/components/magnetic-button"
import { BentoGrid } from "@/components/bento-grid"

interface EventData {
  id: string
  name: string
  description: string
  venue: string
}

export function HeroSection({ onStartBooking, eventData }: { onStartBooking: () => void; eventData?: EventData }) {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="relative flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16 overflow-hidden"
    >
      <BentoGrid />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div
          className={`mb-6 transition-all duration-700 md:mb-12 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h1 className="mb-3 font-sans text-4xl font-light leading-[1.1] tracking-tight text-foreground md:mb-4 md:text-6xl lg:text-7xl">
            Van Gogh
            <br />
            An Immersive
            <br />
            Story
          </h1>
          <p className="font-mono text-xs text-foreground/60 md:text-base">/ LAST CHANCE TO EXPERIENCE</p>
        </div>

        <div
          className={`mb-8 max-w-2xl space-y-4 transition-all duration-700 md:mb-12 md:space-y-6 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <p className="text-sm leading-relaxed text-foreground/90 md:text-lg">
            Experience the world's most loved immersive show. Step into a breathtaking 360° immersive journey through
            Vincent van Gogh's masterpieces. This global phenomenon—experienced by over 1 billion people across 90+
            countries—arrives in Ahmedabad for its final tour.
          </p>
          <p className="text-sm leading-relaxed text-foreground/90 md:text-lg">
            Explore four incredible zones of immersive art and experience.
          </p>
        </div>

        <div
          className={`flex flex-wrap gap-3 transition-all duration-700 md:gap-4 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <MagneticButton size="lg" variant="primary" onClick={onStartBooking}>
            Book Now
          </MagneticButton>
          <MagneticButton size="lg" variant="secondary">
            Learn More
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
