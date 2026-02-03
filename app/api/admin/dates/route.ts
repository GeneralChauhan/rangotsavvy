import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, date } = body

    if (!event_id || !date) {
      return NextResponse.json(
        { error: "Missing required fields: event_id, date" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("event_dates")
      .insert({
        event_id,
        date,
        is_available: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating date:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin dates route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_available } = body

    if (!id || typeof is_available !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: id, is_available" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("event_dates")
      .update({ is_available })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating date:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin dates route:", error)
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

    const { error } = await supabase.from("event_dates").delete().eq("id", id)

    if (error) {
      console.error("Error deleting date:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in admin dates route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
