"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, TicketIcon, QrCode, ChevronRight } from "lucide-react"
import { TicketModal } from "@/components/tickets/ticket-modal"
import type { Ticket } from "@/lib/types"

interface TicketsListProps {
  tickets: Ticket[]
  emptyMessage: string
  type: "upcoming" | "past" | "cancelled"
}

export function TicketsList({ tickets, emptyMessage, type }: TicketsListProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <TicketIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{emptyMessage}</h3>
        <p className="mt-2 text-muted-foreground">
          {type === "upcoming" ? "Browse events and get your tickets!" : "Your tickets will appear here"}
        </p>
        {type === "upcoming" && (
          <Link href="/events" className="mt-4">
            <Button>Browse Events</Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={() => setSelectedTicket(ticket)} type={type} />
        ))}
      </div>

      {selectedTicket && (
        <TicketModal ticket={selectedTicket} open={!!selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </>
  )
}

interface TicketCardProps {
  ticket: Ticket
  onClick: () => void
  type: "upcoming" | "past" | "cancelled"
}

function TicketCard({ ticket, onClick, type }: TicketCardProps) {
  const event = ticket.event
  const zone = ticket.zone

  if (!event) return null

  const eventDate = new Date(event.start_date)
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const statusColors = {
    valid: "bg-green-500/10 text-green-500 border-green-500/30",
    used: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
    expired: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    transferred: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  }

  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Event image */}
          <div className="relative h-32 w-full sm:h-auto sm:w-40 md:w-48">
            <Image
              src={event.image_url || "/placeholder.svg?height=200&width=300"}
              alt={event.title}
              fill
              className="object-cover"
            />
            {type === "upcoming" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <Button size="sm" variant="secondary" onClick={onClick} className="gap-2">
                  <QrCode className="h-4 w-4" />
                  View QR
                </Button>
              </div>
            )}
          </div>

          {/* Ticket info */}
          <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{event.title}</h3>
                <Badge variant="outline" className={statusColors[ticket.status]}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate} at {formattedTime}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.venue?.name}
                </div>
              </div>

              {zone && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: zone.color || "#888" }} />
                  <span className="text-sm">{zone.name}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">{ticket.ticket_number}</p>
              <Button size="sm" variant="ghost" onClick={onClick} className="gap-1">
                {type === "upcoming" ? "View Ticket" : "Details"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
