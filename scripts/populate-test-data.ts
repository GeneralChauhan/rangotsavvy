/**
 * Script to populate Supabase database with comprehensive test data
 *
 * IMPORTANT: This script requires the SERVICE ROLE KEY to bypass RLS policies.
 *
 * To get your service role key:
 * 1. Go to Supabase Dashboard > Settings > API
 * 2. Copy the "service_role" key (NOT the anon key)
 * 3. Set it as: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key pnpm populate:test
 *   or
 *   npx tsx scripts/populate-test-data.ts
 */

import { createClient } from "@supabase/supabase-js";

// Configuration
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://pcjqxilezrzhmuwdmyrx.supabase.co";

// Try service role key first (bypasses RLS), fallback to anon key
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjanF4aWxlenJ6aG11d2RteXJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM0MzE2MiwiZXhwIjoyMDgxOTE5MTYyfQ.fupQxbKXyHh-STf_D4xoa0r_9fW4iXVjzl9Ab7Kfwtk";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjanF4aWxlenJ6aG11d2RteXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMxNjIsImV4cCI6MjA4MTkxOTE2Mn0.M-doUZSPMcUWhRr_YH4dnKj98c5hOYmBZ0VTtebUjBQ";

if (!SUPABASE_URL) {
  console.error("❌ Missing Supabase URL!");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase key!");
  console.error(
    "Please set SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  console.error(
    "\n⚠️  Note: Service role key is recommended to bypass RLS policies."
  );
  console.error(
    "   You can find it in: Supabase Dashboard > Settings > API > service_role key"
  );
  process.exit(1);
}

// Use service role key if available (bypasses RLS), otherwise use anon key
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const usingServiceRole = !!SUPABASE_SERVICE_ROLE_KEY;

if (usingServiceRole) {
  console.log("✅ Using service role key (RLS bypassed)");
} else {
  console.log("⚠️  Using anon key - RLS policies may block operations");
  console.log("   Consider using SUPABASE_SERVICE_ROLE_KEY for this script");
}

const supabase = createClient(SUPABASE_URL, supabaseKey);

// Helper function to generate random dates
function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to format time as HH:MM
function formatTime(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

// Helper function to generate a URL-friendly slug from a string
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Generate random names
const firstNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Henry",
  "Ivy",
  "Jack",
  "Kate",
  "Liam",
  "Mia",
  "Noah",
  "Olivia",
  "Paul",
  "Quinn",
  "Rachel",
  "Sam",
  "Tina",
  "Uma",
  "Victor",
  "Wendy",
  "Xavier",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
];

function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRandomEmail(name: string): string {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "example.com",
  ];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const cleanName = name.toLowerCase().replace(/\s+/g, ".");
  return `${cleanName}${Math.floor(Math.random() * 1000)}@${domain}`;
}

function getRandomPhone(): string {
  return `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

// Event templates
const eventTemplates = [
  {
    name: "Van Gogh – An Immersive Story",
    description:
      "The world's most loved immersive show is on its final tour to Ahmedabad! Step into a breathtaking 360° immersive journey through Vincent van Gogh's masterpieces.",
    venue: "Ahmedabad Convention Centre, Ahmedabad",
  },
  {
    name: "Monet's Water Lilies Experience",
    description:
      "An immersive digital art experience featuring Claude Monet's iconic water lily paintings in a stunning 360° environment.",
    venue: "Mumbai Art Gallery, Mumbai",
  },
  {
    name: "Picasso: The Blue Period",
    description:
      "Explore Picasso's Blue Period through an interactive digital exhibition with VR elements and immersive storytelling.",
    venue: "Delhi Cultural Centre, New Delhi",
  },
  {
    name: "Dali's Surreal World",
    description:
      "Step into the surreal world of Salvador Dali with this mind-bending immersive experience featuring his most famous works.",
    venue: "Bangalore Exhibition Hall, Bangalore",
  },
];

// SKU templates
const skuTemplates = [
  { name: "Individual Ticket", category: "individual", basePrice: 1200 },
  { name: "Group of 4", category: "group_4", basePrice: 4400 },
  { name: "Group of 5", category: "group_5", basePrice: 5500 },
  { name: "Family Package", category: "family", basePrice: 3600 },
  { name: "VIP Experience", category: "vip", basePrice: 2500 },
  { name: "Student Discount", category: "student", basePrice: 800 },
  { name: "Senior Citizen", category: "senior", basePrice: 900 },
  { name: "Early Bird Special", category: "early_bird", basePrice: 1000 },
];

// Time slot templates
const timeSlotTemplates = [
  { start: 9, end: 11 },
  { start: 11.5, end: 13.5 },
  { start: 14, end: 16 },
  { start: 16.5, end: 18.5 },
  { start: 19, end: 21 },
];

async function createEvents() {
  console.log("📅 Creating events...");
  const events = [];

  // Check which columns exist in the events table
  let hasVenueColumn = false;
  let hasTitleColumn = false;
  let hasNameColumn = false;
  let hasSlugColumn = false;
  let hasOrganizationIdColumn = false;

  // First, try to get or create an organization
  let organizationId: string | null = null;

  // Check if organization_id column exists and if we need to create/get an organization
  try {
    const { data, error } = await supabase
      .from("events")
      .select("organization_id")
      .limit(1);
    if (!error && data && data[0] && "organization_id" in data[0]) {
      hasOrganizationIdColumn = true;
      // Try to get an existing organization_id from an existing event
      if (data[0].organization_id) {
        organizationId = data[0].organization_id;
        console.log(`ℹ️  Found existing organization_id: ${organizationId}`);
      }
    }
  } catch (e) {
    // Column might not exist or table might be empty
  }

  // If organization_id is required but we don't have one, try to create/get one
  if (hasOrganizationIdColumn && !organizationId) {
    // Try to find an organization in the organizations table (if it exists)
    try {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (orgData && orgData.id) {
        organizationId = orgData.id;
        console.log(`ℹ️  Using existing organization: ${organizationId}`);
      } else {
        // Try to create a default organization
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: "Default Organization",
            slug: "default-organization",
          })
          .select()
          .single();

        if (!orgError && newOrg) {
          organizationId = newOrg.id;
          console.log(`✅ Created default organization: ${organizationId}`);
        } else {
          // If organizations table doesn't exist or we can't create one,
          // use a placeholder UUID (this might fail if there's a foreign key constraint)
          console.log(
            "⚠️  Could not create organization, using placeholder UUID"
          );
          organizationId = "00000000-0000-0000-0000-000000000001";
        }
      }
    } catch (e) {
      // Organizations table might not exist
      console.log("⚠️  Organizations table not found, using placeholder UUID");
      organizationId = "00000000-0000-0000-0000-000000000001";
    }
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("venue, title, name, slug, organization_id")
      .limit(1);
    if (!error && data && data[0]) {
      // Check which columns are present
      if ("venue" in data[0]) hasVenueColumn = true;
      if ("title" in data[0]) hasTitleColumn = true;
      if ("name" in data[0]) hasNameColumn = true;
      if ("slug" in data[0]) hasSlugColumn = true;
      if ("organization_id" in data[0]) hasOrganizationIdColumn = true;
    }
  } catch (e) {
    // Try individual column checks
    const checks = [
      {
        col: "venue",
        setter: () => {
          hasVenueColumn = true;
        },
      },
      {
        col: "title",
        setter: () => {
          hasTitleColumn = true;
        },
      },
      {
        col: "name",
        setter: () => {
          hasNameColumn = true;
        },
      },
      {
        col: "slug",
        setter: () => {
          hasSlugColumn = true;
        },
      },
      {
        col: "organization_id",
        setter: () => {
          hasOrganizationIdColumn = true;
        },
      },
    ];

    for (const check of checks) {
      try {
        const { error } = await supabase
          .from("events")
          .select(check.col)
          .limit(1);
        if (!error) check.setter();
      } catch (e) {
        // Column doesn't exist
      }
    }
  }

  if (hasTitleColumn) {
    console.log("ℹ️  Using 'title' column for events");
  } else if (hasNameColumn) {
    console.log("ℹ️  Using 'name' column for events");
  }

  if (hasSlugColumn) {
    console.log("ℹ️  Slug column detected, will generate slugs");
  }

  if (hasVenueColumn) {
    console.log("ℹ️  Venue column detected, will include venue data");
  }

  for (const template of eventTemplates) {
    // Generate slug from event name
    const eventSlug = generateSlug(template.name);

    // Check if event already exists - try slug, title, or name
    let existingEvent = null;
    if (hasSlugColumn) {
      const { data } = await supabase
        .from("events")
        .select("id")
        .eq("slug", eventSlug)
        .maybeSingle();
      existingEvent = data;
    } else if (hasTitleColumn) {
      const { data } = await supabase
        .from("events")
        .select("id")
        .eq("title", template.name)
        .maybeSingle();
      existingEvent = data;
    } else if (hasNameColumn) {
      const { data } = await supabase
        .from("events")
        .select("id")
        .eq("name", template.name)
        .maybeSingle();
      existingEvent = data;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 60 + Math.floor(Math.random() * 30));

    const eventData: any = {
      description: template.description,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    };

    // Use title if it exists, otherwise use name
    if (hasTitleColumn) {
      eventData.title = template.name;
    } else if (hasNameColumn) {
      eventData.name = template.name;
    } else {
      // Default to title as it seems to be required
      eventData.title = template.name;
    }

    // Always include slug - if the error says it's required, it exists
    // The detection might fail, but we'll include it anyway
    eventData.slug = eventSlug;

    // Always include organization_id - if the error says it's required, it exists
    // The detection might fail, but we'll include it anyway
    if (organizationId) {
      eventData.organization_id = organizationId;
    } else {
      // Use placeholder if we couldn't get/create one
      // This might fail if there's a foreign key constraint
      eventData.organization_id = "00000000-0000-0000-0000-000000000001";
      console.log(
        "⚠️  Using placeholder organization_id - may fail if FK constraint exists"
      );
    }

    // Only include venue if the column exists
    if (hasVenueColumn) {
      eventData.venue = template.venue;
    }

    let result;
    if (existingEvent) {
      // Update existing event
      result = await supabase
        .from("events")
        .update(eventData)
        .eq("id", existingEvent.id)
        .select()
        .single();
    } else {
      // Insert new event
      result = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error(`❌ Error creating event ${template.name}:`, error.message);
    } else {
      console.log(
        `✅ ${existingEvent ? "Updated" : "Created"} event: ${template.name}`
      );
      events.push(data);
    }
  }

  return events;
}

async function createEventDates(events: any[]) {
  console.log("📆 Creating event dates...");
  const eventDates = [];

  for (const event of events) {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create dates for the event (every day or every few days)
    const datesToCreate = Math.min(daysDiff, 90); // Max 90 dates per event

    for (let i = 0; i < datesToCreate; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Skip some dates randomly (make some unavailable)
      const isAvailable = Math.random() > 0.1; // 90% available

      const { data, error } = await supabase
        .from("event_dates")
        .upsert(
          {
            event_id: event.id,
            date: formatDate(date),
            is_available: isAvailable,
          },
          { onConflict: "event_id,date" }
        )
        .select()
        .single();

      if (error) {
        console.error(
          `❌ Error creating date for ${event.title || event.name || "Event"}:`,
          error.message
        );
      } else {
        eventDates.push(data);
      }
    }
  }

  console.log(`✅ Created ${eventDates.length} event dates`);
  return eventDates;
}

async function createTimeSlots(eventDates: any[]) {
  console.log("⏰ Creating time slots...");
  const timeSlots = [];

  for (const eventDate of eventDates) {
    if (!eventDate.is_available) continue;

    // Create 3-5 time slots per date
    const numSlots = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numSlots; i++) {
      const template = timeSlotTemplates[i % timeSlotTemplates.length];
      const capacity = Math.floor(Math.random() * 50) + 50; // 50-100 capacity

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
            capacity: capacity,
          },
          { onConflict: "event_date_id,start_time" }
        )
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating time slot:`, error.message);
      } else {
        timeSlots.push(data);
      }
    }
  }

  console.log(`✅ Created ${timeSlots.length} time slots`);
  return timeSlots;
}

async function createSKUs(events: any[]) {
  console.log("🎫 Creating SKUs...");
  const skus = [];

  for (const event of events) {
    // Create 4-6 SKUs per event
    const numSKUs = Math.floor(Math.random() * 3) + 4;
    const selectedTemplates = skuTemplates.slice(0, numSKUs);

    for (const template of selectedTemplates) {
      const { data, error } = await supabase
        .from("skus")
        .upsert(
          {
            event_id: event.id,
            name: template.name,
            description: `${template.name} for ${
              event.title || event.name || "Event"
            }`,
            base_price:
              template.basePrice + Math.floor(Math.random() * 200) - 100, // Vary price slightly
            category: template.category,
            is_active: Math.random() > 0.1, // 90% active
          },
          { onConflict: "event_id,name" }
        )
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating SKU:`, error.message);
      } else {
        skus.push(data);
      }
    }
  }

  console.log(`✅ Created ${skus.length} SKUs`);
  return skus;
}

async function createInventory(timeSlots: any[], skus: any[]) {
  console.log("📦 Creating inventory...");
  let inventoryCount = 0;

  // Group SKUs by event
  const skusByEvent = new Map();
  for (const sku of skus) {
    if (!skusByEvent.has(sku.event_id)) {
      skusByEvent.set(sku.event_id, []);
    }
    skusByEvent.get(sku.event_id).push(sku);
  }

  // Get event dates to match time slots with events
  const { data: eventDates } = await supabase
    .from("event_dates")
    .select("id, event_id");

  if (!eventDates) return;

  const eventDatesMap = new Map(
    eventDates.map((ed: any) => [ed.id, ed.event_id])
  );

  for (const timeSlot of timeSlots) {
    const eventId = eventDatesMap.get(timeSlot.event_date_id);
    if (!eventId) continue;

    const eventSKUs = skusByEvent.get(eventId) || [];

    for (const sku of eventSKUs) {
      const totalQuantity = Math.floor(Math.random() * 50) + 50; // 50-100 total
      const booked = Math.floor(Math.random() * totalQuantity * 0.3); // Up to 30% booked
      const availableQuantity = totalQuantity - booked;

      const { error } = await supabase.from("inventory").upsert(
        {
          time_slot_id: timeSlot.id,
          sku_id: sku.id,
          total_quantity: totalQuantity,
          available_quantity: availableQuantity,
        },
        { onConflict: "time_slot_id,sku_id" }
      );

      if (error) {
        console.error(`❌ Error creating inventory:`, error.message);
      } else {
        inventoryCount++;
      }
    }
  }

  console.log(`✅ Created ${inventoryCount} inventory entries`);
}

async function createBookings(
  timeSlots: any[],
  skus: any[],
  numBookings: number = 50
) {
  console.log(`📝 Creating ${numBookings} bookings...`);
  let bookingCount = 0;

  // Get a sample of available time slots and SKUs
  const availableTimeSlots = timeSlots.filter(() => Math.random() > 0.5);
  const availableSKUs = skus.filter((sku) => sku.is_active);

  if (availableTimeSlots.length === 0 || availableSKUs.length === 0) {
    console.log("⚠️  No available time slots or SKUs for bookings");
    return;
  }

  // Check if bookings table has user_id constraint
  // If it does, we'll skip creating bookings or use a service role key
  console.log("⚠️  Note: Bookings require user_id from auth.users");
  console.log(
    "   Skipping booking creation. Use service role key or create users first."
  );
  console.log("   To create bookings, you'll need to:");
  console.log("   1. Use SUPABASE_SERVICE_ROLE_KEY instead of anon key");
  console.log("   2. Or create auth users first and use their IDs");

  // Uncomment below if you have service role key or want to test without user_id
  /*
  for (let i = 0; i < numBookings; i++) {
    const timeSlot = availableTimeSlots[Math.floor(Math.random() * availableTimeSlots.length)];
    const sku = availableSKUs[Math.floor(Math.random() * availableSKUs.length)];
    const quantity = Math.floor(Math.random() * 4) + 1; // 1-4 tickets
    const totalPrice = parseFloat(sku.base_price) * quantity;

    const visitorName = getRandomName();
    const statuses = ["pending", "confirmed", "cancelled"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate a random UUID for user_id (only works with service role key)
    const { v4: uuidv4 } = require('uuid');
    const placeholderUserId = uuidv4();

    const { error } = await supabase.from("bookings").insert({
      user_id: placeholderUserId,
      time_slot_id: timeSlot.id,
      sku_id: sku.id,
      quantity: quantity,
      total_price: totalPrice,
      status: status,
      email: getRandomEmail(visitorName),
      phone_number: getRandomPhone(),
      visitor_name: visitorName
    });

    if (error) {
      console.error(`❌ Error creating booking:`, error.message);
    } else {
      bookingCount++;
    }
  }

  console.log(`✅ Created ${bookingCount} bookings`);
  */
}

async function main() {
  console.log("🚀 Starting database population...\n");

  try {
    // Step 1: Create events
    const events = await createEvents();
    console.log("");

    // Step 2: Create event dates
    const eventDates = await createEventDates(events);
    console.log("");

    // Step 3: Create time slots
    const timeSlots = await createTimeSlots(eventDates);
    console.log("");

    // Step 4: Create SKUs
    const skus = await createSKUs(events);
    console.log("");

    // Step 5: Create inventory
    await createInventory(timeSlots, skus);
    console.log("");

    // Step 6: Create bookings (optional - comment out if you don't want bookings)
    // Note: This might fail if user_id constraint is strict
    // await createBookings(timeSlots, skus, 50);
    // console.log("");

    console.log("✅ Database population complete!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Event Dates: ${eventDates.length}`);
    console.log(`   - Time Slots: ${timeSlots.length}`);
    console.log(`   - SKUs: ${skus.length}`);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
main();
