/**
 * Customer Terms & Conditions — Pearl Hub PRO
 * Governed by Grabber Mobility Solutions (Pvt) Ltd
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

const COMPANY = "Grabber Mobility Solutions (Pvt) Ltd";
const PLATFORM = "Pearl Hub";
const EFFECTIVE_DATE = "1 January 2026";
const CONTACT_EMAIL = "legal@pearlhub.lk";
const CONTACT_ADDRESS = "No. 1, De Mel Place, Colombo 03, Sri Lanka";

interface Section { id: string; title: string; content: React.ReactNode; }

const sections: Section[] = [
  {
    id: "intro",
    title: "1. Introduction and Acceptance",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>These Customer Terms and Conditions ("Customer Terms") govern your access to and use of the Pearl Hub platform ("Platform"), operated by <strong className="text-foreground">{COMPANY}</strong>, a company incorporated and registered under the laws of Sri Lanka ("the Company", "we", "us", "our").</p>
        <p>By registering an account, accessing the Platform, or making any booking or transaction through Pearl Hub, you ("Customer", "you", "your") unconditionally accept and agree to be legally bound by these Customer Terms, together with our Privacy Policy, Platform Terms, and any applicable Service-Specific Terms.</p>
        <p className="font-medium text-foreground">If you do not accept these terms in their entirety, you must immediately cease using the Platform and close your account.</p>
        <p>These Customer Terms are effective from {EFFECTIVE_DATE}. The Company reserves the absolute right to amend these terms at any time. Continued use of the Platform following notification of amendments constitutes acceptance of the revised terms.</p>
      </div>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility and Account Registration",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>To register as a Customer you must: (a) be at least 18 years of age; (b) possess a valid Sri Lankan NIC, passport, or equivalent government-issued identification; (c) provide accurate, current, and complete registration information; and (d) maintain the security of your account credentials.</p>
        <p>You are solely responsible for all activities occurring under your account. You agree to immediately notify the Company at {CONTACT_EMAIL} of any unauthorised use of your account. The Company shall not be liable for any loss or damage arising from your failure to safeguard your account credentials.</p>
        <p>The Company reserves the right, in its absolute discretion, to suspend or terminate any Customer account at any time without notice if it determines that: (a) the account information provided is false, inaccurate, or misleading; (b) the Customer has violated these terms; or (c) the Customer's conduct is detrimental to the Platform or other users.</p>
      </div>
    ),
  },
  {
    id: "bookings",
    title: "3. Bookings, Payments, and Confirmation",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>All bookings made through the Platform constitute a direct contractual arrangement between the Customer and the relevant Provider (property owner, stay provider, vehicle provider, or event organiser). <strong className="text-foreground">The Company acts solely as a technology intermediary and is not a party to the service contract between Customer and Provider.</strong></p>
        <p>Payment for bookings is processed through authorised third-party payment gateways including PayHere (operated by PayHere (Pvt) Ltd), LankaPay (operated by LankaClear (Pvt) Ltd), and WebXPay (operated by Webxperts (Pvt) Ltd). By making a payment, you also accept the terms and conditions of the applicable payment gateway.</p>
        <p>A booking is not confirmed until you receive a written confirmation from the Platform with a unique booking reference number. The Company reserves the right to cancel any booking at any time if the Provider has breached their obligations or if the Platform detects fraudulent activity.</p>
        <p>Prices displayed on the Platform are in Sri Lankan Rupees (LKR) unless otherwise stated. Prices include applicable taxes and service charges as disclosed at checkout. Currency conversion rates for international display purposes are indicative only; actual charges are processed in LKR.</p>
        <p><strong className="text-foreground">The Company charges a platform service fee</strong> as disclosed at checkout, which is non-refundable unless the booking is cancelled in accordance with the applicable cancellation policy.</p>
      </div>
    ),
  },
  {
    id: "cancellations",
    title: "4. Cancellations, Modifications, and Refunds",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>Cancellation and refund policies vary by Provider and are displayed on each listing page prior to booking. By completing a booking, you acknowledge and accept the specific cancellation policy applicable to that booking.</p>
        <p>Requests for cancellation or modification must be submitted through the Platform. The Company shall not be responsible for any losses arising from a Customer's failure to cancel through the Platform's official channels.</p>
        <p><strong className="text-foreground">Platform service fees are non-refundable</strong> in all circumstances. In the event of a Provider-initiated cancellation, the Company will use reasonable endeavours to refund the gross booking amount, excluding platform fees, within 7-14 business days.</p>
        <p>The Company shall have no liability whatsoever for any losses, damages, costs, or expenses incurred by a Customer arising from a Provider's cancellation, modification, or failure to deliver the booked service.</p>
        <p>Refunds, where applicable, will be credited to the original payment method used at the time of booking. The Company cannot be held responsible for delays caused by payment gateway processing times.</p>
      </div>
    ),
  },
  {
    id: "liability",
    title: "5. Limitation of Liability and Indemnification",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p className="font-medium text-foreground p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">This is a critical section. Please read carefully.</p>
        <p>The Platform is provided on an "as is" and "as available" basis. To the fullest extent permitted by Sri Lankan law, the Company expressly excludes all representations, warranties, and conditions, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
        <p><strong className="text-foreground">The Company shall not be liable</strong> — whether in contract, tort (including negligence), breach of statutory duty, or otherwise — for any: (a) indirect, incidental, special, consequential, or punitive damages; (b) loss of profits, revenue, data, goodwill, or business opportunity; (c) personal injury, death, or property damage arising from Provider services; (d) acts or omissions of any Provider; (e) inaccuracies in Provider-submitted listing information; or (f) any transaction or interaction between Customer and Provider outside the Platform.</p>
        <p>The Company's total aggregate liability to any Customer, howsoever arising, shall not exceed the total platform service fees paid by that Customer in respect of the specific transaction giving rise to the claim, or LKR 25,000 (whichever is lower).</p>
        <p><strong className="text-foreground">You agree to fully indemnify, defend, and hold harmless</strong> the Company, its parent company, subsidiaries, affiliates, officers, directors, employees, agents, and representatives from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of the Platform; (b) your violation of these terms; (c) your violation of any third-party rights; (d) any content you submit or transmit through the Platform; or (e) any dispute between you and a Provider.</p>
      </div>
    ),
  },
  {
    id: "conduct",
    title: "6. Prohibited Conduct",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>You agree not to use the Platform to: (a) post false, misleading, or fraudulent reviews; (b) make bookings with no intention of completing them; (c) circumvent the Platform to arrange transactions directly with Providers to avoid platform fees; (d) harass, abuse, or threaten Providers or other users; (e) engage in any unlawful activity including money laundering or fraud; (f) impersonate any person or entity; (g) use automated tools to scrape, crawl, or harvest Platform data.</p>
        <p>Violation of this clause may result in immediate account termination, forfeiture of any wallet balance, and legal action by the Company.</p>
      </div>
    ),
  },
  {
    id: "disputes",
    title: "7. Dispute Resolution",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>In the event of a dispute between a Customer and a Provider, you must first attempt to resolve the dispute directly with the Provider. If resolution cannot be reached within 7 days, you may escalate the dispute to the Company by contacting {CONTACT_EMAIL}.</p>
        <p>The Company may, at its sole discretion, offer mediation services but is under no obligation to do so and shall not be bound by any mediation outcome. The Company's decision in any dispute mediation shall be final and binding on the parties.</p>
        <p><strong className="text-foreground">These Customer Terms shall be governed by and construed in accordance with the laws of Sri Lanka.</strong> Any legal proceedings shall be subject to the exclusive jurisdiction of the courts of Sri Lanka sitting in Colombo.</p>
      </div>
    ),
  },
  {
    id: "privacy",
    title: "8. Privacy and Data",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>The Company collects and processes your personal data in accordance with our Privacy Policy and applicable Sri Lankan data protection legislation. By using the Platform, you consent to such collection and processing.</p>
        <p>The Company will share your booking details (name, contact information, and booking reference) with the relevant Provider to facilitate service delivery. The Company will not sell your personal data to third parties.</p>
        <p>You have the right to request access to, correction of, or deletion of your personal data by contacting {CONTACT_EMAIL}.</p>
      </div>
    ),
  },
  {
    id: "general",
    title: "9. General Provisions",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The Company's failure to enforce any right or provision does not constitute a waiver of that right or provision.</p>
        <p>These Customer Terms, together with the Platform Terms and Privacy Policy, constitute the entire agreement between you and the Company with respect to your use of the Platform as a Customer.</p>
        <p>For questions regarding these terms, contact: <strong className="text-foreground">{CONTACT_EMAIL}</strong> | {CONTACT_ADDRESS}</p>
      </div>
    ),
  },
];

export default function CustomerTermsPage() {
  const [openSection, setOpenSection] = useState<string | null>("intro");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-br from-background to-card py-16">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
            Customer Agreement
          </Badge>
          <h1 className="text-4xl font-black mb-3">
            Customer Terms <span className="text-primary italic">&amp; Conditions</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Governing your use of Pearl Hub as a customer — bookings, payments, refunds, and your rights and obligations.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6 text-xs text-muted-foreground">
            <span>Effective: <strong>{EFFECTIVE_DATE}</strong></span>
            <span>·</span>
            <span>Issued by: <strong>{COMPANY}</strong></span>
            <span>·</span>
            <span>Platform: <strong>{PLATFORM}</strong></span>
          </div>
        </div>
      </div>

      {/* Company notice */}
      <div className="bg-primary/5 border-b border-primary/10 py-3">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">
            Pearl Hub is operated by <strong className="text-foreground">{COMPANY}</strong>, registered in Sri Lanka.
            These terms are legally binding. Please read carefully before using the platform.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="container max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-3">
          {sections.map(s => (
            <div key={s.id} className="border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
              >
                <h3 className="font-bold text-sm">{s.title}</h3>
                {openSection === s.id ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
              </button>
              {openSection === s.id && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="pt-4">{s.content}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 bg-muted/30 rounded-2xl border border-border text-center">
          <p className="text-sm font-bold mb-1">Questions about these terms?</p>
          <p className="text-xs text-muted-foreground">
            Contact our legal team at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{CONTACT_ADDRESS}</p>
        </div>
      </div>
    </div>
  );
}
