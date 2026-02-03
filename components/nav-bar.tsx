"use client"

import { MagneticButton } from "@/components/magnetic-button"

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-12 lg:px-16 py-6">
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
        <div className="font-sans text-xl font-light text-foreground">Van Gogh</div>
        <div className="flex items-center gap-4">
          <a href="#" className="font-mono text-sm text-foreground/60 hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="font-mono text-sm text-foreground/60 hover:text-foreground transition-colors">
            Exhibition
          </a>
          <MagneticButton size="sm" variant="primary">
            Book Now
          </MagneticButton>
        </div>
      </div>
    </nav>
  )
}
