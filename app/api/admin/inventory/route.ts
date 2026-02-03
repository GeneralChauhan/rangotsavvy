import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, total_quantity } = body

    if (!id || total_quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: id, total_quantity" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("inventory")
      .update({
        total_quantity: Number.parseInt(total_quantity),
        available_quantity: Number.parseInt(total_quantity),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating inventory:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin inventory route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
