import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy | Rangotsav",
  description:
    "Privacy Policy for Soleado Elements Pvt. Ltd. – how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Soleado Elements Pvt. Ltd. · Last updated: 19 January 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
          <p className="text-base leading-relaxed">
            We place the highest importance on respecting and protecting your
            privacy. Our relationship with our attendees, customers, artists,
            partners, vendors, and collaborators is our most valuable asset. We
            want you to feel comfortable and confident while engaging with our
            events, platforms, and services.
          </p>

          <p className="text-base leading-relaxed">
            The objective of this Privacy Policy (“Policy”) is to help you
            understand the type of information we collect, the purpose for which
            it is used, how it is shared, our practices relating to cookies,
            data security, data retention, withdrawal of consent, dispute
            resolution, and your legal rights.
          </p>

          <p className="text-base leading-relaxed">
            This Policy applies to the use of or access to the website, event
            pages, ticketing links, registrations, and services operated or
            promoted by Soleado Elements Private Limited (“Soleado”, “we”, “our”,
            “us”).
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              What We Provide
            </h2>
            <p className="text-base leading-relaxed mb-4">
              Soleado Elements Private Limited is the event management and
              experiential entertainment company engaged in conceptualising,
              organising, promoting, and executing live events, festivals,
              concerts, corporate events, brand activations, cultural programs,
              and private gatherings.
            </p>
            <p className="text-base leading-relaxed mb-2">
              Our services include:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>Event planning, production, and on-ground execution</li>
              <li>Ticketed and non-ticketed event management</li>
              <li>Coordination with artists, performers, vendors, and venues</li>
              <li>Event marketing, promotions, and audience engagement</li>
              <li>Entry management, access control, and crowd coordination</li>
              <li>
                Customer support related to event registrations and attendance
              </li>
            </ul>
            <p className="text-base leading-relaxed mt-4">
              By offering these services, Soleado aims to deliver memorable live
              experiences while ensuring operational efficiency, safety, and
              compliance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Information We Collect
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Personal Information
            </h3>
            <p className="text-base leading-relaxed mb-2">
              When you interact with us or attend our events, we may collect:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>Name, email address, and mobile number</li>
              <li>Age or date of birth (for age-restricted events)</li>
              <li>
                Government-issued identification details (only where legally or
                operationally required)
              </li>
              <li>
                Emergency contact details (where required for safety purposes)
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Event & Transaction Information
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>Ticket booking details and order references</li>
              <li>Check-in, access control, and attendance records</li>
              <li>Refund, cancellation, or rescheduling requests</li>
              <li>Communications with our support team</li>
            </ul>
            <p className="text-base leading-relaxed text-gray-600 italic">
              Note: We do not store sensitive financial information such as
              card numbers, CVV, UPI PINs, or banking passwords. All payments
              are processed through third-party ticketing platforms or payment
              gateways.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              Technical & Usage Information
            </h3>
            <p className="text-base leading-relaxed mb-2">
              When you visit our website or event pages, we may collect:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>IP address, browser type, and device information</li>
              <li>Pages viewed, time spent, and interaction data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              How We Use the Information
            </h2>
            <p className="text-base leading-relaxed mb-2">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>To manage event registrations, ticketing, and entry</li>
              <li>
                To communicate event-related updates, changes, safety
                instructions, or emergencies
              </li>
              <li>To provide customer support and resolve disputes</li>
              <li>
                To comply with legal, regulatory, and safety requirements
              </li>
              <li>To improve event experiences, planning, and operations</li>
              <li>
                To prevent fraud, unauthorized access, or misuse of services
              </li>
              <li>
                To conduct internal analysis and business planning using
                aggregated and anonymised data
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Sharing of Information
            </h2>
            <p className="text-base leading-relaxed mb-2">
              We may share your information strictly on a need-to-know basis
              with:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>Ticketing platforms and payment gateways</li>
              <li>Event venues, security agencies, and access-control vendors</li>
              <li>
                Artists, performers, or event partners (only where
                operationally required)
              </li>
              <li>
                Government, regulatory, or law enforcement authorities when
                required by law
              </li>
            </ul>
            <p className="text-base leading-relaxed">
              Soleado does not sell or trade personal data. Once information is
              lawfully shared with third parties, it is governed by their
              respective privacy policies, and Soleado shall not be responsible
              for their independent practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Cookies
            </h2>
            <p className="text-base leading-relaxed mb-2">
              We may use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>Improve website functionality and user experience</li>
              <li>Remember preferences and settings</li>
              <li>Analyse traffic and engagement patterns</li>
            </ul>
            <p className="text-base leading-relaxed">
              Cookies do not store sensitive personal or payment information.
              You may modify your browser settings to manage or disable
              cookies; however, some features may not function properly as a
              result.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Identity Theft & Phishing
            </h2>
            <p className="text-base leading-relaxed">
              Soleado will never ask for sensitive personal or financial
              information such as passwords, OTPs, card details, or banking
              credentials via email, SMS, or phone calls. If you receive any
              suspicious communication claiming to be from Soleado, we advise
              you not to respond and to report the same immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Information Security
            </h2>
            <p className="text-base leading-relaxed">
              We implement reasonable technical and organisational measures to
              safeguard personal data against unauthorised access, loss, or
              misuse. While we strive to protect your information, no system
              can guarantee absolute security, and you acknowledge the inherent
              risks associated with digital platforms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Third-Party Platforms
            </h2>
            <p className="text-base leading-relaxed">
              Our website or communications may contain links to third-party
              platforms, including ticketing partners or social media
              platforms. These platforms are governed by their own privacy
              policies, and Soleado shall not be responsible for their content,
              security, or data practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Data Retention
            </h2>
            <p className="text-base leading-relaxed mb-2">
              We retain personal data only for as long as necessary to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1 mb-4">
              <li>Fulfil event-related purposes</li>
              <li>
                Comply with legal, regulatory, or accounting obligations
              </li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p className="text-base leading-relaxed">
              Certain records may be retained for a minimum period as required
              under applicable Indian laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Withdrawal of Consent
            </h2>
            <p className="text-base leading-relaxed">
              You may withdraw your consent by contacting us in writing at{" "}
              <a
                href="mailto:hello@soleadogroup.com"
                className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-700"
              >
                hello@soleadogroup.com
              </a>
              . Withdrawal of consent may affect your ability to access certain
              services or attend events where such information is mandatory.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Legal Disputes & Grievances
            </h2>
            <p className="text-base leading-relaxed">
              Any disputes arising out of or in connection with this Policy
              shall be resolved in accordance with Indian law. Disputes shall
              be subject to arbitration under the Arbitration and
              Conciliation Act, 1996, with the seat and venue of arbitration at
              Bangalore, India. The language of arbitration shall be English.
              Courts at the said location shall have exclusive jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Disclaimer
            </h2>
            <p className="text-base leading-relaxed">
              Soleado shall not be liable for any loss or damage arising from
              inadvertent disclosure of information, system failures,
              third-party actions, or events beyond its reasonable control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Changes to This Policy
            </h2>
            <p className="text-base leading-relaxed">
              We may update this Policy from time to time. Changes will be
              reflected by updating the “Last Updated” date. Continued use of
              our services after such updates constitutes acceptance of the
              revised Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              Contact Us
            </h2>
            <p className="text-base leading-relaxed mb-4">
              If you have any questions, concerns, or grievances regarding
              this Privacy Policy, you may contact us at:
            </p>
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
                Address: Number- 10, 6th cross, LBS Nagar, Kaggadaspura,
                Vimanapura, Bangalore North, Bangalore- 560017, Karnataka
              </p>
            </div>
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
            <Link href="/refund" className="hover:text-gray-700 underline-offset-2 hover:underline">
              Refund Policy
            </Link>
            <span className="hidden sm:inline text-gray-400">·</span>
            <Link href="/terms" className="hover:text-gray-700 underline-offset-2 hover:underline">
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
