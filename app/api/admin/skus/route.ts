import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, name, description, base_price, category } = body

    if (!event_id || !name || !base_price) {
      return NextResponse.json(
        { error: "Missing required fields: event_id, name, base_price" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("skus")
      .insert({
        event_id,
        name,
        description: description || null,
        base_price: Number.parseFloat(base_price),
        category: category || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating SKU:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin SKU route:", error)
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

    const { error } = await supabase.from("skus").delete().eq("id", id)

    if (error) {
      console.error("Error deleting SKU:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in admin SKU DELETE route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
