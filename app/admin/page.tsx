"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar, Clock, Ticket, Package, Tag, Home, Settings } from "lucide-react"

interface EventDate {
  id: string
  date: string
  is_available: boolean
}

interface TimeSlot {
  id: string
  event_date_id: string
  start_time: string
  end_time: string
  capacity: number
}

interface SKU {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  is_active: boolean
}

interface Inventory {
  id: string
  time_slot_id: string
  sku_id: string
  total_quantity: number
  available_quantity: number
}

interface Coupon {
  id: string
  code: string
  event_id: string | null
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  min_order_amount: number | null
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("dates")
  const [eventId, setEventId] = useState<string | null>(null)
  const [dates, setDates] = useState<EventDate[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [skus, setSKUs] = useState<SKU[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [newDate, setNewDate] = useState("")
  const [selectedDateForSlots, setSelectedDateForSlots] = useState<string | null>(null)
  const [newSlotStartTime, setNewSlotStartTime] = useState("09:00")
  const [newSlotEndTime, setNewSlotEndTime] = useState("11:00")
  const [newSlotCapacity, setNewSlotCapacity] = useState("100")

  const [newSKUName, setNewSKUName] = useState("")
  const [newSKUDescription, setNewSKUDescription] = useState("")
  const [newSKUPrice, setNewSKUPrice] = useState("")
  const [newSKUCategory, setNewSKUCategory] = useState("")

  // Coupon form states
  const [newCouponCode, setNewCouponCode] = useState("")
  const [newCouponEventId, setNewCouponEventId] = useState<string | null>(null)
  const [newCouponDiscountType, setNewCouponDiscountType] = useState<"percentage" | "fixed_amount">("percentage")
  const [newCouponDiscountValue, setNewCouponDiscountValue] = useState("")
  const [newCouponMinOrder, setNewCouponMinOrder] = useState("")
  const [newCouponMaxDiscount, setNewCouponMaxDiscount] = useState("")
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState("")
  const [newCouponStartDate, setNewCouponStartDate] = useState("")
  const [newCouponEndDate, setNewCouponEndDate] = useState("")


  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: byTitle } = await supabase
          .from("events")
          .select("id")
          .eq("title", "Rangotsav – 4th March, 2026")
          .maybeSingle()
        const { data: firstEvent } = await supabase.from("events").select("id").limit(1).single()
        const eventData = byTitle ?? firstEvent

        if (eventData) {
          setEventId(eventData.id)

          // Load dates
          const { data: datesData } = await supabase
            .from("event_dates")
            .select("*")
            .eq("event_id", eventData.id)
            .order("date", { ascending: true })

          if (datesData) setDates(datesData)

          // Load time slots
          const { data: slotsData } = await supabase
            .from("time_slots")
            .select("*")
            .order("start_time", { ascending: true })

          if (slotsData) setTimeSlots(slotsData)

          // Load SKUs
          const { data: skusData } = await supabase.from("skus").select("*").eq("event_id", eventData.id)

          if (skusData) setSKUs(skusData)

          // Load inventory
          const { data: inventoryData } = await supabase.from("inventory").select("*")

          if (inventoryData) setInventory(inventoryData)

          // Load coupons
          const { data: couponsData } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false })

          if (couponsData) setCoupons(couponsData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  // Add new date
  const handleAddDate = async () => {
    if (!newDate || !eventId) return

    try {
      const response = await fetch("/api/admin/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          date: newDate,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add date")
      }

      setNewDate("")

      // Reload dates
      const { data } = await supabase
        .from("event_dates")
        .select("*")
        .eq("event_id", eventId)
        .order("date", { ascending: true })

      if (data) setDates(data)
    } catch (error: any) {
      console.error("Error adding date:", error)
      alert(`Failed to add date: ${error.message}`)
    }
  }

  // Add new time slot
  const handleAddTimeSlot = async () => {
    if (!selectedDateForSlots) return

    try {
      const response = await fetch("/api/admin/time-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_date_id: selectedDateForSlots,
          start_time: newSlotStartTime,
          end_time: newSlotEndTime,
          capacity: newSlotCapacity,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add time slot")
      }

      setNewSlotStartTime("09:00")
      setNewSlotEndTime("11:00")
      setNewSlotCapacity("100")

      // Reload time slots
      const { data } = await supabase.from("time_slots").select("*").order("start_time", { ascending: true })

      if (data) setTimeSlots(data)
    } catch (error: any) {
      console.error("Error adding time slot:", error)
      alert(`Failed to add time slot: ${error.message}`)
    }
  }

  // Add new SKU
  const handleAddSKU = async () => {
    if (!newSKUName || !newSKUPrice || !eventId) return

    try {
      const response = await fetch("/api/admin/skus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          name: newSKUName,
          description: newSKUDescription,
          base_price: newSKUPrice,
          category: newSKUCategory,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add SKU")
      }

      setNewSKUName("")
      setNewSKUDescription("")
      setNewSKUPrice("")
      setNewSKUCategory("")

      // Reload SKUs
      const { data } = await supabase.from("skus").select("*").eq("event_id", eventId)

      if (data) setSKUs(data)
    } catch (error: any) {
      console.error("Error adding SKU:", error)
      alert(`Failed to add SKU: ${error.message}`)
    }
  }

  // Delete SKU
  const handleDeleteSKU = async (skuId: string) => {
    if (!confirm("Are you sure? This will delete all inventory records for this ticket type.")) return

    try {
      const response = await fetch(`/api/admin/skus?id=${skuId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete SKU")
      }

      setSKUs(skus.filter((s) => s.id !== skuId))
    } catch (error: any) {
      console.error("Error deleting SKU:", error)
      alert(`Failed to delete SKU: ${error.message}`)
    }
  }

  // Toggle date availability
  const handleToggleDateAvailability = async (dateId: string, currentState: boolean) => {
    try {
      const response = await fetch("/api/admin/dates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dateId,
          is_available: !currentState,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update date")
      }

      setDates(dates.map((d) => (d.id === dateId ? { ...d, is_available: !currentState } : d)))
    } catch (error: any) {
      console.error("Error updating date:", error)
      alert(`Failed to update date: ${error.message}`)
    }
  }

  // Delete date
  const handleDeleteDate = async (dateId: string) => {
    if (!confirm("Are you sure? This will delete all time slots for this date.")) return

    try {
      const response = await fetch(`/api/admin/dates?id=${dateId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete date")
      }

      setDates(dates.filter((d) => d.id !== dateId))
    } catch (error: any) {
      console.error("Error deleting date:", error)
      alert(`Failed to delete date: ${error.message}`)
    }
  }

  // Delete time slot
  const handleDeleteTimeSlot = async (slotId: string) => {
    if (!confirm("Are you sure? This will delete inventory for this slot.")) return

    try {
      const response = await fetch(`/api/admin/time-slots?id=${slotId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete time slot")
      }

      setTimeSlots(timeSlots.filter((s) => s.id !== slotId))
    } catch (error: any) {
      console.error("Error deleting time slot:", error)
      alert(`Failed to delete time slot: ${error.message}`)
    }
  }

  // Update inventory
  const handleUpdateInventory = async (invId: string, newQuantity: number) => {
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: invId,
          total_quantity: newQuantity,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update inventory")
      }

      setInventory(
        inventory.map((inv) =>
          inv.id === invId ? { ...inv, total_quantity: newQuantity, available_quantity: newQuantity } : inv,
        ),
      )
    } catch (error: any) {
      console.error("Error updating inventory:", error)
      alert(`Failed to update inventory: ${error.message}`)
    }
  }

  // Add new coupon
  const handleAddCoupon = async () => {
    if (!newCouponCode || !newCouponDiscountValue) return

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCouponCode,
          event_id: newCouponEventId || null,
          discount_type: newCouponDiscountType,
          discount_value: newCouponDiscountValue,
          min_order_amount: newCouponMinOrder || null,
          max_discount: newCouponMaxDiscount || null,
          usage_limit: newCouponUsageLimit || null,
          start_date: newCouponStartDate || null,
          end_date: newCouponEndDate || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to add coupon")
      }

      // Reset form
      setNewCouponCode("")
      setNewCouponEventId(null)
      setNewCouponDiscountType("percentage")
      setNewCouponDiscountValue("")
      setNewCouponMinOrder("")
      setNewCouponMaxDiscount("")
      setNewCouponUsageLimit("")
      setNewCouponStartDate("")
      setNewCouponEndDate("")

      // Reload coupons
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })

      if (data) setCoupons(data)
    } catch (error: any) {
      console.error("Error adding coupon:", error)
      alert(`Failed to add coupon: ${error.message}`)
    }
  }

  // Delete coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      const response = await fetch(`/api/admin/coupons?id=${couponId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete coupon")
      }

      setCoupons(coupons.filter((c) => c.id !== couponId))
    } catch (error: any) {
      console.error("Error deleting coupon:", error)
      alert(`Failed to delete coupon: ${error.message}`)
    }
  }

  // Toggle coupon active status
  const handleToggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: couponId,
          is_active: !currentStatus,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update coupon")
      }

      setCoupons(coupons.map((c) => (c.id === couponId ? { ...c, is_active: !currentStatus } : c)))
    } catch (error: any) {
      console.error("Error updating coupon:", error)
      alert(`Failed to update coupon: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#202020" }}>
        <p className="text-white/80">Loading admin dashboard...</p>
      </div>
    )
  }

  const navItems = [
    { id: "dates", label: "Dates", icon: Calendar },
    { id: "times", label: "Time Slots", icon: Clock },
    { id: "skus", label: "Tickets", icon: Ticket },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "coupons", label: "Coupons", icon: Tag },
  ]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#202020" }}>
      {/* Sidebar */}
      <aside className="w-16 flex-shrink-0 " style={{ backgroundColor: "#1A1A1A" }}>
        <div className="flex flex-col items-center py-4 space-y-6">
          <Link href="/" className="mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-sm">VG</span>
            </div>
          </Link>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b" style={{ backgroundColor: "#242424", borderColor: "#2A2A2A" }}>
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-white font-semibold text-lg">Van Gogh Admin</h1>
              <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#FACC15", color: "#000" }}>
                PRODUCTION
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {navItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h2>
              <p className="text-white/60 text-sm">Manage your event data and settings</p>
            </div>

            {/* Tab Content */}

            {/* Dates Tab */}
            {activeTab === "dates" && (
              <Card className="border rounded-lg" style={{ backgroundColor: "#282828", borderColor: "#2A2A2A" }}>
                <CardHeader className="border-b" style={{ borderColor: "#2A2A2A" }}>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Manage Event Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Add new date */}
                  <div className="flex gap-4">
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="flex-1"
                      style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                      placeholder="Select date"
                    />
                    <Button
                      onClick={handleAddDate}
                      variant="secondary"
                    >
                      <div className="flex flex-row">
                        <Plus className="h-4 w-4 mr-2" /> 
                        <span>Add Date</span>
                      </div>
                    </Button> 
                  </div>

                  {/* Dates list */}
                  <div className="space-y-2">
                    {dates.length === 0 ? (
                      <p className="text-white/60 text-center py-8">No dates created yet</p>
                    ) : (
                      dates.map((date) => {
                        const d = new Date(date.date)
                        const dateStr = d.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })

                        return (
                          <div
                            key={date.id}
                            className="flex items-center justify-between p-4 rounded-lg border"
                            style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}
                          >
                            <div>
                              <p className="font-medium text-white">{dateStr}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    date.is_available ? "bg-green-500" : "bg-gray-500"
                                  }`}
                                />
                                <p className="text-sm text-white/60">
                                  {date.is_available ? "Available" : "Unavailable"}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleToggleDateAvailability(date.id, date.is_available)}
                                className="text-white"
                                style={{
                                  backgroundColor: date.is_available ? "#DC2626" : "#16A34A",
                                }}
                              >
                                {date.is_available ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteDate(date.id)}
                                className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Slots Tab */}
            {activeTab === "times" && (
              <Card className="border rounded-lg" style={{ backgroundColor: "#282828", borderColor: "#2A2A2A" }}>
                <CardHeader className="border-b" style={{ borderColor: "#2A2A2A" }}>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Manage Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Add new time slot */}
                  <div className="space-y-4 p-4 rounded-lg border" style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}>
                    <div>
                      <Label className="text-white/80 mb-2 block">Select Date</Label>
                      <select
                        value={selectedDateForSlots || ""}
                        onChange={(e) => setSelectedDateForSlots(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg text-white"
                        style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}
                      >
                        <option value="">Choose a date...</option>
                        {dates.map((date) => (
                          <option key={date.id} value={date.id}>
                            {new Date(date.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">Start Time</Label>
                        <Input
                          type="time"
                          value={newSlotStartTime}
                          onChange={(e) => setNewSlotStartTime(e.target.value)}
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">End Time</Label>
                        <Input
                          type="time"
                          value={newSlotEndTime}
                          onChange={(e) => setNewSlotEndTime(e.target.value)}
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">Capacity</Label>
                        <Input
                          type="number"
                          value={newSlotCapacity}
                          onChange={(e) => setNewSlotCapacity(e.target.value)}
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                          placeholder="100"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddTimeSlot}
                      className="w-full text-white"
                      style={{ backgroundColor: "#3B82F6" }}
                    >
                       <div className="flex flex-row items-center justify-center">
                        <Plus className="h-4 w-4 mr-2" /> 
                        <span>Add Time Slot</span>
                      </div>
                    </Button>
                  </div>

                  {/* Time slots list */}
                  <div className="space-y-2">
                    {timeSlots.length === 0 ? (
                      <p className="text-white/60 text-center py-8">No time slots created yet</p>
                    ) : (
                      timeSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}
                        >
                          <div>
                            <p className="font-medium text-white">
                              {slot.start_time.split(':').slice(0, 2).join(':')} – {slot.end_time.split(':').slice(0, 2).join(':')}
                            </p>
                            <p className="text-sm text-white/60">Capacity: {slot.capacity}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTimeSlot(slot.id)}
                            className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SKUs Tab */}
            {activeTab === "skus" && (
              <Card className="border rounded-lg" style={{ backgroundColor: "#282828", borderColor: "#2A2A2A" }}>
                <CardHeader className="border-b" style={{ borderColor: "#2A2A2A" }}>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Manage Ticket Types (SKUs)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Add new SKU */}
                  <div className="space-y-4 p-4 rounded-lg border" style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}>
                    <div>
                      <Label className="text-white/80 mb-2 block">Ticket Name</Label>
                      <Input
                        value={newSKUName}
                        onChange={(e) => setNewSKUName(e.target.value)}
                        placeholder="e.g., Individual Ticket, Group of 4"
                        style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                      />
                    </div>

                    <div>
                      <Label className="text-white/80 mb-2 block">Description</Label>
                      <Input
                        value={newSKUDescription}
                        onChange={(e) => setNewSKUDescription(e.target.value)}
                        placeholder="e.g., Single admission to Van Gogh immersive experience"
                        style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">Price (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newSKUPrice}
                          onChange={(e) => setNewSKUPrice(e.target.value)}
                          placeholder="1200.00"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">Category</Label>
                        <Input
                          value={newSKUCategory}
                          onChange={(e) => setNewSKUCategory(e.target.value)}
                          placeholder="e.g., individual, group_4, group_5"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                    </div>

                    <Button onClick={handleAddSKU} className="w-full text-white" style={{ backgroundColor: "#3B82F6" }}>
                      <div className="flex flex-row items-center justify-center">
                        <Plus className="h-4 w-4 mr-2" /> 
                        <span>Add Ticket Type</span>
                      </div>
                    </Button>
                  </div>

                  {/* SKUs list */}
                  <div className="space-y-2">
                    {skus.length === 0 ? (
                      <p className="text-white/60 text-center py-8">No ticket types created yet</p>
                    ) : (
                      skus.map((sku) => (
                        <div
                          key={sku.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-medium text-white">{sku.name}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  sku.is_active
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {sku.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm text-white/60 mb-2">{sku.description}</p>
                            <div className="flex gap-4">
                              <span className="text-sm font-semibold text-blue-400">₹{sku.base_price.toFixed(2)}</span>
                              <span className="text-sm text-white/60">{sku.category}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSKU(sku.id)}
                            className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <Card className="border rounded-lg" style={{ backgroundColor: "#282828", borderColor: "#2A2A2A" }}>
                <CardHeader className="border-b" style={{ borderColor: "#2A2A2A" }}>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Manage Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {inventory.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-white/60 mb-2">No inventory records yet.</p>
                      <p className="text-white/40 text-sm">Create time slots and ticket types first.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b" style={{ borderColor: "#2A2A2A" }}>
                            <th className="text-left p-3 font-semibold text-white">Date</th>
                            <th className="text-left p-3 font-semibold text-white">Time Slot</th>
                            <th className="text-left p-3 font-semibold text-white">Ticket Type</th>
                            <th className="text-center p-3 font-semibold text-white">Total</th>
                            <th className="text-center p-3 font-semibold text-white">Available</th>
                            <th className="text-center p-3 font-semibold text-white">Sold</th>
                            <th className="text-center p-3 font-semibold text-white">Update Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map((inv) => {
                            const slot = timeSlots.find((s) => s.id === inv.time_slot_id)
                            const sku = skus.find((s) => s.id === inv.sku_id)
                            const sold = inv.total_quantity - inv.available_quantity
                            
                            // Find the date for this time slot using event_date_id
                            const eventDate = slot
                              ? dates.find((d) => d.id === slot.event_date_id)
                              : null

                            return (
                              <tr
                                key={inv.id}
                                className="border-b hover:bg-white/5 transition-colors"
                                style={{ borderColor: "#2A2A2A" }}
                              >
                                <td className="p-3 text-white">
                                  {eventDate
                                    ? new Date(eventDate.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </td>
                                <td className="p-3 text-white">
                                  {slot
                                    ? `${slot.start_time.split(":").slice(0, 2).join(":")} – ${slot.end_time.split(":").slice(0, 2).join(":")}`
                                    : "Unknown"}
                                </td>
                                <td className="p-3 text-white">{sku?.name || "Unknown"}</td>
                                <td className="p-3 text-center text-white font-medium">{inv.total_quantity}</td>
                                <td className="p-3 text-center">
                                  <span
                                    className={`font-medium ${
                                      inv.available_quantity > 0 ? "text-green-400" : "text-red-400"
                                    }`}
                                  >
                                    {inv.available_quantity}
                                  </span>
                                </td>
                                <td className="p-3 text-center text-white/60">{sold}</td>
                                <td className="p-3 text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={inv.total_quantity}
                                    onChange={(e) => {
                                      const value = Number.parseInt(e.target.value) || 0
                                      handleUpdateInventory(inv.id, value)
                                    }}
                                    className="w-24 mx-auto text-center"
                                    style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                                  />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Coupons Tab */}
            {activeTab === "coupons" && (
              <Card className="border rounded-lg" style={{ backgroundColor: "#282828", borderColor: "#2A2A2A" }}>
                <CardHeader className="border-b" style={{ borderColor: "#2A2A2A" }}>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Manage Coupons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Add new coupon */}
                  <div className="space-y-4 p-4 rounded-lg border" style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">Coupon Code *</Label>
                        <Input
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          placeholder="SAVE20"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">Event (leave empty for global)</Label>
                        <select
                          value={newCouponEventId || ""}
                          onChange={(e) => setNewCouponEventId(e.target.value || null)}
                          className="w-full px-4 py-2 rounded-lg text-white"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}
                        >
                          <option value="">Global (All Events)</option>
                          {eventId && <option value={eventId}>Van Gogh Event</option>}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">Discount Type *</Label>
                        <select
                          value={newCouponDiscountType}
                          onChange={(e) => setNewCouponDiscountType(e.target.value as "percentage" | "fixed_amount")}
                          className="w-full px-4 py-2 rounded-lg text-white"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed_amount">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">
                          Discount Value {newCouponDiscountType === "percentage" ? "(%)" : "(₹)"} *
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newCouponDiscountValue}
                          onChange={(e) => setNewCouponDiscountValue(e.target.value)}
                          placeholder={newCouponDiscountType === "percentage" ? "20" : "500"}
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                    </div>

                    {newCouponDiscountType === "percentage" && (
                      <div>
                        <Label className="text-white/80 mb-2 block">Max Discount (₹) - Optional</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newCouponMaxDiscount}
                          onChange={(e) => setNewCouponMaxDiscount(e.target.value)}
                          placeholder="1000"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">Min Order Amount (₹) - Optional</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newCouponMinOrder}
                          onChange={(e) => setNewCouponMinOrder(e.target.value)}
                          placeholder="1000"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">Usage Limit - Optional</Label>
                        <Input
                          type="number"
                          value={newCouponUsageLimit}
                          onChange={(e) => setNewCouponUsageLimit(e.target.value)}
                          placeholder="100"
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/80 mb-2 block">Start Date - Optional</Label>
                        <Input
                          type="date"
                          value={newCouponStartDate}
                          onChange={(e) => setNewCouponStartDate(e.target.value)}
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 mb-2 block">End Date - Optional</Label>
                        <Input
                          type="date"
                          value={newCouponEndDate}
                          onChange={(e) => setNewCouponEndDate(e.target.value)}
                          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#FFFFFF" }}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddCoupon}
                      className="w-full text-white"
                      style={{ backgroundColor: "#3B82F6" }}
                    >
                      <div className="flex flex-row items-center justify-center">
                        <Plus className="h-4 w-4 mr-2" /> 
                        <span>Add Coupon</span>
                      </div>
                    </Button>
                  </div>

                  {/* Coupons list */}
                  <div className="space-y-2">
                    {coupons.length === 0 ? (
                      <p className="text-white/60 text-center py-8">No coupons created yet</p>
                    ) : (
                      coupons.map((coupon) => {
                        const usageText =
                          coupon.usage_limit !== null
                            ? `${coupon.used_count} / ${coupon.usage_limit}`
                            : `${coupon.used_count} (unlimited)`

                        return (
                          <div
                            key={coupon.id}
                            className="flex items-center justify-between p-4 rounded-lg border"
                            style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-medium text-white text-lg">{coupon.code}</p>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    coupon.is_active
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-gray-500/20 text-gray-400"
                                  }`}
                                >
                                  {coupon.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-white/60">
                                <div>
                                  <span className="font-medium text-white/80">Type:</span>{" "}
                                  {coupon.discount_type === "percentage" ? "Percentage" : "Fixed"}
                                </div>
                                <div>
                                  <span className="font-medium text-white/80">Value:</span>{" "}
                                  {coupon.discount_type === "percentage"
                                    ? `${coupon.discount_value}%`
                                    : `₹${coupon.discount_value}`}
                                </div>
                                <div>
                                  <span className="font-medium text-white/80">Usage:</span> {usageText}
                                </div>
                                <div>
                                  <span className="font-medium text-white/80">Scope:</span>{" "}
                                  {coupon.event_id ? "Event-specific" : "Global"}
                                </div>
                              </div>
                              {(coupon.min_order_amount ||
                                coupon.max_discount ||
                                coupon.start_date ||
                                coupon.end_date) && (
                                <div className="mt-2 text-xs text-white/50">
                                  {coupon.min_order_amount && (
                                    <span>Min: ₹{coupon.min_order_amount} </span>
                                  )}
                                  {coupon.max_discount && <span>Max: ₹{coupon.max_discount} </span>}
                                  {coupon.start_date && (
                                    <span>From: {new Date(coupon.start_date).toLocaleDateString()} </span>
                                  )}
                                  {coupon.end_date && (
                                    <span>Until: {new Date(coupon.end_date).toLocaleDateString()}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleToggleCouponStatus(coupon.id, coupon.is_active)}
                                className="text-white"
                                style={{
                                  backgroundColor: coupon.is_active ? "#DC2626" : "#16A34A",
                                }}
                              >
                                {coupon.is_active ? "Disable" : "Enable"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
