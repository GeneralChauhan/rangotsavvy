import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, visitorName, visitorEmail, selectedSlot, selectedSKU, quantity, totalPrice } = body

    // Dummy payment verification - always return success for testing
    // In production, this would verify payment with the payment gateway
    console.log("Dummy payment verification - simulating success for session:", sessionId)

    // Simulate a small delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 200))

    // Create booking in Supabase
    const supabase = await createClient()

    const { data, error } = await supabase.from("bookings").insert({
      time_slot_id: selectedSlot,
      sku_id: selectedSKU,
      quantity,
      total_price: totalPrice,
      email: visitorEmail,
      visitor_name: visitorName,
      status: "confirmed",
    })

    if (error) throw error

    return NextResponse.json({ success: true, bookingId: data[0]?.id })
  } catch (error) {
    console.error("Booking confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 })
  }
}
