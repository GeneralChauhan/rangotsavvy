"use client";

import { BookingSection } from "@/components/sections/booking-section";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function BookingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">

      {/* Booking Section */}
      <BookingSection 
        onComplete={() => {
          // This is called when user clicks back button
          router.push("/");
        }} 
        sidebarMode={false}
        startBooking={true}
        onStartBooking={() => {}}
      />
    </div>
  );
}
