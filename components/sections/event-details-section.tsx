"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bookmark, Calendar, MapPin } from "lucide-react";

interface EventDetailsSectionProps {
  onBookTickets: () => void;
}

export function EventDetailsSection({ onBookTickets }: EventDetailsSectionProps) {
  const supabase = createClient();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingPrice, setStartingPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch event by title (schema has title, not name), then first event
        let eventData = null;
        const { data: byTitle } = await supabase
          .from("events")
          .select("*")
          .eq("title", "Rangotsav – 4th Holi 2026")
          .maybeSingle();
        if (byTitle) eventData = byTitle;

        if (!eventData) {
          const { data: firstEvent } = await supabase
            .from("events")
            .select("*")
            .limit(1)
            .single();
          eventData = firstEvent;
        }

        if (eventData) {
          setEvent(eventData);

          // Fetch starting price from SKUs
          const { data: skuData } = await supabase
            .from("skus")
            .select("base_price")
            .eq("event_id", eventData.id)
            .eq("is_active", true)
            .order("base_price", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (skuData) {
            setStartingPrice(skuData.base_price);
          }
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  // Get event title/name
  const eventTitle = event?.title || event?.name || "Rangotsav – 4th Holi 2026";

  return (
    <div className="min-h-screen">
      {/* Event Banner - Title Overlay */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              VAN GOGH
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light drop-shadow-lg">
              An Immersive Story
            </p>
          </div>
        </div>
      </div>

      {/* Event Details Section */}
      <div className="bg-white/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Event Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">
            {eventTitle}
          </h2>

          {/* Key Information */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Bookmark className="h-5 w-5 text-black/60" />
              <span className="text-black">Art, Immersive Experience</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-black/60" />
              <span className="text-black">
                {event?.start_date 
                  ? new Date(event.start_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "TBA"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-black/60" />
              <span className="text-black">
                {event?.venue || "Ahmedabad Convention Centre, Ahmedabad"}
              </span>
            </div>
          </div>

          {/* About the Event */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-black mb-4">
              About the Event
            </h3>
            <p className="text-black/80 leading-relaxed">
              Experience the world's most loved immersive show. Step into a breathtaking
              360° immersive journey through Vincent van Gogh's masterpieces. This global
              phenomenon—experienced by over 1 billion people across 90+ countries—arrives
              in Ahmedabad for its final tour. Explore four incredible zones of immersive
              art and experience the genius of one of history's greatest artists...
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-black/10 shadow-lg">
        <div className="flex items-center justify-between p-4 gap-4 max-w-4xl mx-auto">
          {/* Left Side - Price Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <p className="text-xs text-black/60">Starts from</p>
              <p className="text-2xl font-bold text-black">
                {startingPrice ? `₹${startingPrice.toFixed(0)}` : "TBA"}
              </p>
            </div>
          </div>

          {/* Right Side - Book Button */}
          <div className="flex-shrink-0">
            <button
              onClick={onBookTickets}
              className="px-6 py-3 rounded-lg bg-black text-white font-bold text-sm uppercase tracking-wide transition-all hover:bg-black/90 active:scale-95"
            >
              Book Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed bar */}
      <div className="h-24" />
    </div>
  );
}
