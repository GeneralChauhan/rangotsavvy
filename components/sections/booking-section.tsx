"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useReveal } from "@/hooks/use-reveal";
import { MagneticButton } from "@/components/magnetic-button";
import { Clock, Calendar, Ticket, User, List, Grid, CreditCard, Lock, CheckCircle2, MapPin, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBookingQRCode } from "@/lib/utils/qr-code";
import { trackPurchase } from "@/lib/facebook-pixel";
import Image from "next/image";
import Link from "next/link";

type BookingStep = "date" | "time" | "sku" | "checkout" | "payment" | "success";

interface EventDate {
  id: string;
  date: string;
  available: boolean;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  capacity: number;
}

interface SKU {
  id: string;
  name: string;
  base_price: number;
  category: string;
}

interface OrderItem {
  sku_id: string;
  quantity: number;
  sku_name: string;
  price: number;
}

interface CalendarGridProps {
  month: number;
  year: number;
  eventDates: EventDate[];
  selectedDate: string;
  dateAvailabilityCounts: Map<string, number>;
  onDateSelect: (dateId: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

function CalendarGrid({
  month,
  year,
  eventDates,
  selectedDate,
  dateAvailabilityCounts,
  onDateSelect,
}: CalendarGridProps) {
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  // Create a map of date strings to event date objects
  const dateMap = new Map<string, EventDate>();
  eventDates.forEach((date) => {
    dateMap.set(date.date, date);
  });

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Add empty cells for days after the last day of the month to complete the grid
  const remainingCells = 42 - calendarDays.length; // 6 rows * 7 days
  for (let i = 0; i < remainingCells; i++) {
    calendarDays.push(null);
  }

  const formatDateString = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="w-full">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="p-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-lg bg-gray-50"
              />
            );
          }

          const dateStr = formatDateString(date);
          const eventDate = dateMap.get(dateStr);
          const isAvailable = eventDate?.available ?? false;
          const availabilityCount = dateAvailabilityCounts.get(dateStr) ?? 0;
          const isSelected = eventDate?.id === selectedDate;
          const dayNumber = date.getDate().toString().padStart(2, "0");

          return (
            <button
              key={dateStr}
              onClick={() => {
                if (isAvailable && eventDate) {
                  onDateSelect(eventDate.id);
                }
              }}
              disabled={!isAvailable}
              data-umami-event="select-date"
              className={`aspect-square rounded-lg relative transition-all overflow-hidden ${
                isSelected
                  ? "bg-black text-white border border-gray-300 shadow-lg"
                  : isAvailable
                  ? "bg-gray-100 hover:bg-gray-200 text-black cursor-pointer border border-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100"
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{dayNumber}</span>
                {isAvailable && availabilityCount > 0 && (
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-[10px] flex items-center justify-center font-medium">
                    {availabilityCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingSection({ 
  onComplete,
  sidebarMode = false,
  startBooking = false,
  onStartBooking
}: { 
  onComplete?: () => void;
  sidebarMode?: boolean;
  startBooking?: boolean;
  onStartBooking?: () => void;
}) {
  const supabase = createClient();
  const { ref, isVisible } = useReveal(0.3);

  const [currentStep, setCurrentStep] = useState<BookingStep>("sku");
  const [currentSection, setCurrentSection] = useState(0);
  const [eventId, setEventId] = useState<string>("");
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [eventDates, setEventDates] = useState<EventDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const currentMonthString = new Date().toLocaleString("default", { month: "long" });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dateAvailabilityCounts, setDateAvailabilityCounts] = useState<Map<string, number>>(new Map());
  const [startingPrice, setStartingPrice] = useState<number | null>(null);
  
  // Payment and success state
  const [bookingData, setBookingData] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [confirmedBookingDetails, setConfirmedBookingDetails] = useState<any>(null);

  // Checkout form validation errors
  const [formErrors, setFormErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    visitorEmail?: string;
  }>({});

  // Validation helpers for checkout form
  const validateName = (value: string, field: "firstName" | "lastName"): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return field === "firstName" ? "First name is required" : "Last name is required";
    if (trimmed.length < 2) return "At least 2 characters required";
    if (!/^[\p{L}\s\-']+$/u.test(trimmed)) return "Only letters, spaces, hyphens and apostrophes allowed";
    return undefined;
  };
  const validatePhone = (value: string): string | undefined => {
    const digits = value.replace(/\D/g, "");
    if (!digits.length) return "Phone number is required";
    if (digits.length < 10) return "Enter a valid 10-digit phone number";
    if (digits.length > 15) return "Phone number is too long";
    return undefined;
  };
  const validateEmail = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return "Enter a valid email address";
    return undefined;
  };
  const validateCheckoutForm = (): boolean => {
    const errors = {
      firstName: validateName(firstName, "firstName"),
      lastName: validateName(lastName, "lastName"),
      phoneNumber: validatePhone(phoneNumber),
      visitorEmail: validateEmail(visitorEmail),
    };
    setFormErrors(errors);
    return !errors.firstName && !errors.lastName && !errors.phoneNumber && !errors.visitorEmail;
  };

  // Navigate to a specific step (only if allowed) – single-day flow: Tickets then Checkout
  const navigateToStep = (step: BookingStep) => {
    const steps: BookingStep[] = ["sku", "checkout"];
    const stepIndex = steps.indexOf(step);
    const maxAllowed = getMaxAllowedStepIndex();
    if (stepIndex >= 0 && stepIndex <= maxAllowed + 1) {
      setCurrentStep(step);
      setCurrentSection(stepIndex);
    }
  };

  // First, fetch the event to get its UUID and details
  useEffect(() => {
    // Track booking page load
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('page-view-booking');
    }

    const fetchEvent = async () => {
      try {
        // Prefer Holi 2026 event (by title), then first event (schema has title, not name)
        const { data: byTitle } = await supabase
          .from("events")
          .select("id, title, description, venue, start_date, end_date")
          .eq("title", "Rangotsav – 4th Holi 2026")
          .maybeSingle();

        if (byTitle) {
          setEventId(byTitle.id);
          setEventDetails(byTitle);
          return;
        }

        const { data: firstEvent } = await supabase
          .from("events")
          .select("id, title, description, venue, start_date, end_date")
          .limit(1)
          .single();

        if (firstEvent) {
          setEventId(firstEvent.id);
          setEventDetails(firstEvent);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };

    fetchEvent();
  }, [supabase]);

  // Single-day: fetch the one event date and auto-select it
  useEffect(() => {
    if (!eventId) return;

    const fetchSingleDate = async () => {
      try {
        const { data, error } = await supabase
          .from("event_dates")
          .select("*")
          .eq("event_id", eventId)
          .eq("is_available", true)
          .order("date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          setLoading(false);
          return;
        }

        if (data) {
          const mapped = { id: data.id, date: data.date, available: data.is_available };
          setEventDates([mapped]);
          setSelectedDate(data.id);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchSingleDate();
  }, [supabase, eventId]);

  // Single-day: when we have the one date, fetch its time slot(s) and auto-select the first
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimeSlots = async () => {
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("event_date_id", selectedDate)
        .order("start_time", { ascending: true });

      if (!error && data && data.length > 0) {
        setTimeSlots(data);
        setSelectedTimeSlot(data[0].id);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, supabase]);

  // Fetch SKUs when event is loaded (no date/time selection needed)
  useEffect(() => {
    if (!eventId) return;

    const fetchSKUs = async () => {
      const { data, error } = await supabase
        .from("skus")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_active", true)
        .order("base_price", { ascending: true });

      if (!error && data) {
        setSKUs(data);
      }
    };

    fetchSKUs();
  }, [eventId, supabase]);

  // Fetch starting price for sidebar info card
  useEffect(() => {
    const fetchStartingPrice = async () => {
      if (!eventId) return;

      const { data, error } = await supabase
        .from("skus")
        .select("base_price")
        .eq("event_id", eventId)
        .eq("is_active", true)
        .order("base_price", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setStartingPrice(data.base_price);
      }
    };

    fetchStartingPrice();
  }, [eventId, supabase]);

  const handleAddToOrder = (sku: SKU, quantity: number) => {
    if (quantity <= 0) return;

    const existingItem = orderItems.find((item) => item.sku_id === sku.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.sku_id === sku.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          sku_id: sku.id,
          quantity,
          sku_name: sku.name,
          price: sku.base_price,
        },
      ]);
    }
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getSubtotal = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const getTotalAmount = () => {
    const subtotal = getSubtotal();
    const discount = appliedCoupon?.discount_amount || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const subtotal = getSubtotal();
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          event_id: eventId,
          order_total: subtotal,
        }),
      });

      const result = await response.json();

      if (!result.valid) {
        setCouponError(result.error_message || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: result.coupon.code,
          discount_amount: result.discount_amount,
        });
        setCouponError(null);
        setCouponCode(""); // Clear input after successful application
      }
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      setCouponError("Failed to validate coupon. Please try again.");
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleCheckout = async () => {
    if (
      orderItems.length === 0 ||
      !selectedTimeSlot
    ) {
      return;
    }
    if (!validateCheckoutForm()) {
      return;
    }

    // Combine first and last name
    const visitorName = `${firstName} ${lastName}`.trim();

    // Calculate subtotal and discount
    const subtotal = getSubtotal();
    const discountAmount = appliedCoupon?.discount_amount || 0;
    const finalTotal = getTotalAmount();

    // Calculate discount per item proportionally
    const discountPerItem = subtotal > 0 ? discountAmount / subtotal : 0;

    // Create a booking for each order item (or combine into one booking with total quantity)
    // For simplicity, we'll create one booking per SKU
    const bookings = orderItems.map((item) => {
      const itemSubtotal = item.price * item.quantity;
      const itemDiscount = itemSubtotal * discountPerItem;
      const itemTotal = itemSubtotal - itemDiscount;

      return {
        time_slot_id: selectedTimeSlot,
        sku_id: item.sku_id,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        discount_amount: itemDiscount,
        total_price: itemTotal,
        coupon_code: appliedCoupon?.code || null,
        visitor_name: visitorName,
        visitor_email: visitorEmail,
        visitor_phone: phoneNumber,
        status: "pending" as const,
      };
    });

    console.log("Creating bookings with data:", bookings)
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert(bookings)
      .select();

    if (error) {
      console.error("Booking error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      alert(`Failed to create booking: ${error.message}. Please try again.`);
      return;
    }

    if (!booking || booking.length === 0) {
      console.error("No booking returned from insert");
      alert("Failed to create booking. No booking ID returned.");
      return;
    }

    console.log("Booking created successfully:", booking);

    // Update inventory for each booking
    for (const item of orderItems) {
      try {
        // Get current inventory
        const { data: currentInv, error: invFetchError } = await supabase
          .from("inventory")
          .select("available_quantity")
          .eq("time_slot_id", selectedTimeSlot)
          .eq("sku_id", item.sku_id)
          .maybeSingle();

        if (invFetchError && invFetchError.code !== 'PGRST116') {
          // PGRST116 is "not found" which is okay, but other errors should be logged
          console.error("Error fetching inventory:", invFetchError);
          continue;
        }

        if (currentInv) {
          const newQuantity = Math.max(
            0,
            currentInv.available_quantity - item.quantity
          );
          const { error: invError } = await supabase
            .from("inventory")
            .update({ available_quantity: newQuantity })
            .eq("time_slot_id", selectedTimeSlot)
            .eq("sku_id", item.sku_id);

          if (invError) {
            console.error("Error updating inventory:", invError);
          }
        } else {
          console.warn(`No inventory found for time_slot_id: ${selectedTimeSlot}, sku_id: ${item.sku_id}`);
        }
      } catch (err) {
        console.error("Error in inventory update loop:", err);
      }
    }

    // Store all booking IDs
    const bookingIds = booking?.map(b => b.id) || [];
    if (bookingIds.length > 0) {
      // Fetch ALL booking details with relations for payment page
      const { data: allBookings } = await supabase
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
        .in("id", bookingIds);

      if (allBookings && allBookings.length > 0) {
        // Use first booking for time slot and event info (they should all be the same)
        const firstBooking = allBookings[0];
        const timeSlot = firstBooking.time_slots as any;
        const eventDate = timeSlot?.event_dates as any;
        
        // Calculate total price from all bookings
        const totalPrice = allBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        const totalDiscount = allBookings.reduce((sum, b) => sum + (b.discount_amount || 0), 0);
        const subtotal = allBookings.reduce((sum, b) => sum + (b.subtotal || b.total_price || 0), 0);
        
        // Get all ticket types
        const ticketTypes = allBookings.map(b => ({
          bookingId: b.id,
          ticketType: (b.skus as any)?.name || "Ticket",
          quantity: b.quantity,
          price: b.total_price,
        }));

        setBookingData({
          bookingIds: bookingIds,
          allBookings: allBookings,
          visitorName: firstBooking.visitor_name,
          visitorEmail: firstBooking.email || firstBooking.visitor_email,
          ticketTypes: ticketTypes,
          subtotal: subtotal,
          discountAmount: totalDiscount,
          totalPrice: totalPrice,
          couponCode: appliedCoupon?.code || null,
          timeSlot: timeSlot,
          date: eventDate?.date || new Date().toISOString().split('T')[0],
          eventName: eventDate?.events?.name || eventDate?.events?.title || "Rangotsav – 4th Holi 2026",
        });
        setCurrentStep("payment");
      }
    }
  };

  const handlePayment = async () => {
    if (!bookingData?.bookingIds || bookingData.bookingIds.length === 0) return;
    
    setProcessingPayment(true);
    
    try {
      const phonePeResponse = await fetch('https://payment-lovat-eight.vercel.app/api/phonepe/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round((bookingData.totalPrice) * 100), // Convert to paise
          redirectUrl: `${window.location.origin}/booking?payment_success=true`,
          message: `Payment for ${bookingData.eventName || 'Rangotsav – 4th Holi 2026'}`
        }),
      });

      const phonePeResult = await phonePeResponse.json();
        //TOdo handle error
      if (!phonePeResult.success || !phonePeResult.data?.redirectUrl) {
        throw new Error(phonePeResult.message || 'Failed to initiate payment');
      }

      // Store merchantOrderId and essential booking data for post-payment verification
      sessionStorage.setItem('phonePeMerchantOrderId', phonePeResult.data.merchantOrderId);
      sessionStorage.setItem('phonePeBookingData', JSON.stringify({
        bookingIds: bookingData.bookingIds,
        visitorName: bookingData.visitorName,
        visitorEmail: bookingData.visitorEmail,
        ticketTypes: bookingData.ticketTypes,
        totalPrice: bookingData.totalPrice,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        eventName: bookingData.eventName,
        couponCode: bookingData.couponCode
      }));

      // Redirect to PhonePe checkout
      window.location.href = phonePeResult.data.redirectUrl;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  // Handle post-payment processing (called when user returns from PhonePe)
  const handlePostPayment = async () => {
    const merchantOrderId = sessionStorage.getItem('phonePeMerchantOrderId');
    const bookingDataStr = sessionStorage.getItem('phonePeBookingData');
    
    if (!merchantOrderId || !bookingDataStr) return;

    try {
      const bookingData = JSON.parse(bookingDataStr);
      if (!bookingData?.bookingIds) return;

      // Verify payment status with backend
      const statusResponse = await fetch('https://payment-lovat-eight.vercel.app/api/phonepe/order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantOrderId,
          details: true
        }),
      });

      const statusResult = await statusResponse.json();

      if (!statusResult.success || statusResult.data.state !== 'COMPLETED') {
        throw new Error('Payment not completed');
      }

      // Prepare ticket details for QR code
      const tickets = bookingData.ticketTypes?.map((t: any) => ({
        bookingId: t.bookingId,
        ticketType: t.ticketType,
        quantity: t.quantity,
        price: t.price,
      })) || [];

      // Generate QR code with ALL booking details
      const qrData = {
        bookingIds: bookingData.bookingIds,
        visitorName: bookingData.visitorName,
        visitorEmail: bookingData.visitorEmail,
        tickets: tickets,
        totalPrice: bookingData.totalPrice,
        date: bookingData.date || new Date().toISOString().split('T')[0],
        time: bookingData.timeSlot?.start_time || '',
        endTime: bookingData.timeSlot?.end_time || '',
        eventName: bookingData.eventName || "Rangotsav – 4th Holi 2026",
        status: "confirmed",
      };

      const qrCodeDataUrl = await generateBookingQRCode(qrData);

      // Update ALL bookings status to confirmed and store QR code
      const { data: updatedBookings, error } = await supabase
        .from("bookings")
        .update({ 
          status: "confirmed",
          qr_code: qrCodeDataUrl,
        })
        .in("id", bookingData.bookingIds)
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
        `);

        
      if (error) {
        console.error("Error updating bookings:", error);
        alert("Payment processed but failed to update bookings. Please contact support.");
      } else {
        setConfirmedBookingDetails(updatedBookings);
        setQrCodeDataUrl(qrCodeDataUrl);

        // Meta Pixel: track Purchase for conversion
        trackPurchase({
          value: bookingData.totalPrice ?? 0,
          currency: "INR",
          content_ids: bookingData.bookingIds ?? [],
          content_type: "product",
          num_items: bookingData.ticketTypes?.reduce((n: number, t: any) => n + (t.quantity ?? 0), 0) ?? 0,
          order_id: bookingData.bookingIds?.[0] ?? undefined,
        });

        // Increment coupon usage count if coupon was used
        if (bookingData.couponCode) {
          try {
            const { data: couponData } = await supabase
              .from("coupons")
              .select("used_count")
              .eq("code", bookingData.couponCode)
              .maybeSingle();

            if (couponData) {
              await supabase
                .from("coupons")
                .update({ used_count: couponData.used_count + 1 })
                .eq("code", bookingData.couponCode);
            }
          } catch (err) {
            console.error("Error incrementing coupon usage:", err);
            // Don't fail the payment if coupon increment fails
          }
        }

        // Move to success step
        setCurrentStep("success");
      }
    } catch (err) {
      console.error("Error processing post-payment:", err);
      alert("Payment verification failed. Please contact support.");
    } finally {
      sessionStorage.removeItem('phonePeMerchantOrderId');
      sessionStorage.removeItem('phonePeBookingData');
    }
  };

  // Check for payment success on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      handlePostPayment();
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Check if a step is completed


  const isStepCompleted = (step: BookingStep): boolean => {
    switch (step) {
      case "sku":
        return selectedTimeSlot !== "" && orderItems.length > 0;
      case "checkout":
        return orderItems.length > 0 && firstName !== "" && lastName !== "" && phoneNumber !== "" && visitorEmail !== "";
      default:
        return false;
    }
  };

  // Get the maximum allowed step index (0 = sku, 1 = checkout)
  const getMaxAllowedStepIndex = (): number => {
    if (isStepCompleted("checkout")) return 1;
    if (isStepCompleted("sku")) return 0;
    return -1;
  };

  // Navigate to a step
  const scrollToStep = (step: BookingStep) => {
    if (sidebarMode) {
      setCurrentStep(step);
    } else {
      navigateToStep(step);
    }
  };

  if (sidebarMode) {
    // Format date range for display
    const formatDateRange = () => {
      if (!eventDetails?.start_date || !eventDetails?.end_date) {
        return "November 29 | 11AM - January 31 | 11:30PM";
      }
      const start = new Date(eventDetails.start_date);
      const end = new Date(eventDetails.end_date);
      const startMonth = start.toLocaleDateString("en-US", { month: "long" });
      const startDay = start.getDate();
      const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      const endMonth = end.toLocaleDateString("en-US", { month: "long" });
      const endDay = end.getDate();
      const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      return `${startMonth} ${startDay} | ${startTime} - ${endMonth} ${endDay} | ${endTime}`;
    };

    return (
      <div 
        className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-white"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="h-full flex flex-col">
          {/* Event Info Card - Shown when booking hasn't started */}
          {!startBooking && (
            <div className="flex-shrink-0 scroll-snap-align-start scroll-snap-stop-always min-h-full flex flex-col p-6 lg:p-8">
              <div className="flex flex-col h-full">
                {/* Event Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-black mb-6 leading-tight">
                  {eventDetails?.name || eventDetails?.title || "Rangotsav – 4th Holi 2026"}
                </h2>

                {/* Event Details */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <Bookmark className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Art Exhibitions, Art Installations</span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      {formatDateRange()}
                    </span>
                  </div>
                  
                  {eventDetails?.venue && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{eventDetails.venue}</span>
                    </div>
                  )}
                </div>

                {/* Price and Book Button */}
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Starts from</p>
                      <p className="text-2xl font-bold text-black">
                        {startingPrice ? `₹${Math.round(startingPrice).toLocaleString()}` : "₹1,000"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (onStartBooking) {
                          onStartBooking();
                        }
                        setCurrentStep("sku");
                      }}
                      className="px-6 py-3 bg-black hover:bg-black/90 text-white font-bold text-sm uppercase tracking-wide rounded-lg transition-all active:scale-95 whitespace-nowrap shadow-lg"
                      data-umami-event="book-tickets-start"
                    >
                      <span className="relative z-10">BOOK TICKETS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Selection Section (Step 1 of 2) */}
          {currentStep === "sku" && (
            <div className="flex-shrink-0 scroll-snap-align-start scroll-snap-stop-always min-h-full flex flex-col p-4 sm:p-6 lg:p-8">
              <button
                onClick={() => onComplete?.()}
                className="mb-4 sm:mb-6 self-start text-gray-600 hover:text-black transition-colors text-sm sm:text-base"
              >
                ← Back
              </button>

              <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">
                  Select Tickets
                </h2>
                <p className="text-gray-600 text-sm">
                  Choose your ticket type and quantity
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {skus.map((sku) => {
                  const item = orderItems.find((o) => o.sku_id === sku.id);
                  const quantity = item ? item.quantity : 0;

                  return (
                    <div
                      key={sku.id}
                      className="p-5 rounded-lg border-2 border-gray-300 bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Ticket className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-black">
                              {sku.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {sku.category}
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="text-xl font-light text-black">
                              ₹{sku.base_price.toFixed(0)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (quantity > 0) {
                              setOrderItems(
                                orderItems
                                  .map((o) =>
                                    o.sku_id === sku.id
                                      ? { ...o, quantity: o.quantity - 1 }
                                      : o
                                  )
                                  .filter((o) => o.quantity > 0)
                              );
                            }
                          }}
                          disabled={quantity === 0}
                          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-black">
                          {quantity}
                        </span>
                        <button
                          onClick={() => {
                            const existing = orderItems.find(
                              (o) => o.sku_id === sku.id
                            );
                            if (existing) {
                              setOrderItems(
                                orderItems.map((o) =>
                                  o.sku_id === sku.id
                                    ? { ...o, quantity: o.quantity + 1 }
                                    : o
                                )
                              );
                            } else {
                              setOrderItems([
                                ...orderItems,
                                {
                                  sku_id: sku.id,
                                  quantity: 1,
                                  sku_name: sku.name,
                                  price: sku.base_price,
                                },
                              ]);
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary - Removed from here, now in fixed bottom bar */}
            </div>
          )}

          {/* Checkout Section */}
          {currentStep === "checkout" && (
            <div className="flex-shrink-0 scroll-snap-align-start scroll-snap-stop-always min-h-full flex flex-col p-4 sm:p-6 lg:p-8">
              <button
                onClick={() => scrollToStep("sku")}
                className="mb-4 sm:mb-6 self-start text-gray-600 hover:text-black transition-colors text-sm sm:text-base"
              >
                ← Back
              </button>

              <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">
                  Checkout
                </h2>
                <p className="text-gray-600 text-sm">
                  Complete your booking details
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 pb-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (formErrors.firstName) setFormErrors((prev) => ({ ...prev, firstName: undefined }));
                      }}
                      onBlur={() => setFormErrors((prev) => ({ ...prev, firstName: validateName(firstName, "firstName") }))}
                      className={`w-full px-4 py-3 rounded-lg bg-white border placeholder-gray-400 text-black focus:outline-none focus:ring-2 ${
                        formErrors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (formErrors.lastName) setFormErrors((prev) => ({ ...prev, lastName: undefined }));
                      }}
                      onBlur={() => setFormErrors((prev) => ({ ...prev, lastName: validateName(lastName, "lastName") }))}
                      className={`w-full px-4 py-3 rounded-lg bg-white border placeholder-gray-400 text-black focus:outline-none focus:ring-2 ${
                        formErrors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number (e.g. 9876543210)"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (formErrors.phoneNumber) setFormErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                      }}
                      onBlur={() => setFormErrors((prev) => ({ ...prev, phoneNumber: validatePhone(phoneNumber) }))}
                      className={`w-full px-4 py-3 rounded-lg bg-white border placeholder-gray-400 text-black focus:outline-none focus:ring-2 ${
                        formErrors.phoneNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={visitorEmail}
                      onChange={(e) => {
                        setVisitorEmail(e.target.value);
                        if (formErrors.visitorEmail) setFormErrors((prev) => ({ ...prev, visitorEmail: undefined }));
                      }}
                      onBlur={() => setFormErrors((prev) => ({ ...prev, visitorEmail: validateEmail(visitorEmail) }))}
                      className={`w-full px-4 py-3 rounded-lg bg-white border placeholder-gray-400 text-black focus:outline-none focus:ring-2 ${
                        formErrors.visitorEmail ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"
                      }`}
                    />
                    {formErrors.visitorEmail && <p className="mt-1 text-sm text-red-600">{formErrors.visitorEmail}</p>}
                  </div>
                  
                  {/* Coupon Code Input */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code (Optional)"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !applyingCoupon) {
                            handleApplyCoupon();
                          }
                        }}
                        disabled={!!appliedCoupon || applyingCoupon}
                        className={`flex-1 px-4 py-3 rounded-lg bg-white placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-black border ${
                          couponError
                            ? "border-red-500"
                            : appliedCoupon
                            ? "border-green-500"
                            : "border-gray-300"
                        } ${appliedCoupon || applyingCoupon ? "opacity-60 cursor-not-allowed" : ""}`}
                      />
                      {appliedCoupon ? (
                        <button
                          onClick={handleRemoveCoupon}
                          className="px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors whitespace-nowrap"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="px-4 py-3 rounded-lg bg-black hover:bg-black/90 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {applyingCoupon ? "Applying..." : "Apply"}
                        </button>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <p className="text-sm text-green-600">
                        Coupon "{appliedCoupon.code}" applied! You saved ₹{appliedCoupon.discount_amount.toFixed(0)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Summary - Removed from here, now in fixed bottom bar */}
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === "payment" && bookingData && (
            <div className="flex-shrink-0 scroll-snap-align-start scroll-snap-stop-always min-h-full flex flex-col p-4 sm:p-6 lg:p-8">
              <button
                onClick={() => setCurrentStep("checkout")}
                className="mb-4 sm:mb-6 self-start text-gray-600 hover:text-black transition-colors text-sm sm:text-base"
                data-umami-event="payment-back"
              >
                ← Back
              </button>

              <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-light text-black mb-2">
                  Secure Payment
                </h2>
                <p className="text-gray-600 text-sm">
                  Complete your Holi booking
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pb-4">
                <Card className="border-gray-300 bg-white">
                  <CardHeader>
                    <CardTitle className="text-black">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visitor Name</span>
                      <span className="font-medium text-black">{bookingData.visitorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-black text-sm">{bookingData.visitorEmail}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-sm font-medium text-black mb-2">Tickets:</p>
                      {bookingData.ticketTypes?.map((ticket: any, index: number) => (
                        <div key={index} className="flex justify-between mb-2">
                          <span className="text-gray-700">
                            {ticket.ticketType} × {ticket.quantity}
                          </span>
                          <span className="font-medium text-black">₹{ticket.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                      {bookingData.subtotal && bookingData.subtotal !== bookingData.totalPrice && (
                        <>
                          <div className="flex justify-between text-sm text-gray-700">
                            <span>Subtotal</span>
                            <span>₹{bookingData.subtotal.toFixed(0)}</span>
                          </div>
                          {bookingData.discountAmount && bookingData.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount {bookingData.couponCode ? `(${bookingData.couponCode})` : ""}</span>
                              <span>-₹{bookingData.discountAmount.toFixed(0)}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-black">Total Amount</span>
                        <span className="text-3xl font-light text-black">₹{bookingData.totalPrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-300 bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-black mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-black mb-1">Dummy Payment Gateway</p>
                        <p className="text-sm text-gray-600">
                          This is a test payment flow. Clicking "Pay Now" will simulate a successful payment.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Button
                    onClick={handlePayment}
                    disabled={processingPayment}
                    className="w-full font-semibold py-6"
                    data-umami-event="pay-now"
                  >
                    {processingPayment ? "Processing..." : "Pay Now (Dummy)"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("checkout")}
                    className="w-full opacity-50 border-gray-300 text-black hover:bg-gray-50"
                    data-umami-event="cancel-booking"
                  >
                    Cancel Booking
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === "success" && (
            <div className="flex-shrink-0 scroll-snap-align-start scroll-snap-stop-always min-h-full flex flex-col p-4 sm:p-6 lg:p-8 items-center justify-center">
              <Card className="w-full max-w-md border-gray-300 bg-white">
                <CardContent className="pt-12 pb-12 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
                  <h1 className="text-4xl md:text-5xl font-light text-black mb-2">Booking Confirmed!</h1>
                  <div className="text-gray-700 mb-6 space-y-2 text-lg">
                    <p>Your Holi tickets have been confirmed.</p>
                    {confirmedBookingDetails?.visitor_name && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-black">{confirmedBookingDetails.visitor_name}</span>
                      </p>
                    )}
                    {(confirmedBookingDetails?.email || confirmedBookingDetails?.visitor_email) && (
                      <p className="text-sm text-gray-600">
                        Confirmation sent to: <span className="font-medium text-black">{confirmedBookingDetails?.email || confirmedBookingDetails?.visitor_email}</span>
                      </p>
                    )}
                  </div>

                  {qrCodeDataUrl && (
                    <div className="mb-6 flex flex-col items-center">
                      <div className="rounded-xl bg-white p-4 mb-3 shadow-lg">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Booking QR Code" 
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs text-gray-600 text-center max-w-xs mb-3">
                        Show this QR code at the venue entrance. It contains all your booking details.
                      </p>
                      {confirmedBookingDetails && Array.isArray(confirmedBookingDetails) && confirmedBookingDetails.length > 0 && (
                        <div className="mt-2 w-full text-left space-y-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p><span className="font-medium text-black">Name:</span> {confirmedBookingDetails[0].visitor_name}</p>
                          <p><span className="font-medium text-black">Email:</span> {confirmedBookingDetails[0].email || confirmedBookingDetails[0].visitor_email}</p>
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <p className="font-medium mb-1 text-black">Tickets:</p>
                            {confirmedBookingDetails.map((booking: any, index: number) => (
                              <p key={index} className="ml-2">
                                • {(booking.skus as any)?.name || "Ticket"} × {booking.quantity} - ₹{booking.total_price}
                              </p>
                            ))}
                          </div>
                          <p><span className="font-medium text-black">Total Price:</span> ₹{confirmedBookingDetails.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)}</p>
                          {confirmedBookingDetails[0].time_slots && (
                            <p>
                              <span className="font-medium text-black">Time:</span> {String((confirmedBookingDetails[0].time_slots as any).start_time).split(':').slice(0, 2).join(':')} - {String((confirmedBookingDetails[0].time_slots as any).end_time).split(':').slice(0, 2).join(':')}
                            </p>
                          )}
                        </div>
                      )}
                      {confirmedBookingDetails && !Array.isArray(confirmedBookingDetails) && (
                        <div className="mt-2 w-full text-left space-y-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p><span className="font-medium text-black">Name:</span> {confirmedBookingDetails.visitor_name}</p>
                          <p><span className="font-medium text-black">Email:</span> {confirmedBookingDetails.email || confirmedBookingDetails.visitor_email}</p>
                          <p><span className="font-medium text-black">Ticket Type:</span> {(confirmedBookingDetails.skus as any)?.name || "General Admission"}</p>
                          <p><span className="font-medium text-black">Quantity:</span> {confirmedBookingDetails.quantity}</p>
                          {confirmedBookingDetails.total_price && (
                            <p><span className="font-medium text-black">Total Price:</span> ₹{confirmedBookingDetails.total_price}</p>
                          )}
                          {confirmedBookingDetails.time_slots && (
                            <p>
                              <span className="font-medium text-black">Time:</span> {String((confirmedBookingDetails.time_slots as any).start_time).split(':').slice(0, 2).join(':')} - {String((confirmedBookingDetails.time_slots as any).end_time).split(':').slice(0, 2).join(':')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setCurrentStep("date");
                    setBookingData(null);
                    setConfirmedBookingDetails(null);
                    setQrCodeDataUrl(null);
                    setFirstName("");
                    setLastName("");
                    setPhoneNumber("");
                    setVisitorEmail("");
                    setOrderItems([]);
                    setCouponCode("");
                    setAppliedCoupon(null);
                    setCouponError(null);
                    if (onComplete) onComplete();
                    }}
                    className="w-full bg-black hover:bg-black/90 text-white"
                    data-umami-event="book-another-ticket"
                  >
                    Book Another Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Fixed Bottom Bar - Mobile Style */}
          {(currentStep === "sku" || currentStep === "checkout") && (
            <div className="sticky bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg mt-auto">
              <div className="flex items-center justify-between p-4 gap-4">
                {/* Left Side - Price Info */}
                <div className="flex-1 min-w-0">
                  {currentStep === "sku" && orderItems.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Starts from</p>
                      <p className="text-2xl font-bold text-black">
                        ₹{getTotalAmount().toFixed(0)}
                      </p>
                    </div>
                  )}
                  {currentStep === "checkout" && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">Total Amount</p>
                      {appliedCoupon && (
                        <p className="text-xs text-green-600 line-through">
                          ₹{getSubtotal().toFixed(0)}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-black">
                        ₹{getTotalAmount().toFixed(0)}
                      </p>
                      {appliedCoupon && (
                        <p className="text-xs text-green-600">
                          Saved ₹{appliedCoupon.discount_amount.toFixed(0)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side - Action Button */}
                <div className="flex-shrink-0">
                  {currentStep === "sku" && (
                    <button
                      onClick={() => scrollToStep("checkout")}
                      disabled={orderItems.length === 0}
                      className="px-6 py-3 rounded-lg bg-black hover:bg-black/90 text-white font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg"
                      data-umami-event="proceed-to-checkout"
                    >
                      <span>Proceed to Checkout</span>
                    </button>
                  )}
                  {currentStep === "checkout" && (
                    <button
                      onClick={handleCheckout}
                      disabled={!firstName || !lastName || !phoneNumber || !visitorEmail || orderItems.length === 0}
                      className="px-6 py-3 rounded-lg bg-black hover:bg-black/90 text-white font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg"
                      data-umami-event="proceed-to-payment"
                    >
                      <span>Proceed to Payment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section
      ref={ref}
      className="relative h-screen w-screen shrink-0 snap-start overflow-hidden bg-white"
    >
      <nav
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 bg-white/95 backdrop-blur-sm border-b border-gray-200 md:px-12"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => onComplete?.()}
            className="flex items-center transition-transform hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-all duration-300 hover:scale-110 hover:bg-gray-200">
              <span className="font-sans text-xl font-bold text-gray-900">
                ←
              </span>
            </div>
          </button>
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

        <div className="hidden items-center gap-8 md:flex">
          {["Tickets", "Checkout"].map((item, index) => {
            const steps: BookingStep[] = ["sku", "checkout"];
            const step = steps[index];
            const maxAllowed = getMaxAllowedStepIndex();
            const isEnabled = index <= maxAllowed + 1;
            const isCompleted = isStepCompleted(step);
            
            return (
              <button
                key={item}
                onClick={() => {
                  if (isEnabled) {
                    navigateToStep(step);
                  }
                }}
                disabled={!isEnabled}
                className={`group relative font-sans text-sm font-medium transition-colors ${
                  !isEnabled
                    ? "text-gray-300 cursor-not-allowed"
                    : currentStep === step
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item}
                {isCompleted && (
                  <span className="ml-1 text-green-600">✓</span>
                )}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-gray-900 transition-all duration-300 ${
                    currentStep === step && isEnabled ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </nav>

      <div className="relative z-10 h-screen overflow-y-auto">
        {/* Ticket Selection Section (Step 1 of 2) */}
        {currentStep === "sku" && (
        <section className="flex min-h-screen w-full flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl">
            <div className="mb-4 inline-block rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
              <p className="font-mono text-xs text-gray-600 flex items-center gap-2">
                <Ticket className="h-3 w-3" />
                Step 1 of 2
              </p>
            </div>
            <h2 className="mb-6 font-sans text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-gray-900">
              <span className="text-balance">Select Tickets</span>
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600 md:text-xl">
              <span className="text-pretty">
                Choose your ticket type and quantity for the Holi experience.
              </span>
            </p>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : skus.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  No ticket types available.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {skus.map((sku) => {
                  const item = orderItems.find((o) => o.sku_id === sku.id);
                  const quantity = item ? item.quantity : 0;

                  return (
                    <div
                      key={sku.id}
                      className="p-6 rounded-lg bg-white hover:bg-gray-50 transition-all border border-gray-200"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        {sku.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {sku.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{sku.base_price.toFixed(0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (quantity > 0) {
                                setOrderItems(
                                  orderItems
                                    .map((o) =>
                                      o.sku_id === sku.id
                                        ? { ...o, quantity: o.quantity - 1 }
                                        : o
                                    )
                                    .filter((o) => o.quantity > 0)
                                );
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition-all"
                            data-umami-event="sku-decrease-quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() => {
                              const existing = orderItems.find(
                                (o) => o.sku_id === sku.id
                              );
                              if (existing) {
                                setOrderItems(
                                  orderItems.map((o) =>
                                    o.sku_id === sku.id
                                      ? { ...o, quantity: o.quantity + 1 }
                                      : o
                                  )
                                );
                              } else {
                                setOrderItems([
                                  ...orderItems,
                                  {
                                    sku_id: sku.id,
                                    quantity: 1,
                                    sku_name: sku.name,
                                    price: sku.base_price,
                                  },
                                ]);
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition-all"
                            data-umami-event="sku-increase-quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <div className="p-6 rounded-lg bg-gray-50 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Order Summary
                </h3>
                {orderItems.map((item) => (
                  <div
                    key={item.sku_id}
                    className="flex justify-between text-sm mb-2 text-gray-700"
                  >
                    <span>
                      {item.sku_name} × {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span>
                      ₹
                      {orderItems
                        .reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        )
                        .toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <MagneticButton
                onClick={() => onComplete?.()}
                variant="secondary"
              >
                Back
              </MagneticButton>
              {orderItems.length > 0 ? (
                <MagneticButton
                  onClick={() => {
                    navigateToStep("checkout");
                  }}
                  variant="primary"
                >
                  Continue to Checkout
                </MagneticButton>
              ) : (
                <button className="px-6 py-2.5 text-sm rounded-full font-medium bg-gray-200 text-gray-400 cursor-not-allowed opacity-50">
                  Continue to Checkout
                </button>
              )}
            </div>
          </div>
        </section>
        )}

        {/* Checkout Section (Step 2 of 2) */}
        {currentStep === "checkout" && (
        <section className="flex min-h-screen w-full flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl">
            <div className="mb-4 inline-block rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
              <p className="font-mono text-xs text-gray-600 flex items-center gap-2">
                <User className="h-3 w-3" />
                Step 2 of 2
              </p>
            </div>
            <h2 className="mb-6 font-sans text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-gray-900">
              <span className="text-balance">Visitor Details</span>
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600 md:text-xl">
              <span className="text-pretty">
                Complete your booking by providing your contact information.
              </span>
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (formErrors.firstName) setFormErrors((prev) => ({ ...prev, firstName: undefined }));
                  }}
                  onBlur={() => setFormErrors((prev) => ({ ...prev, firstName: validateName(firstName, "firstName") }))}
                  className={`w-full px-4 py-3 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 border ${
                    formErrors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.firstName && <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (formErrors.lastName) setFormErrors((prev) => ({ ...prev, lastName: undefined }));
                  }}
                  onBlur={() => setFormErrors((prev) => ({ ...prev, lastName: validateName(lastName, "lastName") }))}
                  className={`w-full px-4 py-3 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 border ${
                    formErrors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.lastName && <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 9876543210)"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (formErrors.phoneNumber) setFormErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                  }}
                  onBlur={() => setFormErrors((prev) => ({ ...prev, phoneNumber: validatePhone(phoneNumber) }))}
                  className={`w-full px-4 py-3 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 border ${
                    formErrors.phoneNumber ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>}
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={visitorEmail}
                  onChange={(e) => {
                    setVisitorEmail(e.target.value);
                    if (formErrors.visitorEmail) setFormErrors((prev) => ({ ...prev, visitorEmail: undefined }));
                  }}
                  onBlur={() => setFormErrors((prev) => ({ ...prev, visitorEmail: validateEmail(visitorEmail) }))}
                  className={`w-full px-4 py-3 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 border ${
                    formErrors.visitorEmail ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                  }`}
                />
                {formErrors.visitorEmail && <p className="mt-1 text-sm text-red-600">{formErrors.visitorEmail}</p>}
              </div>
              
              {/* Coupon Code Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code (Optional)"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !applyingCoupon) {
                        handleApplyCoupon();
                      }
                    }}
                    disabled={!!appliedCoupon || applyingCoupon}
                    className={`flex-1 px-4 py-3 rounded-lg bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 border ${
                      couponError
                        ? "border-red-500"
                        : appliedCoupon
                        ? "border-green-500"
                        : "border-gray-300"
                    } ${appliedCoupon || applyingCoupon ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-3 rounded-lg bg-black hover:bg-gray-800 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applyingCoupon ? "Applying..." : "Apply"}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-sm text-red-600">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-sm text-green-600">
                    Coupon "{appliedCoupon.code}" applied! You saved ₹{appliedCoupon.discount_amount.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gray-50 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Order Summary
              </h3>
              {orderItems.map((item) => (
                <div
                  key={item.sku_id}
                  className="flex justify-between text-sm mb-2 text-gray-700"
                >
                  <span>
                    {item.sku_name} × {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal().toFixed(0)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount_amount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span>₹{getTotalAmount().toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <MagneticButton
                onClick={() => {
                  navigateToStep("sku");
                }}
                variant="secondary"
              >
                Back
              </MagneticButton>
              {firstName && lastName && phoneNumber && visitorEmail && orderItems.length > 0 ? (
                <MagneticButton
                  onClick={() => {
                    handleCheckout();
                  }}
                  variant="primary"
                >
                  Proceed to Payment
                </MagneticButton>
              ) : (
                <button className="px-6 py-2.5 text-sm rounded-full font-medium bg-gray-200 text-gray-400 cursor-not-allowed opacity-50">
                  Proceed to Payment
                </button>
              )}
            </div>
          </div>
        </section>
        )}

        {/* Payment Step */}
        {currentStep === "payment" && bookingData && (
        <section className="flex min-h-screen w-full flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl">
            <div className="mb-4 inline-block rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5">
              <p className="font-mono text-xs text-gray-600 flex items-center gap-2">
                <CreditCard className="h-3 w-3" />
                Payment
              </p>
            </div>
            <h2 className="mb-6 font-sans text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-gray-900">
              <span className="text-balance">Secure Payment</span>
            </h2>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-600 md:text-xl">
              Complete your booking
            </p>

            <div className="space-y-6 mb-8">
              <Card className="border-gray-300 bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visitor Name</span>
                    <span className="font-medium text-black">{bookingData.visitorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-black text-sm">{bookingData.visitorEmail}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-sm font-medium text-black mb-2">Tickets:</p>
                    {bookingData.ticketTypes?.map((ticket: any, index: number) => (
                      <div key={index} className="flex justify-between mb-2">
                        <span className="text-gray-700">
                          {ticket.ticketType} × {ticket.quantity}
                        </span>
                        <span className="font-medium text-black">₹{ticket.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    {bookingData.subtotal && bookingData.subtotal !== bookingData.totalPrice && (
                      <>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Subtotal</span>
                          <span>₹{bookingData.subtotal.toFixed(0)}</span>
                        </div>
                        {bookingData.discountAmount && bookingData.discountAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount {bookingData.couponCode ? `(${bookingData.couponCode})` : ""}</span>
                            <span>-₹{bookingData.discountAmount.toFixed(0)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-black">Total Amount</span>
                      <span className="text-3xl font-light text-black">₹{bookingData.totalPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-300 bg-gray-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-black mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-black mb-1">Dummy Payment Gateway</p>
                      <p className="text-sm text-gray-600">
                        This is a test payment flow. Clicking "Pay Now" will simulate a successful payment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="w-full font-semibold py-6"
                >
                  {processingPayment ? "Processing..." : "Pay Now (Dummy)"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => navigateToStep("checkout")}
                  className="w-full opacity-50 border-gray-300 "
                >
                  Cancel Booking
                </Button>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Success Step */}
        {currentStep === "success" && (
        <section className="flex min-h-screen w-full flex-col justify-center px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="w-full max-w-4xl mx-auto">
            <Card className="w-full max-w-md mx-auto border-gray-300 bg-white">
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
                <h1 className="text-4xl md:text-5xl font-light text-black mb-2">Booking Confirmed!</h1>
                <div className="text-gray-700 mb-6 space-y-2 text-lg">
                  <p>Your Holi tickets have been confirmed.</p>
                  {confirmedBookingDetails && Array.isArray(confirmedBookingDetails) && confirmedBookingDetails[0]?.visitor_name && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-black">{confirmedBookingDetails[0].visitor_name}</span>
                    </p>
                  )}
                  {confirmedBookingDetails && Array.isArray(confirmedBookingDetails) && (confirmedBookingDetails[0]?.email || confirmedBookingDetails[0]?.visitor_email) && (
                    <p className="text-sm text-gray-600">
                      Confirmation sent to: <span className="font-medium text-black">{confirmedBookingDetails[0]?.email || confirmedBookingDetails[0]?.visitor_email}</span>
                    </p>
                  )}
                </div>

                {qrCodeDataUrl && (
                  <div className="mb-6 flex flex-col items-center">
                    <div className="rounded-xl bg-white p-4 mb-3 shadow-lg">
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Booking QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-xs text-gray-600 text-center max-w-xs mb-3">
                      Show this QR code at the venue entrance. It contains all your booking details.
                    </p>
                    {confirmedBookingDetails && Array.isArray(confirmedBookingDetails) && confirmedBookingDetails.length > 0 && (
                      <div className="mt-2 w-full text-left space-y-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p><span className="font-medium text-black">Name:</span> {confirmedBookingDetails[0].visitor_name}</p>
                        <p><span className="font-medium text-black">Email:</span> {confirmedBookingDetails[0].email || confirmedBookingDetails[0].visitor_email}</p>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <p className="font-medium mb-1 text-black">Tickets:</p>
                          {confirmedBookingDetails.map((booking: any, index: number) => (
                            <p key={index} className="ml-2">
                              • {(booking.skus as any)?.name || "Ticket"} × {booking.quantity} - ₹{booking.total_price}
                            </p>
                          ))}
                        </div>
                        <p><span className="font-medium text-black">Total Price:</span> ₹{confirmedBookingDetails.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)}</p>
                        {confirmedBookingDetails[0].time_slots && (
                          <p>
                            <span className="font-medium text-black">Time:</span> {(confirmedBookingDetails[0].time_slots as any).start_time} - {(confirmedBookingDetails[0].time_slots as any).end_time}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => {
                    setCurrentStep("date");
                    setBookingData(null);
                    setConfirmedBookingDetails(null);
                    setQrCodeDataUrl(null);
                    setFirstName("");
                    setLastName("");
                    setPhoneNumber("");
                    setVisitorEmail("");
                    setOrderItems([]);
                    setSelectedDate("");
                    setSelectedTimeSlot("");
                    setCouponCode("");
                    setAppliedCoupon(null);
                    setCouponError(null);
                    if (onComplete) onComplete();
                  }}
                  className="w-full"
                >
                  Book Another Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        )}
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
