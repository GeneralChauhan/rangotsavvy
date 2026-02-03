"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface ScanLog {
  id: string
  scan_result: string
  scanned_at: string
  ticket: {
    ticket_number: string
    attendee_name: string
    zone: { name: string }
    event: { name?: string; title?: string }
  } | null
}

export function ScanHistory({ staffId, onBack }: { staffId: string; onBack: () => void }) {
  const [logs, setLogs] = useState<ScanLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("scan_logs")
        .select(`
          id,
          scan_result,
          scanned_at,
          ticket:tickets(
            ticket_number,
            attendee_name,
            zone:ticket_zones(name),
            event:events(title)
          )
        `)
        .eq("staff_id", staffId)
        .order("scanned_at", { ascending: false })
        .limit(50)

      setLogs(data || [])
      setLoading(false)
    }

    fetchLogs()
  }, [staffId, supabase])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-3 px-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Scan History</h1>
        </div>
      </header>

      <main className="flex-1 container py-4 px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No scans yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  {log.scan_result === "valid" ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {log.ticket ? (
                      <>
                        <p className="font-medium truncate">{log.ticket.attendee_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{log.ticket.event.name || log.ticket.event.title || "Event"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {log.ticket.zone.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{log.ticket.ticket_number}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Invalid ticket</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={log.scan_result === "valid" ? "default" : "destructive"}>{log.scan_result}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.scanned_at).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
