"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Scan,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  History,
  LogOut,
  Loader2,
  User,
  MapPin,
  Calendar,
  Clock,
  Ticket,
} from "lucide-react"
import { QrScanner } from "@/components/scanner/qr-scanner"
import { ScanHistory } from "@/components/scanner/scan-history"
import { cn } from "@/lib/utils"

interface StaffMember {
  id: string
  user_id: string
  role: string
  organization: {
    id: string
    name: string
    logo_url: string | null
  }
}

interface Event {
  id: string
  title: string
  date: string
  venue: { name: string }
}

interface ScanResult {
  status: "valid" | "invalid" | "used" | "expired" | "wrong_event"
  message: string
  ticket?: {
    id: string
    ticket_number: string
    attendee_name: string
    attendee_email: string
    zone_name: string
    event_title: string
    event_date: string
    venue_name: string
    used_at: string | null
  }
}

export function ScannerInterface({
  staffMember,
  events,
}: {
  staffMember: StaffMember
  events: Event[]
}) {
  const [selectedEvent, setSelectedEvent] = useState<string>(events[0]?.id || "")
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [scanCount, setScanCount] = useState({ valid: 0, invalid: 0 })
  const supabase = createBrowserClient()
  const audioRef = useRef<{ success: HTMLAudioElement | null; error: HTMLAudioElement | null }>({
    success: null,
    error: null,
  })

  useEffect(() => {
    // Preload audio for feedback
    audioRef.current.success = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp2djXx1bnR9ipmenZqKfXVvdYCNnZ6bjH51cHWAjZ2fnIx+dXF1gI2en5yMfnVxdYCNnp+cjH51cXWAjZ6fnIx+dXF1gI2en5yMfnVxdYCNnp+cjH51cQ==",
    )
    audioRef.current.error = new Audio(
      "data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTtvAAB/fHt3dXRycnNzdHV3eHp8f4GDhYaHh4eGhYSCgH58end1c3JxcXJzdHZ4ent9f4GDhYaHh4eGhYSCgH58end1c3JxcXJzdHZ4ent9f4GDhYaHh4eGhYSCgH58end1c3JxcQ==",
    )
  }, [])

  const handleScan = async (data: string) => {
    if (processing || !selectedEvent) return

    setProcessing(true)
    setScanResult(null)

    try {
      const response = await fetch("/api/scanner/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: data,
          eventId: selectedEvent,
          staffId: staffMember.id,
        }),
      })

      const result: ScanResult = await response.json()
      setScanResult(result)

      // Update counts
      if (result.status === "valid") {
        setScanCount((prev) => ({ ...prev, valid: prev.valid + 1 }))
        audioRef.current.success?.play().catch(() => {})
      } else {
        setScanCount((prev) => ({ ...prev, invalid: prev.invalid + 1 }))
        audioRef.current.error?.play().catch(() => {})
      }

      // Auto-clear result after 5 seconds
      setTimeout(() => {
        setScanResult(null)
      }, 5000)
    } catch (error) {
      setScanResult({
        status: "invalid",
        message: "Failed to validate ticket. Please try again.",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/scanner/login"
  }

  if (showHistory) {
    return <ScanHistory staffId={staffMember.id} onBack={() => setShowHistory(false)} />
  }

  const selectedEventData = events.find((e) => e.id === selectedEvent)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={staffMember.organization.logo_url || ""} />
              <AvatarFallback>{staffMember.organization.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{staffMember.organization.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{staffMember.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)}>
              <History className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4 px-4 space-y-4">
        {/* Event Selector */}
        <Card>
          <CardContent className="p-4">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Select the event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <div className="flex flex-col">
                      <span>{event.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} - {event.venue.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">{scanCount.valid}</p>
                <p className="text-xs text-muted-foreground">Valid Scans</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-500">{scanCount.invalid}</p>
                <p className="text-xs text-muted-foreground">Invalid Scans</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scanner */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Ticket Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {scanning ? (
              <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />
            ) : (
              <div className="p-6 flex flex-col items-center gap-4">
                <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <Scan className="h-16 w-16 text-muted-foreground/50" />
                </div>
                <Button
                  size="lg"
                  onClick={() => setScanning(true)}
                  disabled={!selectedEvent}
                  className="w-full max-w-xs"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Start Scanning
                </Button>
                {!selectedEvent && <p className="text-sm text-muted-foreground">Please select the event first</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Result */}
        {(scanResult || processing) && (
          <Card
            className={cn(
              "border-2 transition-colors",
              processing && "border-muted animate-pulse",
              scanResult?.status === "valid" && "border-green-500 bg-green-500/10",
              scanResult?.status === "used" && "border-yellow-500 bg-yellow-500/10",
              (scanResult?.status === "invalid" ||
                scanResult?.status === "expired" ||
                scanResult?.status === "wrong_event") &&
                "border-red-500 bg-red-500/10",
            )}
          >
            <CardContent className="p-4">
              {processing ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Validating ticket...</span>
                </div>
              ) : (
                scanResult && (
                  <div className="space-y-4">
                    {/* Status Header */}
                    <div className="flex items-center gap-3">
                      {scanResult.status === "valid" && <CheckCircle2 className="h-10 w-10 text-green-500" />}
                      {scanResult.status === "used" && <AlertTriangle className="h-10 w-10 text-yellow-500" />}
                      {(scanResult.status === "invalid" ||
                        scanResult.status === "expired" ||
                        scanResult.status === "wrong_event") && <XCircle className="h-10 w-10 text-red-500" />}
                      <div>
                        <p
                          className={cn(
                            "font-bold text-lg",
                            scanResult.status === "valid" && "text-green-500",
                            scanResult.status === "used" && "text-yellow-500",
                            (scanResult.status === "invalid" ||
                              scanResult.status === "expired" ||
                              scanResult.status === "wrong_event") &&
                              "text-red-500",
                          )}
                        >
                          {scanResult.status === "valid" && "VALID TICKET"}
                          {scanResult.status === "used" && "ALREADY USED"}
                          {scanResult.status === "invalid" && "INVALID TICKET"}
                          {scanResult.status === "expired" && "EXPIRED TICKET"}
                          {scanResult.status === "wrong_event" && "WRONG EVENT"}
                        </p>
                        <p className="text-sm text-muted-foreground">{scanResult.message}</p>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    {scanResult.ticket && (
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{scanResult.ticket.attendee_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{scanResult.ticket.ticket_number}</span>
                          <Badge variant="secondary">{scanResult.ticket.zone_name}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{scanResult.ticket.event_title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{scanResult.ticket.venue_name}</span>
                        </div>
                        {scanResult.ticket.used_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-yellow-500">
                              Used at: {new Date(scanResult.ticket.used_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
