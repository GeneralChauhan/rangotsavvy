"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, MapPin, Clock, Tag, Share2, Bookmark, Languages, Ticket, Info, Users, Smile, Heart, ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const supabase = createClient();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingPrice, setStartingPrice] = useState<number | null>(null);
  const [eventDates, setEventDates] = useState<any[]>([]);
  const [showEventGuideModal, setShowEventGuideModal] = useState(false);
  const [faqExpanded, setFaqExpanded] = useState(true);
  const [termsExpanded, setTermsExpanded] = useState(false);

  useEffect(() => {
    // Track page load
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('page-view-landing');
    }

    const fetchEventData = async () => {
      try {
        // Prefer Holi 2026 event (by title), then first event (schema has title, not name)
        let eventData = null;
        const { data: byTitle } = await supabase
          .from("events")
          .select("*")
          .eq("title", "Rangotsav – 4th March, 2026")
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
          setEvent("");

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

          // Single-day: fetch the one event date
          const { data: dates } = await supabase
            .from("event_dates")
            .select("*")
            .eq("event_id", eventData.id)
            .eq("is_available", true)
            .order("date", { ascending: true })
            .limit(1);

          if (dates) {
            setEventDates([]);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const eventTitle = event?.title || event?.name || "Rangotsav – 4th March, 2026";
  const eventDescription = event?.description ||
    `Get ready to celebrate Holi like never before at Rangotsav 2026, Bangalore's most vibrant and curated Holi music festival.

This March 4th, join us at White Feather, Electronic City, for a full-day celebration of music, colours, and great vibes. Dance to DJs and Live Band Performances, move to energetic Dhol Beats, play with Organic Colours, splash around in the Rain Dance Zone, and grab a bite from the Food Stalls.

Whether you're coming with your closest crew or planning a big group outing, Rangotsav is the perfect place to make memories, click colourful pictures, and enjoy Holi the way it's meant to be celebrated, loud, bright, and full of life.`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventDateLabel = () => {
    if (eventDates.length > 0) {
      return formatDate(eventDates[0].date);
    }
    if (event?.start_date) {
      return formatDate(event.start_date);
    }
    return "4th March, 2026";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image 
                src="/gallery/VG - Logos Black.png" 
                alt="Rangotsav Logo" 
                width={100} 
                height={10}
                className="w-auto h-14"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Banner */}
            <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-yellow-400">
              <Image
                src="/gallery/banner.png"
                alt="Rangotsav 2026"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>

            {/* Event Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {eventTitle}
              </h1>
              
              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Festival</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">Holi</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">Premium Experience</span>
              </div>
            </div>

            {/* Event Details */}
            {/* <div className="border-t border-gray-200 pt-6 space-y-4 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Date</p>
                  <p className="text-gray-600">{getEventDateLabel()}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Location</p>
                  <p className="text-gray-600">{event?.venue || "White Feather, Electronic City"}</p>
                  <p className="text-sm text-gray-500 mt-1">Bangalore, Karnataka</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                Ticketing
              </h2>
              <p className="text-lg font-medium text-gray-800 mb-4 italic">
                Premium, ticketed Holi experience
              </p>
              <ul className="text-gray-700 mb-6 space-y-1.5 list-disc list-inside">
                <li>1 Complementary (drink + snacks)</li>
                <li>DJ • Band • Dhol</li>
                <li>Organic colours • Rain dance</li>
                <li>Food stalls</li>
              </ul>
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Phase 1 – Early Bird
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="text-gray-900 font-medium">Stag Entry</span>
                    <span className="text-xl font-semibold text-gray-900">₹1,499</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="text-gray-900 font-medium">Couple Entry</span>
                    <span className="text-xl font-semibold text-gray-900">₹2,599</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="text-gray-900 font-medium">Kid (3–7 years)</span>
                    <span className="text-xl font-semibold text-gray-900">₹399</span>
                  </div>
                  <p className="text-sm text-gray-600 pt-1 border-t border-gray-200">
                    Above 7 years full ticket applies.
                  </p>
                </div>
              </div>
            </div> */}

            {/* About This Event */}
            <div className="border-t border-gray-200 pt-6 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this event</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {eventDescription}
                </p>
              </div>
            </div>

            {/* What to expect */}
            <div className="border-t border-gray-200 pt-6 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What to expect</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Complimentary Refreshments", description: "Enjoy 1 complimentary drink and snack, on us" },
                  { title: "Live Music", description: "DJ, live band & dhol for non-stop Holi madness" },
                  { title: "Organic Colours", description: "Play Holi with safe, organic colours all day" },
                  { title: "Rain Dance", description: "Splash, dance, repeat" },
                  { title: "Food Stalls", description: "Tired of having the best time? Take a break and refuel at our food stalls" },
                ].map((zone, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">{zone.title}</h3>
                    <p className="text-sm text-gray-600">{zone.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Guide Section */}
            <div className="border-t border-gray-200 pt-6 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Event Guide</h2>
                <button
                  onClick={() => setShowEventGuideModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  data-umami-event="event-guide-see-all"
                >
                  See all <span>&gt;</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                  <Languages className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Language</p>
                    <p className="font-semibold text-gray-900">English</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">1 Hour</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tickets Needed For</p>
                    <p className="font-semibold text-gray-900">3 yrs & above</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Section */}
            <div className="border-t border-gray-200 pt-6 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">White Feather, Electronic City</h3>
                <p className="text-sm text-gray-600 mb-4">
                NICE Tollgate, 40/41-1, Hobli-Begur, PESU ECC Main Rd, opposite metro wholesale &, Electronic City Phase I, Electronic City, Beratena Agrahara, Bengaluru,
                </p>
                <a
                  href="https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KaHciGqibK47MRRDarACFk0f&daddr=NICE+Tollgate,+40/41-1,+Hobli-Begur,+PESU+ECC+Main+Rd,+opposite+metro+wholesale+%26,+Electronic+City+Phase+I,+Electronic+City,+Beratena+Agrahara,+Bengaluru,+Karnataka+560100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black hover:bg-black/90 text-white font-bold text-sm uppercase tracking-wide px-6 py-3 rounded-lg transition-all active:scale-95 whitespace-nowrap"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  data-umami-event="get-directions"
                >
                  <MapPin className="h-4 w-4" />
                  GET DIRECTIONS
                </a>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="border-t border-gray-200 pt-6 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <button
                onClick={() => setFaqExpanded(!faqExpanded)}
                className="w-full flex items-center justify-between mb-4"
                data-umami-event="faq-toggle"
              >
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                {faqExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
              {faqExpanded && (
                <div className="space-y-0 border-t border-gray-200">
                  {[
                    {
                      q: "Is there an age restriction for the event?",
                      a: "No, there is no age restriction but tickets are required for children aged 3 and above.",
                    },
                    {
                      q: "Is there parking available?",
                      a: "Yes, limited paid parking will be available at the venue.",
                    },
                    {
                      q: "Can I get a refund if I can't attend the event?",
                      a: "No, tickets for this event are non-refundable.",
                    },
                    {
                      q: "Are there accommodations for individuals with disabilities?",
                      a: "Yes, the venue is wheelchair accessible, but attendees will need to bring their own wheelchair.",
                    },
                    {
                      q: "Will food & beverages be available at the venue?",
                      a: "No, food & beverages will not be available at the venue.",
                    },
                    {
                      q: "Is re-entry to the venue allowed?",
                      a: "No, re-entry is not allowed once you exit the venue.",
                    },
                    {
                      q: "Is there a designated smoking area?",
                      a: "Yes, a designated smoking area will be available at the venue.",
                    },
                  ].map((faq, i) => (
                    <div key={i} className="py-4 border-b border-gray-200 last:border-b-0">
                      <p className="font-semibold text-gray-900 mb-2">{faq.q}</p>
                      <p className="text-sm text-gray-600">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms & Conditions Section */}
            <div className="border-t border-gray-200 pt-6 w-screen lg:w-auto -ml-4 sm:-ml-6 lg:ml-0 px-4 sm:px-6 lg:px-0">
              <button
                onClick={() => setTermsExpanded(!termsExpanded)}
                className="w-full flex items-center justify-between mb-4"
                data-umami-event="terms-toggle"
              >
                <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
                {termsExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
              {termsExpanded && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li>• Please carry a valid ID proof along with you.</li>
                    <li>• Tickets once sold cannot be exchanged or refunded. An event cannot be cancelled due to bad weather conditions.</li>
                    <li>• Tickets are valid only for the show date mentioned on the ticket. Tickets cannot be redeemed on any other date.</li>
                    <li>• No refund on purchased tickets is possible, even in case of any rescheduling.</li>
                    <li>• There might be a waiting time at the venue. Entry will be on a first-come, first-serve basis.</li>
                    <li>• The maximum experience duration is 1 hour, after which guests will be asked to exit for the next batch.</li>
                    <li>• Instagram or any other freebie offers can be collected on the show day only.</li>
                    <li>• Please maintain silence and do not use flashlights during the show. Violators may be asked to leave without refund.</li>
                    <li>• Security procedures, including frisking, remain the right of the management.</li>
                    <li>• No dangerous or potentially hazardous objects including but not limited to weapons, knives, guns, fireworks, helmets, laser devices, bottles, musical instruments will be allowed in the venue and may be ejected. Offenders may be reported to the Police.</li>
                    <li>• No liability for injuries or damages to any person or property by sponsors/performers/organizers. All claims subject to Mumbai courts only.</li>
                    <li>• No entry for individuals in an inebriated state.</li>
                    <li>• Organizers reserve the right to deny late entry.</li>
                    <li>• Venue rules apply.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
                {/* Event Title */}
                <h2 className="text-2xl font-bold text-black mb-6 leading-tight">
                  {eventTitle}
                </h2>

                {/* Event Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Bookmark className="h-5 w-5 text-black mt-0.5 flex-shrink-0" />
                    <p className="text-base text-black">Festival, Premium Holi Experience</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-black mt-0.5 flex-shrink-0" />
                    <p className="text-base text-black">{getEventDateLabel()}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-black mt-0.5 flex-shrink-0" />
                    <p className="text-base text-black">{event?.venue || "White Feather, Electronic City, Bangalore"}</p>
                  </div>
                </div>

                {/* Horizontal Divider */}
                <hr className="border-gray-300 mb-6" />

                {/* Pricing and Booking Action */}
                <div className="flex items-end justify-between gap-4">
                  {/* Price Section */}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Starts from</p>
                    <p className="text-3xl font-bold text-black">
                      {startingPrice != null ? `₹${Math.round(startingPrice).toLocaleString()}` : "₹399"}
                    </p>
                  </div>

                  {/* Book Button */}
                  <Link
                    href="/booking"
                    className="bg-black hover:bg-black/90 text-white font-bold text-sm uppercase tracking-wide px-6 py-3 rounded-lg transition-all active:scale-95 whitespace-nowrap"
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                    data-umami-event="book-tickets-desktop"
                  >
                    BOOK TICKETS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Event Guide Modal */}
      {showEventGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Event Guide</h2>
              <button
                onClick={() => setShowEventGuideModal(false)}
                className="text-gray-500 hover:text-gray-900"
                data-umami-event="event-guide-modal-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Languages className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Language</p>
                  <p className="font-semibold text-gray-900">English</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">1 Hour</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Tickets Needed For</p>
                  <p className="font-semibold text-gray-900">3 yrs & above</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Entry Allowed For</p>
                  <p className="font-semibold text-gray-900">All ages</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Layout</p>
                  <p className="font-semibold text-gray-900">Indoor</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Seating Arrangement</p>
                  <p className="font-semibold text-gray-900">Standing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smile className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Kid Friendly?</p>
                  <p className="font-semibold text-gray-900">Yes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Pet Friendly?</p>
                  <p className="font-semibold text-gray-900">No</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Price Section */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Starts from</p>
              <p className="text-3xl font-bold text-black">
                {startingPrice != null ? `₹${Math.round(startingPrice).toLocaleString()}` : "₹399"}
              </p>
            </div>

            {/* Book Button */}
            <Link
              href="/booking"
              className="bg-black hover:bg-black/90 text-white font-bold text-sm uppercase tracking-wide px-6 py-3 rounded-lg transition-all active:scale-95 whitespace-nowrap"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
              data-umami-event="book-tickets-mobile"
            >
              BOOK TICKETS
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 lg:mt-16 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/gallery/thickandthin.png"
              alt=""
              width={120}
              height={40}
              className="h-24 w-auto object-contain"
            />
          </div>
          {/* Contact Us */}
          <div className="text-center mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact us</h3>
            <p className="text-sm text-gray-500 mb-3">
              Feel free to reach out to us using the provided contact details.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-600">
              <a
                href="tel:+919035550824"
                className="hover:text-gray-900 underline-offset-2 hover:underline"
                data-umami-event="footer-call"
              >
                +91 90355 50824
              </a>
              <span className="hidden sm:inline text-gray-400">·</span>
              <a
                href="mailto:hello@soleadogroup.com"
                className="hover:text-gray-900 underline-offset-2 hover:underline"
                data-umami-event="footer-email"
              >
                hello@soleadogroup.com
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-500 flex-wrap">
            <Link
              href="/privacy"
              className="hover:text-gray-700 underline-offset-2 hover:underline"
              data-umami-event="footer-privacy"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-gray-400">·</span>
            <Link
              href="/refund"
              className="hover:text-gray-700 underline-offset-2 hover:underline"
              data-umami-event="footer-refund"
            >
              Refund Policy
            </Link>
            <span className="hidden sm:inline text-gray-400">·</span>
            <Link
              href="/terms"
              className="hover:text-gray-700 underline-offset-2 hover:underline"
              data-umami-event="footer-terms"
            >
              Terms & Conditions
            </Link>
            <span className="hidden sm:inline text-gray-400">·</span>
            <p>© 2026 SOLEADO ELEMENT PRIVATE LIMITED. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
