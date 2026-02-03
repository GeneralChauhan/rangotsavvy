import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_date_id, start_time, end_time, capacity } = body

    if (!event_date_id || !start_time || !end_time || !capacity) {
      return NextResponse.json(
        { error: "Missing required fields: event_date_id, start_time, end_time, capacity" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("time_slots")
      .insert({
        event_date_id,
        start_time,
        end_time,
        capacity: Number.parseInt(capacity),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating time slot:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin time slots route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("time_slots").delete().eq("id", id)

    if (error) {
      console.error("Error deleting time slot:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in admin time slots route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
