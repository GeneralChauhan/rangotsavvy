"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { GrainOverlay } from "@/components/grain-overlay"
import { createClient } from "@/lib/supabase/client"
import { generateBookingQRCode } from "@/lib/utils/qr-code"

function PaymentContent() {
  const searchParams = useSearchParams()
  const [bookingData, setBookingData] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchBookingData = async () => {
      const bookingId = searchParams.get("booking_id")
      
      if (!bookingId) {
        console.error("No booking_id provided in URL")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching booking with ID:", bookingId)
        // Fetch booking data from Supabase
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

        if (error) {
          console.error("Error fetching booking:", error)
          console.error("Error details:", JSON.stringify(error, null, 2))
          // Don't use dummy data - show error instead
          alert(`Failed to load booking: ${error.message}. Please go back and try again.`)
          setLoading(false)
          return
        }

        if (!booking) {
          console.error("No booking found with ID:", bookingId)
          alert("Booking not found. Please go back and try again.")
          setLoading(false)
          return
        }

        console.log("Booking fetched successfully:", booking)
        // Calculate total price from all bookings if multiple
        const totalPrice = booking.total_price || 0
        const timeSlot = booking.time_slots as any
        const eventDate = timeSlot?.event_dates as any
        // Handle both email and visitor_email field names (prefer email)
        const email = booking.email || booking.visitor_email || ""
        const visitorName = booking.visitor_name || ""

        if (!email || !visitorName) {
          console.error("Booking missing required fields:", { email, visitorName, booking })
          alert("Booking data is incomplete. Please go back and try again.")
          setLoading(false)
          return
        }

        setBookingData({
          visitorName: visitorName,
          visitorEmail: email,
          phoneNumber: (booking as any).phone_number || "",
          skuName: (booking.skus as any)?.name || "Ticket",
          quantity: booking.quantity || 1,
          totalPrice: totalPrice,
          bookingId: booking.id,
          timeSlot: timeSlot,
          sku: booking.skus as any,
          date: eventDate?.date || new Date().toISOString().split('T')[0],
          eventName: eventDate?.events?.name || eventDate?.events?.title || "Rangotsav – 4th Holi 2026",
        })
      } catch (err) {
        console.error("Unexpected error:", err)
        alert(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}. Please go back and try again.`)
      } finally {
        setLoading(false)
      }
    }

    fetchBookingData()
  }, [searchParams, supabase])

  const handleDummyPayment = async () => {
    setProcessing(true)
    
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate and store QR code
    if (bookingData?.bookingId) {
      try {
        // Generate QR code with booking details
        const qrData = {
          bookingIds: [bookingData.bookingId],
          visitorName: bookingData.visitorName,
          visitorEmail: bookingData.visitorEmail,
          tickets: [{
            bookingId: bookingData.bookingId,
            ticketType: bookingData.skuName,
            quantity: bookingData.quantity,
            price: bookingData.totalPrice,
          }],
          totalPrice: bookingData.totalPrice,
          date: bookingData.date || new Date().toISOString().split('T')[0],
          time: bookingData.timeSlot?.start_time || '',
          endTime: bookingData.timeSlot?.end_time || '',
          eventName: bookingData.eventName || "Rangotsav – 4th Holi 2026",
          status: "confirmed",
        }

        const qrCodeDataUrl = await generateBookingQRCode(qrData)

        // Update booking status to confirmed and store QR code
        const { error, data } = await supabase
          .from("bookings")
          .update({ 
            status: "confirmed",
            qr_code: qrCodeDataUrl, // Store QR code as data URL
          })
          .eq("id", bookingData.bookingId)
          .select()

        if (error) {
          console.error("Error updating booking status:", error)
          // Still redirect even if update fails - QR can be regenerated on success page
        } else {
          console.log("QR code generated and stored successfully", data)
        }

        // Small delay to ensure database update completes
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (err) {
        console.error("Error generating QR code or updating booking:", err)
        // Continue with redirect even if QR generation fails
      }
    }

    // Always redirect with booking_id and user data for reliability
    if (bookingData?.bookingId) {
      const params = new URLSearchParams({
        booking_id: bookingData.bookingId,
        name: bookingData.visitorName || "Guest",
        email: bookingData.visitorEmail || "guest@example.com",
      })
      window.location.href = `/booking-success?${params.toString()}`
    } else {
      // Fallback if no bookingId (shouldn't happen in normal flow)
      const params = new URLSearchParams({
        name: bookingData?.visitorName || "Guest",
        email: bookingData?.visitorEmail || "guest@example.com",
      })
      window.location.href = `/booking-success?${params.toString()}`
    }
  }

  if (loading || !bookingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/80">Loading payment details...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center px-4 md:px-8 lg:px-16 py-12">
        <div className="mx-auto w-full max-w-4xl">
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
          {/* Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="mb-4 inline-block rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md">
              <p className="font-mono text-xs text-foreground/90 flex items-center gap-2">
                <CreditCard className="h-3 w-3" />
                Secure Payment
              </p>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-foreground mb-2 leading-tight">Secure Payment</h1>
            <p className="text-lg text-foreground/90 max-w-xl">Complete your Holi booking</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Visitor Name</span>
                  <span className="font-medium text-foreground">{bookingData.visitorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Ticket Type</span>
                  <span className="font-medium text-foreground">{bookingData.skuName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Quantity</span>
                  <span className="font-medium text-foreground">{bookingData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Email</span>
                  <span className="font-medium text-foreground text-sm">{bookingData.visitorEmail}</span>
                </div>
                {bookingData.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Phone Number</span>
                    <span className="font-medium text-foreground">{bookingData.phoneNumber}</span>
                  </div>
                )}

                <div className="border-t border-border/30 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-3xl font-light text-accent">₹{bookingData.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Info */}
            <Card className="border-border/50 bg-card/30 backdrop-blur-md">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Dummy Payment Gateway</p>
                    <p className="text-sm text-foreground/60">
                      This is a test payment flow. Clicking "Pay Now" will simulate a successful payment
                      and redirect you to the booking confirmation page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Card */}
          <div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-md sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-foreground/60">Amount to Pay</p>
                  <p className="text-2xl font-light text-accent">₹{bookingData.totalPrice}</p>
                </div>

                <div className="border-t border-border/30 pt-4 space-y-4">
                  <Button
                    onClick={handleDummyPayment}
                    disabled={processing}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6"
                  >
                    {processing ? "Processing..." : "Pay Now (Dummy)"}
                  </Button>

                  <Link href="/">
                    <Button variant="outline" className="w-full bg-transparent border-border/50">
                      Cancel Booking
                    </Button>
                  </Link>

                  <p className="text-xs text-foreground/50 text-center">
                    Your payment is secure and encrypted. Confirmation will be sent to your email.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-foreground/80">Loading payment details...</p>
    </div>
  )
}

export default function PaymentPage() {
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

      <div className={`relative z-10 min-h-screen transition-opacity duration-700 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}>
        <Suspense fallback={<LoadingFallback />}>
          <PaymentContent />
        </Suspense>
      </div>
    </main>
  )
}
