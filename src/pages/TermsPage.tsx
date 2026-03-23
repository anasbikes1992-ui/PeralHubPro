/**
 * Platform Terms & Conditions — Pearl Hub PRO
 * Master platform agreement — Grabber Mobility Solutions (Pvt) Ltd
 * Incorporates: general platform use, payment gateways, privacy, and cookie policy
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

const COMPANY = "Grabber Mobility Solutions (Pvt) Ltd";
const PLATFORM = "Pearl Hub";
const PLATFORM_URL = "https://pearlhub.lk";
const EFFECTIVE_DATE = "1 January 2026";
const CONTACT_EMAIL = "legal@pearlhub.lk";
const ADDRESS = "No. 1, De Mel Place, Colombo 03, Sri Lanka";
const COMPANY_REG = "PV XXXXX / Sri Lanka";

interface Section { id: string; title: string; content: React.ReactNode; }

const sections: Section[] = [
  {
    id: "about",
    title: "1. About Pearl Hub and the Company",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p><strong className="text-foreground">Pearl Hub</strong> is a multi-vertical digital marketplace platform (the "Platform") developed, owned, and operated by <strong className="text-foreground">{COMPANY}</strong> (Company Registration: {COMPANY_REG}), a private limited company incorporated and registered under the laws of the Democratic Socialist Republic of Sri Lanka.</p>
        <p>The Platform enables registered Customers to browse, compare, and book services from registered Providers across the following verticals: (a) property sales, rental, and leasing; (b) accommodation and holiday stays; (c) vehicle rental; (d) events and entertainment; (e) small and medium enterprise goods and services; and (f) community social features.</p>
        <p>The Company provides the Platform as a technology intermediary only. <strong className="text-foreground">The Company does not itself provide any property, accommodation, vehicle, event, or other service listed on the Platform.</strong> All services are provided by independent third-party Providers. The Company's role is limited to facilitating connections between Customers and Providers and processing payments on behalf of Providers.</p>
        <p>The Pearl Hub brand, all associated trade marks, logos, domain names, and intellectual property are the exclusive property of {COMPANY}. Unauthorised use is strictly prohibited and will be pursued through all available legal remedies.</p>
      </div>
    ),
  },
  {
    id: "use",
    title: "2. Platform Use and Acceptable Conduct",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>All users (both Customers and Providers) must use the Platform in a lawful, respectful, and responsible manner. Users agree not to: (a) use the Platform for any illegal or fraudulent purpose; (b) transmit any virus, malware, or other harmful code; (c) attempt to gain unauthorised access to the Platform's systems; (d) collect, harvest, or scrape data from the Platform without prior written consent; (e) post defamatory, abusive, or inappropriate content; (f) impersonate any person, entity, or {COMPANY}; (g) use the Platform in any manner that could damage the Company's reputation or business interests.</p>
        <p>The Company monitors Platform activity and reserves the right to take any action it deems necessary to protect the integrity of the Platform, its users, and the Company, including account suspension, content removal, and referral to law enforcement.</p>
      </div>
    ),
  },
  {
    id: "payments",
    title: "3. Payment Gateways — PayHere, LankaPay, WebXPay",
    content: (
      <div className="space-y-4 text-sm text-secondary leading-relaxed">
        <p>The Company facilitates payment processing through the following authorised third-party payment gateways. By initiating any payment on the Platform, you additionally accept the terms and conditions of the applicable payment gateway.</p>

        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
          <p className="font-black text-foreground text-[11px] uppercase tracking-widest mb-2">PayHere</p>
          <p>PayHere is operated by PayHere (Pvt) Ltd, a licensed payment service provider regulated by the Central Bank of Sri Lanka. PayHere processes payments via Visa, Mastercard, American Express, Dialog eZ Cash, Mobitel Genie, and Hutch FriMi. PayHere's terms of service are available at <a href="https://www.payhere.lk/terms" className="text-primary underline" target="_blank" rel="noopener noreferrer">payhere.lk/terms</a>. The Company is not responsible for any payment processing errors, delays, or failures by PayHere.</p>
        </div>

        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <p className="font-black text-foreground text-[11px] uppercase tracking-widest mb-2">LankaPay</p>
          <p>LankaPay is the national payment switch of Sri Lanka operated by LankaClear (Pvt) Ltd, under the oversight of the Central Bank of Sri Lanka. LankaPay enables payments via LankaQR, internet banking, and mobile banking across all Sri Lankan commercial banks. LankaClear's terms are available at <a href="https://www.lankaclear.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">lankaclear.com</a>. The Company is not responsible for any delays or failures in LankaPay settlement processing.</p>
        </div>

        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
          <p className="font-black text-foreground text-[11px] uppercase tracking-widest mb-2">WebXPay</p>
          <p>WebXPay is operated by Webxperts (Pvt) Ltd, a PCI-DSS Level 1 certified payment gateway providing international card processing with 3D Secure authentication. WebXPay processes Visa and Mastercard international transactions. WebXPay's terms are available at <a href="https://www.webxpay.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">webxpay.com</a>. The Company is not responsible for currency conversion rates or cross-border transaction fees applied by WebXPay.</p>
        </div>

        <p><strong className="text-foreground">The Company's role in payment processing is limited to initiating payment requests and receiving confirmation of successful transactions.</strong> The Company does not store card details. All card data is processed exclusively by the respective payment gateway's PCI-DSS compliant infrastructure. The Company shall not be liable for any data breach, fraud, or loss arising from the payment gateway's systems.</p>
      </div>
    ),
  },
  {
    id: "ip",
    title: "4. Intellectual Property Rights",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>All content on the Platform that is created by or on behalf of the Company — including but not limited to the Pearl Hub brand, logos, trade marks, platform design, software, databases, and promotional materials — is the exclusive intellectual property of {COMPANY} and is protected by Sri Lankan and international intellectual property laws.</p>
        <p>No user may reproduce, distribute, modify, create derivative works of, or publicly display any Company intellectual property without prior written consent.</p>
        <p>User-submitted content (Provider listings, Customer reviews, social posts) remains the intellectual property of the submitting user. By submitting content, users grant the Company a perpetual, royalty-free licence to use that content on and for the Platform.</p>
      </div>
    ),
  },
  {
    id: "liability",
    title: "5. Company Liability — Limitations and Exclusions",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p className="font-medium text-foreground p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">The following limitations apply to all users. Please read carefully.</p>
        <p>To the maximum extent permitted by Sri Lankan law, {COMPANY} excludes all liability for: (a) the quality, safety, legality, or availability of any Provider service; (b) any personal injury, death, or property damage arising from use of a Provider's service; (c) any financial loss arising from any transaction on the Platform; (d) interruptions, errors, or unavailability of the Platform; (e) unauthorised access to or alteration of user data; (f) any content posted by Providers or other users on the Platform; (g) any loss or damage caused by viruses or other technologically harmful material transmitted through the Platform.</p>
        <p><strong className="text-foreground">Aggregate liability cap:</strong> The Company's total aggregate liability to any single user, howsoever arising, shall not exceed LKR 50,000 (fifty thousand Sri Lankan Rupees) or the total fees paid to the Company in connection with the specific transaction giving rise to the claim (whichever is lower).</p>
        <p>Nothing in these terms excludes or limits liability for death or personal injury caused by the Company's gross negligence, fraud, or fraudulent misrepresentation, to the extent that such exclusion or limitation is not permitted by applicable Sri Lankan law.</p>
      </div>
    ),
  },
  {
    id: "indemnity",
    title: "6. User Indemnification of the Company",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p><strong className="text-foreground">All users — both Customers and Providers — agree to fully and unconditionally indemnify, defend, and hold harmless</strong> {COMPANY}, its shareholders, officers, directors, employees, agents, sub-contractors, successors, and assigns from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees on a full indemnity basis) arising from or in connection with:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Your use of, or inability to use, the Platform;</li>
          <li>Your violation of these Platform Terms, the Customer Terms, or the Provider Terms;</li>
          <li>Your violation of any applicable Sri Lankan law, regulation, or third-party rights;</li>
          <li>Any content you submit, post, or transmit through the Platform;</li>
          <li>Any dispute between you and another user or Provider;</li>
          <li>Any claim by a regulatory authority arising from your activities on the Platform;</li>
          <li>Any act or omission of any third party in connection with services booked through the Platform.</li>
        </ul>
        <p>This indemnification shall survive termination of your account and these terms.</p>
      </div>
    ),
  },
  {
    id: "privacy",
    title: "7. Privacy Policy",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>{COMPANY} collects and processes personal data in accordance with Sri Lankan data protection principles and applicable law. Data we collect includes: name, email, phone number, NIC number, payment information (processed exclusively by payment gateways), booking history, and browsing activity on the Platform.</p>
        <p><strong className="text-foreground">How we use your data:</strong> (a) to operate and improve the Platform; (b) to process bookings and payments; (c) to communicate with you regarding your account and bookings; (d) to enforce our terms; (e) for fraud prevention and security; (f) to comply with legal obligations; (g) for marketing purposes where you have given consent.</p>
        <p><strong className="text-foreground">Data sharing:</strong> We share your booking details with the relevant Provider to facilitate service delivery. We share anonymised, aggregated data with analytics partners. We do not sell your personal data. We disclose data to law enforcement when required by law.</p>
        <p><strong className="text-foreground">Your rights:</strong> You have the right to access, correct, or delete your personal data. Submit requests to {CONTACT_EMAIL}.</p>
        <p><strong className="text-foreground">Data retention:</strong> We retain your data for as long as your account is active plus 7 years for legal and audit purposes.</p>
        <p><strong className="text-foreground">Cookies:</strong> The Platform uses essential cookies for session management, analytical cookies to understand usage, and preference cookies to remember your settings. You may disable non-essential cookies in your browser settings.</p>
      </div>
    ),
  },
  {
    id: "governing",
    title: "8. Governing Law and Jurisdiction",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p><strong className="text-foreground">These Platform Terms, and all contracts and transactions facilitated through the Platform, are governed by the laws of the Democratic Socialist Republic of Sri Lanka.</strong></p>
        <p>Any dispute, controversy, or claim arising out of or relating to these terms, or the breach, termination, or validity thereof, shall be subject to the exclusive jurisdiction of the courts of Sri Lanka, sitting in Colombo. Users irrevocably submit to the jurisdiction of those courts and waive any objection to proceedings in those courts on grounds of venue or jurisdiction.</p>
        <p>If any user is located outside Sri Lanka, they acknowledge that their use of the Platform is subject to Sri Lankan law and that they may not have the same consumer rights as they would under their domestic law.</p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "9. Changes to these Terms",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>The Company reserves the right to modify these Platform Terms at any time. Where the modification is material, we will provide at least 14 days' notice via email or prominent in-Platform notification. Your continued use of the Platform after the effective date of any modification constitutes your acceptance of the modified terms.</p>
        <p>If you do not accept modified terms, you must close your account before the effective date of the modification. Closing your account does not affect any outstanding rights or obligations under the terms in force at the time of any prior transaction.</p>
      </div>
    ),
  },
  {
    id: "contact",
    title: "10. Contact and Notices",
    content: (
      <div className="space-y-3 text-sm text-secondary leading-relaxed">
        <p>All legal notices to the Company must be sent by email to <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a> and by registered post to:</p>
        <div className="p-4 bg-card border border-border rounded-xl font-medium text-foreground text-sm">
          <p>{COMPANY}</p>
          <p>{ADDRESS}</p>
          <p>Sri Lanka</p>
          <p className="mt-2 text-muted-foreground text-xs">Registered Company: {COMPANY_REG}</p>
        </div>
        <p>Notices sent by email are deemed received on the next business day. Notices sent by registered post are deemed received 5 business days after posting.</p>
      </div>
    ),
  },
];

export default function TermsPage() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>("about");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-background to-card py-16">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest">
            Platform Terms
          </Badge>
          <h1 className="text-4xl font-black mb-3">
            Platform Terms <span className="text-primary italic">&amp; Conditions</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Master terms governing use of the Pearl Hub platform for all users — including payment gateway terms, privacy policy, intellectual property, and liability.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-6 text-xs text-muted-foreground">
            <span>Effective: <strong>{EFFECTIVE_DATE}</strong></span>
            <span>·</span>
            <span>Operated by: <strong>{COMPANY}</strong></span>
          </div>
        </div>
      </div>

      {/* Quick links to other term sets */}
      <div className="border-b border-border bg-card/50 py-5">
        <div className="container max-w-4xl mx-auto px-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 text-center">Role-specific terms</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate("/terms/customer")} className="text-xs gap-1.5">
              👤 Customer Terms <ExternalLink size={11} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/terms/provider")} className="text-xs gap-1.5">
              🏢 Provider Terms <ExternalLink size={11} />
            </Button>
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

        <div className="mt-10 p-6 bg-primary/5 border border-primary/15 rounded-2xl">
          <p className="font-black text-sm text-foreground mb-2">Legal Contact — {COMPANY}</p>
          <p className="text-xs text-muted-foreground">{ADDRESS}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
