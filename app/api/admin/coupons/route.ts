import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("event_id")

    const supabase = createAdminClient()

    let query = supabase.from("coupons").select("*").order("created_at", { ascending: false })

    if (eventId) {
      query = query.or(`event_id.eq.${eventId},event_id.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching coupons:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin coupons GET route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      event_id,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      start_date,
      end_date,
      is_active = true,
    } = body

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json(
        { error: "Missing required fields: code, discount_type, discount_value" },
        { status: 400 }
      )
    }

    if (discount_type !== "percentage" && discount_type !== "fixed_amount") {
      return NextResponse.json(
        { error: "discount_type must be 'percentage' or 'fixed_amount'" },
        { status: 400 }
      )
    }

    if (discount_value <= 0) {
      return NextResponse.json({ error: "discount_value must be greater than 0" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if code already exists (case-insensitive)
    const { data: existingCoupon } = await supabase
      .from("coupons")
      .select("id")
      .ilike("code", code.toUpperCase())
      .maybeSingle()

    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: code.toUpperCase().trim(),
        event_id: event_id || null,
        discount_type,
        discount_value: Number.parseFloat(discount_value),
        min_order_amount: min_order_amount ? Number.parseFloat(min_order_amount) : null,
        max_discount: max_discount ? Number.parseFloat(max_discount) : null,
        usage_limit: usage_limit ? Number.parseInt(usage_limit) : null,
        start_date: start_date || null,
        end_date: end_date || null,
        is_active,
        used_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating coupon:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin coupons POST route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      code,
      event_id,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount,
      usage_limit,
      start_date,
      end_date,
      is_active,
    } = body

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const updateData: any = {}

    if (code !== undefined) {
      // Check if new code already exists (excluding current coupon)
      const { data: existingCoupon } = await supabase
        .from("coupons")
        .select("id")
        .ilike("code", code.toUpperCase())
        .neq("id", id)
        .maybeSingle()

      if (existingCoupon) {
        return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
      }
      updateData.code = code.toUpperCase().trim()
    }

    if (event_id !== undefined) updateData.event_id = event_id || null
    if (discount_type !== undefined) {
      if (discount_type !== "percentage" && discount_type !== "fixed_amount") {
        return NextResponse.json(
          { error: "discount_type must be 'percentage' or 'fixed_amount'" },
          { status: 400 }
        )
      }
      updateData.discount_type = discount_type
    }
    if (discount_value !== undefined) {
      if (discount_value <= 0) {
        return NextResponse.json({ error: "discount_value must be greater than 0" }, { status: 400 })
      }
      updateData.discount_value = Number.parseFloat(discount_value)
    }
    if (min_order_amount !== undefined)
      updateData.min_order_amount = min_order_amount ? Number.parseFloat(min_order_amount) : null
    if (max_discount !== undefined)
      updateData.max_discount = max_discount ? Number.parseFloat(max_discount) : null
    if (usage_limit !== undefined)
      updateData.usage_limit = usage_limit ? Number.parseInt(usage_limit) : null
    if (start_date !== undefined) updateData.start_date = start_date || null
    if (end_date !== undefined) updateData.end_date = end_date || null
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating coupon:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error in admin coupons PATCH route:", error)
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

    const { error } = await supabase.from("coupons").delete().eq("id", id)

    if (error) {
      console.error("Error deleting coupon:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in admin coupons DELETE route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
