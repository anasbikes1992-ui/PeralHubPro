/**
 * Provider Terms & Conditions — Pearl Hub PRO
 * Governed by Grabber Mobility Solutions (Pvt) Ltd
 * Applies to: Property Owners, Brokers, Stay Providers,
 *             Vehicle Providers, Event Organisers, SME Businesses
 */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

const COMPANY = "Grabber Mobility Solutions (Pvt) Ltd";
const PLATFORM = "Pearl Hub";
const EFFECTIVE_DATE = "1 January 2026";
const CONTACT_EMAIL = "providers@pearlhub.lk";
const CONTACT_ADDRESS = "No. 1, De Mel Place, Colombo 03, Sri Lanka";

const providerTypes = [
  { id: "owner",    label: "🏠 Property Owner",    note: "Direct listing of property for sale, rent, or lease" },
  { id: "broker",   label: "🏢 Licensed Broker",   note: "Multiple property listings under a membership plan" },
  { id: "stay",     label: "🏨 Stay Provider",      note: "Hotels, villas, guest houses, hostels" },
  { id: "vehicle",  label: "🚗 Vehicle Provider",   note: "Self-drive or chauffeured vehicle rental" },
  { id: "event",    label: "🎫 Event Organiser",    note: "Events, cinema, concerts, sports" },
  { id: "sme",      label: "🏪 SME Business",       note: "Local goods, products, and services" },
];

interface Section { id: string; title: string; content: React.ReactNode; }

const sections: Section[] = [
  {
    id: "intro",
    title: "1. Introduction and Scope",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>These Provider Terms and Conditions ("Provider Terms") govern your registration and activities as a service provider on the Pearl Hub platform ("Platform"), operated by <strong className="text-foreground">{COMPANY}</strong> ("the Company").</p>
        <p>These Provider Terms apply to all provider categories including Property Owners, Licensed Brokers, Stay Providers, Vehicle Providers, Event Organisers, and SME Businesses (collectively "Providers"). Category-specific terms supplement these general Provider Terms where applicable.</p>
        <p>By registering as a Provider, you represent that you have read, understood, and agree to be legally bound by these Provider Terms, the Platform Terms, the Privacy Policy, and all applicable Sri Lankan laws and regulations governing your service category.</p>
        <p className="font-medium text-foreground p-3 bg-primary/5 border border-primary/10 rounded-lg">Pearl Hub operates as a technology marketplace only. The Company does not provide any of the services listed on the Platform. All contractual obligations for service delivery rest entirely with the Provider.</p>
      </div>
    ),
  },
  {
    id: "registration",
    title: "2. Provider Registration and Verification",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>To register as a Provider, you must: (a) provide accurate business and personal identification; (b) hold all necessary licences, permits, registrations, and approvals required by Sri Lankan law for your service category; (c) maintain your registered profile information in an accurate and up-to-date state at all times.</p>
        <p><strong className="text-foreground">Verification requirements by provider category:</strong></p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Property Owners:</strong> Valid NIC or passport; proof of ownership (title deed, notarially certified extract, or assessment); LSSP or Condominium Management Authority certificate where applicable.</li>
          <li><strong>Licensed Brokers:</strong> Valid NIC; Sri Lanka Institute of Surveyors (SLIS) or Institute of Valuers (IVS) membership certificate or Broker Licence; business registration.</li>
          <li><strong>Stay Providers:</strong> SLTDA registration certificate; fire safety clearance; health and sanitation clearance from the relevant Municipal or Urban Council.</li>
          <li><strong>Vehicle Providers:</strong> National Transport Commission (NTC) registered transport permit; commercial insurance for each listed vehicle; valid emission test certificate; driver's NIC and licence (for chauffeured services).</li>
          <li><strong>Event Organisers:</strong> Business registration or NIC; police clearance for events exceeding 100 persons; venue permit from the relevant authority.</li>
          <li><strong>SME Businesses:</strong> Business registration or NIC; relevant trade licence where applicable.</li>
        </ul>
        <p>The Company reserves the right to request additional documentation at any time and to suspend or terminate any Provider account where verification requirements are not met.</p>
      </div>
    ),
  },
  {
    id: "listings",
    title: "3. Listing Content and Accuracy",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>You are solely responsible for all content submitted in your listings. You warrant that all listing content is: (a) accurate, truthful, and not misleading; (b) legally owned by you or that you have the right to use it; (c) free from any third-party intellectual property infringement; (d) compliant with all applicable laws and Platform policies.</p>
        <p><strong className="text-foreground">You expressly agree that listing inaccuracies that result in Customer complaints or disputes are your sole responsibility.</strong> The Company shall not be liable for any damages arising from inaccurate, incomplete, or misleading listing content.</p>
        <p>All listings are subject to moderation by the Company prior to publication and on an ongoing basis. The Company reserves the right to remove, suspend, or modify any listing at its absolute discretion, without notice and without liability, if it determines that the listing violates these terms, Platform policies, or applicable law.</p>
        <p>Providers must maintain real-time accuracy of availability, pricing, and service specifications. The Company shall not be liable for any bookings made on the basis of outdated or incorrect availability information.</p>
      </div>
    ),
  },
  {
    id: "commissions",
    title: "4. Commissions, Fees, and Payments",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>The Company charges platform commissions and fees as set out in the current Fee Schedule published on the Platform ("Fee Schedule"). The Company reserves the right to amend the Fee Schedule at any time upon 14 days' notice to Providers.</p>
        <p><strong className="text-foreground">Standard commission rates:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Property sale: 2.0% of final sale price, payable on transaction completion</li>
          <li>Property rental: 0.5% of monthly rental, payable on first month receipt</li>
          <li>Stay bookings: 10% of booking value per confirmed booking</li>
          <li>Vehicle rentals: 10% of booking value per confirmed booking</li>
          <li>Event tickets: 8% of ticket revenue per event</li>
          <li>SME transactions: 5% of transaction value</li>
          <li>Broker memberships: As per selected membership tier (fixed monthly fee)</li>
        </ul>
        <p>Provider earnings, net of commissions, will be disbursed to your registered bank account within 3-5 business days of booking completion or as otherwise specified in your payment schedule. The Company reserves the right to withhold disbursement pending resolution of any Customer dispute or investigation.</p>
        <p><strong className="text-foreground">All listed fees are subject to VAT at the prevailing rate where applicable.</strong> Providers are solely responsible for their own tax obligations arising from earnings on the Platform.</p>
      </div>
    ),
  },
  {
    id: "service",
    title: "5. Service Delivery Obligations",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>By accepting a booking, you enter into a direct contractual obligation with the Customer to deliver the service as described in your listing. You must: (a) honour all confirmed bookings except in circumstances of genuine force majeure; (b) provide the service at the standard described in the listing; (c) maintain minimum required standards of cleanliness, safety, and professionalism; (d) respond to Customer communications within 2 hours during business hours.</p>
        <p>Provider-initiated cancellations may result in: (a) forfeiture of applicable commissions; (b) reduction in Provider tier rating; (c) suspension of listing visibility; and (d) liability to the Customer for any losses caused by the cancellation.</p>
        <p>For stay providers: Minimum check-in and check-out standards must comply with SLTDA guidelines. For vehicle providers: All vehicles must be maintained in roadworthy condition with valid insurances at all times. For event organisers: Events must comply with all terms stated on tickets and listings.</p>
      </div>
    ),
  },
  {
    id: "indemnity",
    title: "6. Provider Indemnification of the Company",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p className="font-medium text-foreground p-3 bg-red-500/5 border border-red-500/20 rounded-lg">This is a critical section. Please read carefully.</p>
        <p><strong className="text-foreground">You agree to fully and unconditionally indemnify, defend, and hold harmless</strong> {COMPANY}, its parent companies, subsidiaries, affiliates, officers, directors, employees, agents, representatives, successors, and assigns ("Indemnified Parties") from and against any and all:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Claims, demands, suits, proceedings, or actions brought by any third party (including Customers, regulatory authorities, or other Providers) arising from your listing content, service delivery, or conduct on or through the Platform;</li>
          <li>Liabilities, damages, losses, costs, and expenses (including reasonable legal and professional fees) arising from your breach of these Provider Terms, the Platform Terms, or applicable Sri Lankan law;</li>
          <li>Claims arising from personal injury, death, property damage, or financial loss suffered by any person in connection with services you provide through the Platform;</li>
          <li>Claims arising from your failure to obtain or maintain required licences, permits, or regulatory approvals;</li>
          <li>Claims arising from intellectual property infringement in your listing content;</li>
          <li>Claims, penalties, fines, or assessments by any regulatory authority (including SLTDA, NTC, Inland Revenue, or other government bodies) arising from your operations;</li>
          <li>Any tax liability arising from your earnings on the Platform.</li>
        </ul>
        <p>This indemnification obligation shall survive the termination of your Provider account and these Provider Terms.</p>
        <p><strong className="text-foreground">The Company shall not be liable</strong> to any Provider for indirect, consequential, or punitive damages. The Company's total liability to any Provider shall not exceed the commissions paid to the Company in the 30-day period immediately preceding the event giving rise to the claim.</p>
      </div>
    ),
  },
  {
    id: "ip",
    title: "7. Intellectual Property",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>By submitting listing content (text, images, videos, and other materials) to the Platform, you grant the Company a non-exclusive, royalty-free, worldwide, perpetual licence to use, reproduce, modify, adapt, publish, and display that content for the purpose of operating, promoting, and improving the Platform.</p>
        <p>You warrant that you own or have the necessary rights to all content you submit, and that such content does not infringe any third-party intellectual property rights.</p>
        <p>Pearl Hub and all associated trade marks, logos, and trade names are the exclusive property of {COMPANY}. No Provider shall use these trade marks in any manner without prior written consent from the Company.</p>
      </div>
    ),
  },
  {
    id: "termination",
    title: "8. Suspension, Termination, and Consequences",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>The Company may, at its absolute discretion and without notice, suspend or permanently terminate any Provider account and remove all associated listings if: (a) the Provider violates these terms or the Platform Terms; (b) the Provider receives sustained negative reviews indicative of substandard service; (c) the Provider fails to maintain required licences; (d) the Provider engages in fraudulent, misleading, or deceptive conduct; (e) the Company receives credible reports of illegal activity by the Provider; or (f) the Company determines that the Provider's continued presence is contrary to the interests of Customers or the Platform.</p>
        <p>Upon termination: (a) all active listings will be immediately removed; (b) pending bookings will be cancelled and Customers refunded at the Company's discretion; (c) any outstanding earnings, net of applicable deductions for Customer refunds and Company costs, will be disbursed within 30 business days; (d) the Provider is barred from re-registering without written consent from the Company.</p>
      </div>
    ),
  },
  {
    id: "compliance",
    title: "9. Legal and Regulatory Compliance",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>Providers must at all times comply with all applicable Sri Lankan laws, regulations, and statutory requirements, including but not limited to: the Tourism Act No. 38 of 2005; the Motor Traffic Act; the Condominium Property Act; the Consumer Affairs Authority Act; the Sri Lanka Accounting and Auditing Standards Act; and all tax legislation including the Value Added Tax Act and the Inland Revenue Act.</p>
        <p>The Company maintains the right to audit Provider compliance at any time and to report suspected illegal activity to the relevant authorities. The Company will cooperate with law enforcement investigations without prior notice to the Provider.</p>
        <p>Providers operating in the tourism sector must display their SLTDA registration number prominently on their listing. Failure to maintain a valid SLTDA registration is grounds for immediate account suspension.</p>
      </div>
    ),
  },
  {
    id: "disputes",
    title: "10. Dispute Resolution and Governing Law",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>These Provider Terms shall be governed by and construed in accordance with the laws of Sri Lanka. Any dispute arising from or in connection with these Provider Terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka sitting in Colombo.</p>
        <p>Prior to commencing legal proceedings, Providers must submit written notice of any dispute to the Company at {CONTACT_EMAIL}. The parties shall attempt to resolve the dispute through good-faith negotiation for a period of 30 days before either party may commence legal proceedings.</p>
        <p>The Company's determination in all matters relating to listing moderation, account suspension, payment withholding pending dispute resolution, and application of these terms shall be final and binding unless successfully challenged through formal legal proceedings in a court of competent jurisdiction.</p>
      </div>
    ),
  },
];

export default function ProviderTermsPage() {
  const [openSection, setOpenSection] = useState<string | null>("intro");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-background to-card py-16">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
            Provider Agreement
          </Badge>
          <h1 className="text-4xl font-black mb-3">
            Provider Terms <span className="text-primary italic">&amp; Conditions</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Binding agreement for all service providers on Pearl Hub — owners, brokers, stay providers, vehicle providers, event organisers, and SME businesses.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6 text-xs text-muted-foreground">
            <span>Effective: <strong>{EFFECTIVE_DATE}</strong></span>
            <span>·</span>
            <span>Issued by: <strong>{COMPANY}</strong></span>
          </div>
        </div>
      </div>

      {/* Provider type badges */}
      <div className="border-b border-border bg-card/50 py-5">
        <div className="container max-w-4xl mx-auto px-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 text-center">These terms apply to all provider types</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {providerTypes.map(p => (
              <span key={p.id} className="text-xs px-3 py-1.5 bg-card border border-border rounded-full text-muted-foreground">{p.label}</span>
            ))}
          </div>
        </div>
      </div>

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
          <p className="text-sm font-bold mb-1">Provider enquiries and complaints</p>
          <p className="text-xs text-muted-foreground">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a> | {CONTACT_ADDRESS}
          </p>
        </div>
      </div>
    </div>
  );
}
