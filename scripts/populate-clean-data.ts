/**
 * Script to populate the clean schema with test data
 * 
 * This script works with the clean schema (005_create_clean_schema.sql)
 * which matches the actual requirements:
 * - One event, one venue
 * - Multiple dates per event
 * - Multiple time slots per date
 * - Different SKUs/tiers per time slot
 * - Max 250 tickets per time slot
 * - One person can buy multiple tickets
 * 
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key pnpm populate:clean
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://pcjqxilezrzhmuwdmyrx.supabase.co";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjanF4aWxlenJ6aG11d2RteXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM0MzE2MiwiZXhwIjoyMDgxOTE5MTYyfQ.fupQxbKXyHh-STf_D4xoa0r_9fW4iXVjzl9Ab7Kfwtk";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials!");
  console.error("Please set SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatTime(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

// Event data
const eventData = {
  title: "Van Gogh – An Immersive Story",
  description:
    "The world's most loved immersive show is on its final tour to Ahmedabad! Step into a breathtaking 360° immersive journey through Vincent van Gogh's masterpieces. Experienced by over 1 billion people across 90+ countries.",
  venue: "Ahmedabad Convention Centre, Ahmedabad",
};

// SKU templates
const skuTemplates = [
  { name: "Individual Ticket", category: "individual", price: 1200, quantity: 100 },
  { name: "Group of 4", category: "group_4", price: 4400, quantity: 50 },
  { name: "Group of 5", category: "group_5", price: 5500, quantity: 50 },
  { name: "VIP Experience", category: "vip", price: 2500, quantity: 30 },
  { name: "Student Discount", category: "student", price: 800, quantity: 20 },
];

// Time slot templates
const timeSlotTemplates = [
  { start: 9, end: 11 },
  { start: 11.5, end: 13.5 },
  { start: 14, end: 16 },
  { start: 16.5, end: 18.5 },
  { start: 19, end: 21 },
];

async function createEvent() {
  console.log("📅 Creating event...");

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 60);

  const { data, error } = await supabase
    .from("events")
    .upsert(
      {
        ...eventData,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      },
      { onConflict: "title" }
    )
    .select()
    .single();

  if (error) {
    // If upsert fails, try insert
    const { data: newData, error: insertError } = await supabase
      .from("events")
      .insert({
        ...eventData,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error creating event:", insertError.message);
      return null;
    }
    console.log("✅ Created event:", newData.title);
    return newData;
  }

  console.log("✅ Created/updated event:", data.title);
  return data;
}

async function createEventDates(eventId: string, numDays: number = 30) {
  console.log(`📆 Creating ${numDays} event dates...`);
  const dates = [];

  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const { data, error } = await supabase
      .from("event_dates")
      .upsert(
        {
          event_id: eventId,
          date: formatDate(date),
          is_available: true,
        },
        { onConflict: "event_id,date" }
      )
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating date ${formatDate(date)}:`, error.message);
    } else {
      dates.push(data);
    }
  }

  console.log(`✅ Created ${dates.length} event dates`);
  return dates;
}

async function createTimeSlots(eventDates: any[]) {
  console.log("⏰ Creating time slots...");
  const timeSlots = [];

  for (const eventDate of eventDates) {
    for (const template of timeSlotTemplates) {
      const { data, error } = await supabase
        .from("time_slots")
        .upsert(
          {
            event_date_id: eventDate.id,
            start_time: formatTime(
              Math.floor(template.start),
              (template.start % 1) * 60
            ),
            end_time: formatTime(
              Math.floor(template.end),
              (template.end % 1) * 60
            ),
            max_capacity: 250,
          },
          { onConflict: "event_date_id,start_time" }
        )
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating time slot:", error.message);
      } else {
        timeSlots.push(data);
      }
    }
  }

  console.log(`✅ Created ${timeSlots.length} time slots`);
  return timeSlots;
}

async function createSKUs(eventId: string) {
  console.log("🎫 Creating SKUs...");
  const skus = [];

  for (const template of skuTemplates) {
    const { data, error } = await supabase
      .from("skus")
      .upsert(
        {
          event_id: eventId,
          name: template.name,
          description: `${template.name} for ${eventData.title}`,
          base_price: template.price,
          category: template.category,
          is_active: true,
        },
        { onConflict: "event_id,name" }
      )
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating SKU ${template.name}:`, error.message);
    } else {
      skus.push({ ...data, quantity: template.quantity });
    }
  }

  console.log(`✅ Created ${skus.length} SKUs`);
  return skus;
}

async function createInventory(timeSlots: any[], skus: any[]) {
  console.log("📦 Creating inventory...");
  let inventoryCount = 0;

  for (const timeSlot of timeSlots) {
    for (const sku of skus) {
      const { error } = await supabase
        .from("inventory")
        .upsert(
          {
            time_slot_id: timeSlot.id,
            sku_id: sku.id,
            total_quantity: sku.quantity,
            available_quantity: sku.quantity,
          },
          { onConflict: "time_slot_id,sku_id" }
        );

      if (error) {
        console.error("❌ Error creating inventory:", error.message);
      } else {
        inventoryCount++;
      }
    }
  }

  console.log(`✅ Created ${inventoryCount} inventory entries`);
}

async function main() {
  console.log("🚀 Starting database population with clean schema...\n");

  try {
    // Step 1: Create event
    const event = await createEvent();
    if (!event) {
      console.error("❌ Failed to create event. Exiting.");
      process.exit(1);
    }
    console.log("");

    // Step 2: Create event dates
    const eventDates = await createEventDates(event.id, 30);
    console.log("");

    // Step 3: Create time slots
    const timeSlots = await createTimeSlots(eventDates);
    console.log("");

    // Step 4: Create SKUs
    const skus = await createSKUs(event.id);
    console.log("");

    // Step 5: Create inventory
    await createInventory(timeSlots, skus);
    console.log("");

    console.log("✅ Database population complete!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Event: ${event.title}`);
    console.log(`   - Event Dates: ${eventDates.length}`);
    console.log(`   - Time Slots: ${timeSlots.length}`);
    console.log(`   - SKUs: ${skus.length}`);
    console.log(`   - Total Inventory Entries: ${timeSlots.length * skus.length}`);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
