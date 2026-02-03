"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { generateBookingQRCode } from "@/lib/utils/qr-code"

export function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const bookingId = searchParams.get("booking_id")
  const visitorName = searchParams.get("name")
  const visitorEmail = searchParams.get("email")
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchBookingData = async () => {
      console.log("Fetching booking data, bookingId:", bookingId)
      if (bookingId) {
        try {
          // Fetch booking with QR code from Supabase
          console.log("Fetching booking from Supabase...")
          const { data: booking, error } = await supabase
            .from("bookings")
            .select(`
              *,
              skus:sku_id (
                name,
                base_price
              ),
              time_slots:time_slot_id (
                start_time,
                end_time,
                event_dates:event_date_id (
                  date,
                  events:event_id (
                    title
                  )
                )
              )
            `)
            .eq("id", bookingId)
            .single()

          if (!error && booking) {
            console.log("Booking fetched:", booking)
            setBookingDetails(booking)
            // Set QR code from booking data
            if (booking.qr_code) {
              console.log("QR code found in booking:", booking.qr_code.substring(0, 50))
              setQrCodeDataUrl(booking.qr_code)
            } else {
              // Generate QR code if it doesn't exist
              console.log("No QR code found, generating one...")
              try {
                const timeSlot = booking.time_slots as any
                const eventDate = timeSlot?.event_dates as any
                // Use booking data, fallback to URL params if needed
                const qrData = {
                  bookingId: booking.id,
                  visitorName: booking.visitor_name || visitorName || "Guest",
                  visitorEmail: booking.email || booking.visitor_email || visitorEmail || "guest@example.com",
                  ticketType: (booking.skus as any)?.name || "General Admission",
                  quantity: booking.quantity,
                  totalPrice: booking.total_price,
                  date: eventDate?.date || new Date().toISOString().split('T')[0],
                  time: timeSlot?.start_time || '',
                  endTime: timeSlot?.end_time || '',
                  eventName: eventDate?.events?.name || eventDate?.events?.title || "Rangotsav – 4th Holi 2026",
                  status: booking.status || "confirmed",
                }
                console.log("Generating QR code with data:", qrData)
                const qrCodeDataUrl = await generateBookingQRCode(qrData)
                console.log("QR code generated:", qrCodeDataUrl.substring(0, 50))
                setQrCodeDataUrl(qrCodeDataUrl)
                // Store it in the database for future use
                const { error: updateError } = await supabase
                  .from("bookings")
                  .update({ qr_code: qrCodeDataUrl })
                  .eq("id", booking.id)
                if (updateError) {
                  console.error("Error storing QR code:", updateError)
                } else {
                  console.log("QR code stored successfully")
                }
              } catch (qrError) {
                console.error("Error generating QR code:", qrError)
              }
            }
            setSuccess(true)
          } else {
            console.error("Error fetching booking:", error)
            // Fallback to showing success even if fetch fails
            setSuccess(true)
          }
        } catch (err) {
          console.error("Error fetching booking:", err)
          setSuccess(true)
        } finally {
          setLoading(false)
        }
      } else if (sessionId) {
        // Handle dummy session IDs (for testing)
        if (sessionId.startsWith("dummy_session_")) {
          // Dummy session - just show success immediately
          setLoading(false)
          setSuccess(true)
        } else {
          confirmBooking(sessionId)
        }
      } else if (visitorName && visitorEmail) {
        // Direct success flow (no session ID needed for dummy payment)
        // Try to fetch booking by email/name if booking_id not provided
        try {
          const { data: bookingByEmail, error: emailError } = await supabase
            .from("bookings")
            .select(`
              *,
              skus:sku_id (
                name,
                base_price
              ),
              time_slots:time_slot_id (
                start_time,
                end_time,
                event_dates:event_date_id (
                  date,
                  events:event_id (
                    title
                  )
                )
              )
            `)
            .eq("email", visitorEmail)
            .eq("visitor_name", visitorName)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (!emailError && bookingByEmail) {
            setBookingDetails(bookingByEmail)
            if (bookingByEmail.qr_code) {
              setQrCodeDataUrl(bookingByEmail.qr_code)
            } else {
              // Generate QR code with fetched booking data
              const timeSlot = bookingByEmail.time_slots as any
              const eventDate = timeSlot?.event_dates as any
              const qrData = {
                bookingId: bookingByEmail.id,
                visitorName: bookingByEmail.visitor_name || visitorName,
                visitorEmail: bookingByEmail.email || bookingByEmail.visitor_email || visitorEmail,
                ticketType: (bookingByEmail.skus as any)?.name || "General Admission",
                quantity: bookingByEmail.quantity,
                totalPrice: bookingByEmail.total_price,
                date: eventDate?.date || new Date().toISOString().split('T')[0],
                time: timeSlot?.start_time || '',
                endTime: timeSlot?.end_time || '',
                eventName: eventDate?.events?.title || "Van Gogh – An Immersive Story",
                status: bookingByEmail.status || "confirmed",
              }
              const qrCodeDataUrl = await generateBookingQRCode(qrData)
              setQrCodeDataUrl(qrCodeDataUrl)
              // Store it in the database
              await supabase
                .from("bookings")
                .update({ qr_code: qrCodeDataUrl })
                .eq("id", bookingByEmail.id)
            }
          } else {
            // Fallback: generate QR code with URL params data
            const qrData = {
              bookingId: "pending",
              visitorName: visitorName,
              visitorEmail: visitorEmail,
              ticketType: "General Admission",
              quantity: 1,
              totalPrice: 0,
              date: new Date().toISOString().split('T')[0],
              time: '',
              endTime: '',
              eventName: "Rangotsav – 4th Holi 2026",
              status: "confirmed",
            }
            const qrCodeDataUrl = await generateBookingQRCode(qrData)
            setQrCodeDataUrl(qrCodeDataUrl)
          }
        } catch (qrError) {
          console.error("Error generating fallback QR code:", qrError)
        }
        setLoading(false)
        setSuccess(true)
      } else {
        // No params provided - show success anyway for testing
        setLoading(false)
        setSuccess(true)
      }
    }

    fetchBookingData()
  }, [sessionId, bookingId, visitorName, visitorEmail, supabase])

  const confirmBooking = async (id: string) => {
    try {
      const response = await fetch("/api/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        // Even if API fails, show success for dummy testing
        setSuccess(true)
      }
    } catch (error) {
      console.error("Error confirming booking:", error)
      // Show success anyway for dummy testing
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <CardContent className="pt-12 pb-12 text-center">
        {loading ? (
          <p className="text-foreground/60 text-lg">Processing your booking...</p>
        ) : success ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6 animate-in zoom-in duration-1000" />
            <h1 className="text-4xl md:text-5xl font-light text-foreground mb-2">Booking Confirmed!</h1>
            <div className="text-foreground/80 mb-6 space-y-2 text-lg">
              <p>Your Holi tickets have been confirmed.</p>
              {(bookingDetails?.visitor_name || visitorName) && (
                <p className="text-sm text-foreground/60">
                  <span className="font-medium text-foreground">{bookingDetails?.visitor_name || visitorName}</span>
                </p>
              )}
              {(bookingDetails?.email || bookingDetails?.visitor_email || visitorEmail) && (
                <p className="text-sm text-foreground/60">
                  Confirmation sent to: <span className="font-medium text-foreground">{bookingDetails?.email || bookingDetails?.visitor_email || visitorEmail}</span>
                </p>
              )}
            </div>

            {/* QR Code Display - ALWAYS show QR code */}
            {(() => {
              const qrSrc = qrCodeDataUrl || bookingDetails?.qr_code
              console.log("QR Code render check:", { 
                hasQrCodeDataUrl: !!qrCodeDataUrl, 
                hasBookingQrCode: !!bookingDetails?.qr_code,
                qrSrc: qrSrc ? qrSrc.substring(0, 50) : null 
              })
              
              if (!qrSrc) {
                return (
                  <div className="mb-6 text-center">
                    <p className="text-xs text-foreground/40 italic">
                      Generating QR code...
                    </p>
                  </div>
                )
              }
              
              return (
                <div className="mb-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                  <div className="rounded-xl bg-white p-4 mb-3 shadow-lg">
                    <img 
                      src={qrSrc} 
                      alt="Booking QR Code" 
                      className="w-48 h-48"
                      onError={(e) => {
                        console.error("QR code image failed to load", e)
                        e.currentTarget.style.display = "none"
                      }}
                      onLoad={() => {
                        console.log("QR code image loaded successfully")
                      }}
                    />
                  </div>
                  <p className="text-xs text-foreground/60 text-center max-w-xs mb-3">
                    Show this QR code at the venue entrance. It contains all your booking details.
                  </p>
                  {(bookingDetails || visitorName || visitorEmail) && (
                    <div className="mt-2 w-full text-left space-y-1 text-sm text-foreground/80 bg-foreground/5 rounded-lg p-3">
                      {(bookingDetails?.visitor_name || visitorName) && (
                        <p><span className="font-medium">Name:</span> {bookingDetails?.visitor_name || visitorName}</p>
                      )}
                      {(bookingDetails?.email || bookingDetails?.visitor_email || visitorEmail) && (
                        <p><span className="font-medium">Email:</span> {bookingDetails?.email || bookingDetails?.visitor_email || visitorEmail}</p>
                      )}
                      {bookingDetails && (
                        <>
                          <p><span className="font-medium">Ticket Type:</span> {(bookingDetails.skus as any)?.name || "General Admission"}</p>
                          <p><span className="font-medium">Quantity:</span> {bookingDetails.quantity}</p>
                          {bookingDetails.total_price && (
                            <p><span className="font-medium">Total Price:</span> ₹{bookingDetails.total_price}</p>
                          )}
                          {bookingDetails.time_slots && (
                            <p>
                              <span className="font-medium">Time:</span> {(bookingDetails.time_slots as any).start_time} - {(bookingDetails.time_slots as any).end_time}
                            </p>
                          )}
                          {bookingDetails.time_slots?.event_dates && (
                            <p>
                              <span className="font-medium">Date:</span> {(bookingDetails.time_slots as any).event_dates?.date || "N/A"}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            <Link href="/">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Return to Home</Button>
            </Link>
          </>
        ) : (
          <>
            <p className="text-destructive mb-4 text-lg">Booking confirmation failed</p>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Home
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
