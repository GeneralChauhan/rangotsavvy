import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, event_id, order_total } = body

    if (!code || !order_total) {
      return NextResponse.json(
        { error: "Missing required fields: code, order_total" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find coupon by code (case-insensitive)
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code.toUpperCase().trim())
      .maybeSingle()

    if (couponError) {
      console.error("Error fetching coupon:", couponError)
      return NextResponse.json({ error: "Error validating coupon" }, { status: 500 })
    }

    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          error_message: "Invalid coupon code",
        },
        { status: 200 }
      )
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json(
        {
          valid: false,
          error_message: "This coupon is not active",
        },
        { status: 200 }
      )
    }

    // Check if coupon is event-specific and matches
    if (coupon.event_id && event_id && coupon.event_id !== event_id) {
      return NextResponse.json(
        {
          valid: false,
          error_message: "This coupon is not valid for this event",
        },
        { status: 200 }
      )
    }

    // Check date validity
    const today = new Date().toISOString().split("T")[0]
    if (coupon.start_date && today < coupon.start_date) {
      return NextResponse.json(
        {
          valid: false,
          error_message: "This coupon is not yet active",
        },
        { status: 200 }
      )
    }

    if (coupon.end_date && today > coupon.end_date) {
      return NextResponse.json(
        {
          valid: false,
          error_message: "This coupon has expired",
        },
        { status: 200 }
      )
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json(
        {
          valid: false,
          error_message: "This coupon has reached its usage limit",
        },
        { status: 200 }
      )
    }

    // Check minimum order amount
    const orderTotalNum = Number.parseFloat(order_total)
    if (coupon.min_order_amount && orderTotalNum < coupon.min_order_amount) {
      return NextResponse.json(
        {
          valid: false,
          error_message: `Minimum order amount of ₹${coupon.min_order_amount} required`,
        },
        { status: 200 }
      )
    }

    // Calculate discount
    let discountAmount = 0

    if (coupon.discount_type === "percentage") {
      const percentageDiscount = (orderTotalNum * coupon.discount_value) / 100
      if (coupon.max_discount) {
        discountAmount = Math.min(percentageDiscount, coupon.max_discount)
      } else {
        discountAmount = percentageDiscount
      }
    } else if (coupon.discount_type === "fixed_amount") {
      discountAmount = Math.min(coupon.discount_value, orderTotalNum)
    }

    const finalTotal = Math.max(0, orderTotalNum - discountAmount)

    return NextResponse.json({
      valid: true,
      discount_amount: Number.parseFloat(discountAmount.toFixed(2)),
      final_total: Number.parseFloat(finalTotal.toFixed(2)),
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    })
  } catch (error: any) {
    console.error("Error in coupon validation route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
