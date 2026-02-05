import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Terms and Conditions | Rangotsav",
  description:
    "Terms and Conditions of Use for Soleado Elements Pvt. Ltd. – rules governing access to and participation in Soleado events.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/gallery/VG - Logos Black.png"
                alt="Rangotsav Logo"
                width={100}
                height={10}
                className="w-auto h-14"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Terms and Conditions of Use
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Soleado Elements Private Limited · Last updated: 19 January 2026
        </p>

        <div className="max-w-none space-y-10 text-gray-700">
          <p className="text-base leading-relaxed">
            Our relationship with you is our most important asset. We want you
            to feel comfortable and confident while engaging with our events,
            platforms, and services. These Terms and Conditions of Use
            (“Terms”) explain the rules governing your access to and
            participation in events organised, promoted, or managed by Soleado
            Elements Private Limited (“Soleado”, “Company”, “we”, “our”, “us”).
          </p>

          <p className="text-base leading-relaxed">
            These Terms apply to all users, attendees, ticket holders, artists,
            partners, vendors, and visitors (“you”, “your”, “User”) accessing
            our website, event pages, ticketing links, registrations, or
            attending any Soleado-managed event (collectively, the “Platform”
            and “Services”).
          </p>

          <p className="text-base leading-relaxed font-medium text-gray-900">
            By accessing the Platform or attending any event, you agree to be
            bound by these Terms.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              1. About Soleado & Our Services
            </h2>
            <p className="text-base leading-relaxed mb-4">
              Soleado Elements Pvt. Ltd. is the event management and
              experiential entertainment company engaged in:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>
                Planning, organising, and executing live events, festivals,
                concerts, corporate events, brand activations, cultural
                programs, and private gatherings
              </li>
              <li>Event promotion, marketing, and audience engagement</li>
              <li>Ticketed and non-ticketed event operations</li>
              <li>Artist, vendor, and venue coordination</li>
              <li>On-ground execution, crowd management, and access control</li>
              <li>Customer support related to event participation</li>
            </ul>
            <p className="text-base leading-relaxed">
              Soleado acts as the event organiser and coordinator and does not
              guarantee specific outcomes, experiences, or satisfaction levels,
              which may vary based on subjective preferences and external
              factors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              2. User Responsibilities & Prohibited Activities
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              2.1 Lawful Use
            </h3>
            <p className="text-base leading-relaxed mb-4">
              You agree to use the Platform and attend events only for lawful
              purposes and in compliance with all applicable laws, venue rules,
              and safety guidelines.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              2.2 Prohibited Conduct
            </h3>
            <p className="text-base leading-relaxed mb-2">
              You shall not:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>
                Engage in violence, harassment, disorderly conduct, or unsafe
                behaviour at events
              </li>
              <li>Possess or consume illegal substances or prohibited items</li>
              <li>Damage venue property or equipment</li>
              <li>
                Violate crowd control, security, or safety instructions
              </li>
              <li>
                Record, distribute, or exploit event content for commercial
                purposes without permission
              </li>
              <li>
                Misrepresent affiliation with Soleado, artists, sponsors, or
                partners
              </li>
              <li>
                Use the Platform for fraudulent, unlawful, or misleading
                purposes
              </li>
            </ul>
            <p className="text-base leading-relaxed">
              Soleado reserves the right to deny entry or remove any individual
              without refund for violations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              3. Tickets, Entry & Refunds
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              3.1 Ticket Validity
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>Entry is permitted only with a valid ticket or authorised pass</li>
              <li>Tickets are non-transferable unless expressly stated</li>
              <li>Government-issued ID may be required</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              3.2 Refunds & Cancellations
            </h3>
            <p className="text-base leading-relaxed mb-4">
              Refunds are governed by Soleado’s Refund & Cancellation Policy,
              available on the website and/or ticketing platform. Soleado shall
              not be responsible for convenience fees or gateway charges
              retained by ticketing platforms.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              3.3 Event Changes
            </h3>
            <p className="text-base leading-relaxed">
              Event schedules, venues, artists, and programming are subject to
              change. No refunds shall be issued for changes in artists,
              performance duration, or event flow.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              4. Assumption of Risk
            </h2>
            <p className="text-base leading-relaxed">
              You acknowledge that attending live events involves inherent risks
              including crowd movement, loud music, lighting effects, weather
              conditions, physical activity, and use of colours or water (where
              applicable). Attendance is at your own risk, and you voluntarily
              assume all such risks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              5. Photography, Recording & Media Rights
            </h2>
            <p className="text-base leading-relaxed">
              By attending the event, you grant Soleado the irrevocable right
              to photograph, record, and use your likeness, voice, or
              appearance in any media for promotional, commercial, or
              archival purposes without compensation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-base leading-relaxed">
              All branding, content, event formats, designs, recordings, and
              materials are the intellectual property of Soleado or its
              licensors. You may not reproduce, distribute, or exploit any such
              content without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              7. Third-Party Services
            </h2>
            <p className="text-base leading-relaxed">
              Soleado may collaborate with third-party ticketing platforms,
              payment gateways, artists, venues, sponsors, and vendors. Soleado
              is not responsible for the acts, omissions, or policies of such
              third parties, which are governed by their respective terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-base leading-relaxed mb-2">
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>
                Soleado shall not be liable for any personal injury, loss,
                theft, or damage to property
              </li>
              <li>
                Soleado’s total liability, if any, shall be limited to the face
                value of the ticket
              </li>
              <li>
                Soleado shall not be liable for indirect, incidental,
                consequential, or punitive damages
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              9. Indemnification
            </h2>
            <p className="text-base leading-relaxed">
              You agree to indemnify and hold harmless Soleado, its directors,
              officers, employees, and partners from any claims, losses,
              damages, liabilities, or expenses arising from your conduct,
              breach of these Terms, or violation of law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              10. Suspension & Termination
            </h2>
            <p className="text-base leading-relaxed">
              Soleado may suspend or terminate access to the Platform or deny
              event entry at its sole discretion, including for safety,
              compliance, or operational reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              11. Force Majeure
            </h2>
            <p className="text-base leading-relaxed">
              Soleado shall not be liable for failure or delay in performance
              due to events beyond its reasonable control, including natural
              disasters, weather conditions, government restrictions, public
              safety advisories, pandemics, or technical failures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              12. Governing Law & Dispute Resolution
            </h2>
            <p className="text-base leading-relaxed">
              These Terms shall be governed by the laws of India. Any disputes
              shall be resolved by arbitration under the Arbitration and
              Conciliation Act, 1996, with the seat of arbitration at
              Bangalore, India. Courts at the said location shall have
              exclusive jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-base leading-relaxed">
              Soleado reserves the right to modify these Terms at any time.
              Continued use of the Platform or attendance at events
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              14. Contact & Grievance Redressal
            </h2>
            <div className="text-base leading-relaxed text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">
                Soleado Elements Private Limited
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:hello@soleadogroup.com"
                  className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-700"
                >
                  hello@soleadogroup.com
                </a>
              </p>
              <p>
                Registered Office: Number- 10, 6th cross, LBS Nagar,
                Kaggadaspura, Vimanapura, Bangalore North, Bangalore- 560017,
                Karnataka
              </p>
            </div>
            <p className="text-base leading-relaxed mt-4">
              These Terms form a legally binding agreement between you and
              Soleado Elements Private Limited.
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-500 flex-wrap">
            <Link href="/privacy" className="hover:text-gray-700 underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-gray-400">·</span>
            <Link href="/refund" className="hover:text-gray-700 underline-offset-2 hover:underline">
              Refund Policy
            </Link>
            <span className="hidden sm:inline text-gray-400">·</span>
            <p>© 2026 SOLEADO ELEMENT PRIVATE LIMITED. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
