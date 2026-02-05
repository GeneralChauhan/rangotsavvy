import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Refund Policy | Rangotsav",
  description:
    "Refund Policy for Soleado Elements Pvt. Ltd. – circumstances under which refunds may or may not be issued.",
};

export default function RefundPolicyPage() {
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
          Refund Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Soleado Elements Pvt. Ltd. · Last updated: 19 January 2026
        </p>

        <div className="max-w-none space-y-10 text-gray-700">
          <p className="text-base leading-relaxed">
            Thank you for choosing Soleado Elements Pvt. Ltd. (“Soleado”, “we”,
            “us”, “our”). We strive to deliver high-quality event experiences
            and services. This Refund Policy explains the circumstances under
            which refunds may or may not be issued. By purchasing tickets,
            passes, packages, or event-related services from Soleado, you agree
            to this Refund Policy.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              1. General Refund Principles
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>
                All purchases made for events, tickets, passes, experiences,
                sponsorships, or related services are subject to this Refund
                Policy.
              </li>
              <li>
                Refunds are not automatic and are processed strictly in
                accordance with the conditions outlined below.
              </li>
              <li>
                Certain components of the event (such as venue bookings, artist
                advances, logistics, permissions, marketing, and third-party
                services) are prepaid and non-recoverable. Hence, refunds are
                limited.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              2. Events Where Refunds May Be Initiated
            </h2>
            <p className="text-base leading-relaxed mb-4">
              Refunds may be considered only under the following circumstances:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event Cancellation by Soleado
                </h3>
                <p className="text-base leading-relaxed">
                  If the event is cancelled entirely by Soleado and is not
                  rescheduled, eligible ticket holders will be entitled to a
                  refund of the ticket amount paid, excluding convenience fees,
                  platform fees, taxes, or payment gateway charges.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event Rescheduling
                </h3>
                <p className="text-base leading-relaxed">
                  If the event is rescheduled, tickets will remain valid for the
                  new date. Refunds will be issued only if explicitly announced
                  by Soleado for that event.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Duplicate or Erroneous Transaction
                </h3>
                <p className="text-base leading-relaxed">
                  If you are charged multiple times for the same ticket or
                  transaction due to a technical error, the excess amount will
                  be refunded.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Order Not Fulfilled by Soleado
                </h3>
                <p className="text-base leading-relaxed">
                  If Soleado is unable to honour a confirmed ticket, pass, or
                  service due to internal constraints, a refund will be
                  processed for the unfulfilled portion.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment Deducted but Ticket Not Issued
                </h3>
                <p className="text-base leading-relaxed">
                  If your payment is successfully deducted but no ticket or
                  confirmation is issued, you must first approach the payment
                  gateway or ticketing platform. If unresolved, Soleado will
                  assist and process a refund after verification.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              3. Events Where Refunds Will NOT Be Issued
            </h2>
            <p className="text-base leading-relaxed mb-2">
              Refunds shall not be issued under the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>
                Change in personal plans, inability to attend, travel issues,
                illness, or personal emergencies.
              </li>
              <li>No-shows or late arrivals on the event day.</li>
              <li>
                Change in event lineup, artist performance order, event
                schedule, or supporting acts.
              </li>
              <li>Change of venue within the same city.</li>
              <li>
                Weather conditions, including rain, unless the event is
                officially cancelled.
              </li>
              <li>
                Force majeure events such as acts of God, government
                restrictions, strikes, pandemics, curfews, natural disasters,
                or situations beyond Soleado’s reasonable control.
              </li>
              <li>
                Tickets purchased under promotional offers, complimentary
                passes, giveaways, or influencer collaborations.
              </li>
              <li>
                Any booking where entry has already been scanned or partially
                used.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              4. Cancellation by Attendee (If Applicable)
            </h2>
            <p className="text-base leading-relaxed mb-4">
              If Soleado announces that attendee-initiated cancellations are
              permitted for a specific event, refunds will be processed as per
              the schedule below:
            </p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-base border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left font-semibold text-gray-900 py-3 px-4">
                      Refund amount
                    </th>
                    <th className="text-left font-semibold text-gray-900 py-3 px-4">
                      Condition
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">90% of ticket value</td>
                    <td className="py-3 px-4">
                      Cancellation request made more than 15 days before the
                      event date
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">75% of ticket value</td>
                    <td className="py-3 px-4">
                      Cancellation request made between 8–15 days before the
                      event date
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4">50% of ticket value</td>
                    <td className="py-3 px-4">
                      Cancellation request made between 3–7 days before the
                      event date
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">0% refund</td>
                    <td className="py-3 px-4">
                      Cancellation request made within 72 hours of the event or
                      on the event day
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-base leading-relaxed mt-4">
              Convenience fees, taxes, and payment gateway charges are
              non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              5. Third-Party Ticketing Platforms
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>
                If tickets are purchased through third-party platforms (e.g.,
                BookMyShow, Paytm Insider, etc.), their refund and cancellation
                policies may also apply.
              </li>
              <li>
                Soleado shall not be responsible for delays or deductions
                caused by such platforms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              6. Refund Processing Timeline
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>
                Once a refund is approved, confirmation will be shared via
                email.
              </li>
              <li>
                Refunds will be processed within 10–30 business days from the
                date of approval.
              </li>
              <li>
                Refunds will be issued to the original mode of payment or as
                credit notes, at Soleado’s discretion.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              7. Right to Refuse Refund
            </h2>
            <p className="text-base leading-relaxed mb-2">
              Soleado reserves the right to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base leading-relaxed text-gray-700 ml-1">
              <li>
                Refuse refund requests that do not meet the eligibility
                criteria.
              </li>
              <li>
                Cancel any booking that violates event rules, code of conduct,
                or applicable laws, without any refund.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">
              8. Contact Us
            </h2>
            <p className="text-base leading-relaxed mb-4">
              For refund-related queries, please contact:
            </p>
            <div className="text-base leading-relaxed text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">
                Soleado Elements Pvt. Ltd.
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
            </div>
          </section>

          <p className="text-base leading-relaxed text-gray-600 border-t border-gray-200 pt-6 mt-10">
            This Refund Policy is subject to change at Soleado’s sole
            discretion. Any updates will be posted on our website and will be
            effective immediately upon publication.
          </p>
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
