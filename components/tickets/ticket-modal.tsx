"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Clock, Download, Share2, User } from "lucide-react"
import { QRCodeDisplay } from "@/components/tickets/qr-code-display"
import type { Ticket } from "@/lib/types"

interface TicketModalProps {
  ticket: Ticket
  open: boolean
  onClose: () => void
}

export function TicketModal({ ticket, open, onClose }: TicketModalProps) {
  const event = ticket.event
  const zone = ticket.zone

  if (!event) return null

  const eventDate = new Date(event.start_date)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const doorsOpen = event.doors_open ? new Date(event.doors_open) : null
  const doorsTime = doorsOpen?.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const handleDownload = () => {
    // In production, this would download a PDF ticket
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${event.title}`,
          text: `My ticket for ${event.title} on ${formattedDate}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled share
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Your Ticket</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Ticket visual */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
            {/* Top section */}
            <div className="p-6">
              <Badge className="mb-4 bg-primary text-primary-foreground">{event.category?.name || "Event"}</Badge>

              <h2 className="text-xl font-bold leading-tight">{event.title}</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Event starts at {formattedTime}</span>
                </div>
                {doorsTime && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Doors open at {doorsTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>
                    {event.venue?.name}, {event.venue?.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider with circles */}
            <div className="relative">
              <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background" />
              <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background" />
              <Separator className="border-dashed" />
            </div>

            {/* Bottom section - QR Code */}
            <div className="p-6">
              {/* Zone info */}
              {zone && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: zone.color || "#888" }} />
                    <span className="font-medium">{zone.name}</span>
                  </div>
                  <span className="font-semibold">${zone.price?.toFixed(2)}</span>
                </div>
              )}

              {/* Attendee info */}
              {ticket.attendee_name && (
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{ticket.attendee_name}</span>
                </div>
              )}

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <QRCodeDisplay value={ticket.qr_code} size={200} />
                <p className="mt-4 text-center font-mono text-sm text-muted-foreground">{ticket.ticket_number}</p>
                {ticket.status === "valid" && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Show this QR code at the venue entrance
                  </p>
                )}
                {ticket.status === "used" && (
                  <Badge variant="secondary" className="mt-2">
                    Already Scanned
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1 gap-2 bg-transparent" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" className="flex-1 gap-2 bg-transparent" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Important info */}
          <div className="mt-6 rounded-lg bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Important Information</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>This ticket is valid for one person only</li>
              <li>The QR code will be scanned at entry - have it ready</li>
              <li>Screenshots of the QR code are accepted</li>
              <li>Tickets are non-transferable once scanned</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
