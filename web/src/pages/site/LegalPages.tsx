import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';

const LAST_UPDATED = '12 June 2026';

/** Shared shell for the legal pages: centred header + readable prose column. */
function LegalShell({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children: ReactNode }) {
  return (
    <Section eyebrow={eyebrow} title={title} description={`Last updated: ${LAST_UPDATED}`} className="pb-24">
      <div className="max-w-3xl mx-auto space-y-8">{children}</div>
    </Section>
  );
}

function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-50">{heading}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{children}</div>
    </div>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

const CONTACT = <a href="mailto:info@dalanhealth.com" className="text-brand-600 dark:text-brand-300 hover:underline">info@dalanhealth.com</a>;

// ─── Privacy Policy ─────────────────────────────────────────────────────────

export function PrivacyPage() {
  return (
    <LegalShell eyebrow="Legal" title="Privacy Policy">
      <Block heading="Who we are">
        <p>
          Dalan Health is a Smart Queue &amp; Digital OPD platform operated by <strong>Dalansoft Technologies Pvt Ltd</strong>,
          Patna, India. This policy explains what information we collect, why we collect it, and how we protect it.
          Questions any time: {CONTACT}.
        </p>
      </Block>

      <Block heading="Information we collect">
          <Bullets items={[
          <><strong>Clinic account data</strong> — clinic name, address, doctor details, staff accounts, email and mobile numbers used to sign in.</>,
          <><strong>Patient queue data</strong> — name, mobile number, token number, visit source (walk-in / QR / online) and visit timestamps, entered by the clinic or by the patient when booking.</>,
          <><strong>Billing data</strong> — wallet recharges and per-visit deductions (₹9 incl. GST per visit), kept as a transaction ledger.</>,
          <><strong>Technical data</strong> — device/browser type and service logs used for security and troubleshooting.</>,
        ]} />
      </Block>

      <Block heading="How we use it">
        <Bullets items={[
          'Running the live queue: generating tokens, showing positions on the clinic panel, patient app and TV display, and voice-announcing calls.',
          'Notifying patients about their token and queue position.',
          'Billing the clinic wallet and producing transaction records.',
          'Support, security, and improving the product.',
        ]} />
        <p>We do <strong>not</strong> sell personal data, and we do not use patient data for advertising.</p>
      </Block>

      <Block heading="Patient data belongs to the clinic">
        <p>
          For patient records, the clinic is the data fiduciary and Dalan Health acts as a data processor on the
          clinic's instructions. One clinic can never see another clinic's data — isolation is enforced at the
          database level on every request.
        </p>
      </Block>

      <Block heading="Storage and security">
        <Bullets items={[
          'Encrypted in transit (TLS) and at rest.',
          'Token-based authentication with role-based access control (owner, doctor, receptionist, TV display).',
          'Strict clinic-level data isolation and audit logging on sensitive actions.',
          'Hosted on reputable cloud infrastructure with automated backups.',
        ]} />
      </Block>

      <Block heading="Sharing">
        <p>
          We share data only with the service providers required to run the platform (cloud hosting, payment
          processing) under contractual safeguards, or when the law requires it. Nothing else.
        </p>
      </Block>

      <Block heading="Retention and your rights">
        <p>
          We keep data while the clinic account is active and as required for tax and legal records. In line with
          India's Digital Personal Data Protection Act, 2023, you may request access to, correction of, or deletion
          of your personal data by writing to {CONTACT}. Clinics can also remove patient records from their own panel.
        </p>
      </Block>

      <Block heading="Changes">
        <p>
          If we materially change this policy we will update this page and the "last updated" date above, and notify
          clinics in the product where appropriate.
        </p>
      </Block>
    </LegalShell>
  );
}

// ─── Terms of Service ───────────────────────────────────────────────────────

export function TermsPage() {
  return (
    <LegalShell eyebrow="Legal" title="Terms of Service">
      <Block heading="1. Agreement">
        <p>
          By creating an account or using Dalan Health you agree to these terms. The service is operated by
          <strong> Dalansoft Technologies Pvt Ltd</strong> ("Dalansoft", "we"). If you use the service on behalf of a
          clinic, you confirm you are authorised to bind that clinic.
        </p>
      </Block>

      <Block heading="2. The service">
        <p>
          Dalan Health provides smart queue management and digital OPD tools: token generation for walk-in, QR and
          online patients, live queue tracking, TV display with voice announcements, dashboards, wallet billing and
          reports. Dalan Health is practice-management software — it is <strong>not</strong> a medical device and does
          not provide medical advice; all clinical decisions remain with the clinic.
        </p>
      </Block>

      <Block heading="3. Accounts">
        <Bullets items={[
          'Provide accurate information and keep your credentials confidential.',
          'The clinic is responsible for actions taken by its staff accounts.',
          'Tell us immediately at info@dalanhealth.com if you suspect unauthorised access.',
        ]} />
      </Block>

      <Block heading="4. Pricing and wallet">
          <Bullets items={[
          <><strong>₹9 incl. GST per visit</strong> is deducted from the clinic's prepaid wallet when a consultation is marked complete. Charges apply per visit, not per patient — a patient who visits twice is two visits (2 × ₹9 incl. GST).</>,
          'No setup fee, no monthly or annual subscription, no contract lock-in.',
          'Cancellations, no-shows and unconsulted tokens are not charged.',
          'Wallet recharges are non-transferable between clinics. On account closure, any unused balance is settled in accordance with applicable law — write to us.',
          'GST-compliant records are provided for platform fees.',
        ]} />
      </Block>

      <Block heading="5. Clinic responsibilities">
        <Bullets items={[
          'Enter patient information accurately and lawfully.',
          'Inform patients that their name and token may appear on the waiting-room display and be voice-announced, and honour any patient who objects.',
          'Use the platform only for legitimate clinic operations.',
        ]} />
      </Block>

      <Block heading="6. Acceptable use">
        <p>
          Do not attempt to breach security, access another clinic's data, scrape the service, resell it, or use it
          for anything unlawful. We may suspend accounts that put other clinics or patients at risk.
        </p>
      </Block>

      <Block heading="7. Availability">
        <p>
          We aim for high availability but do not guarantee uninterrupted service; maintenance and factors outside
          our control can cause downtime. Clinics should have a basic fallback (e.g. manual tokens) for outages.
        </p>
      </Block>

      <Block heading="8. Intellectual property">
        <p>
          The platform, brand and code belong to Dalansoft. Your clinic's data belongs to your clinic — we claim no
          ownership of it.
        </p>
      </Block>

      <Block heading="9. Liability">
        <p>
          To the maximum extent permitted by law, Dalansoft's total liability for any claim is limited to the
          platform fees the clinic paid in the three months before the claim, and we are not liable for indirect or
          consequential losses.
        </p>
      </Block>

      <Block heading="10. Termination and governing law">
        <p>
          Either side may close the account at any time. These terms are governed by the laws of India, with courts
          at Patna having jurisdiction. Contact: {CONTACT}.
        </p>
      </Block>
    </LegalShell>
  );
}

// ─── Compliance ─────────────────────────────────────────────────────────────

export function CompliancePage() {
  return (
    <LegalShell eyebrow="Legal" title="Compliance & Security">
      <Block heading="Data protection law">
        <p>
          Dalan Health is designed to align with India's <strong>Digital Personal Data Protection Act, 2023 (DPDP)</strong> and
          the <strong>Information Technology Act, 2000</strong>. For patient records the clinic acts as data fiduciary and
          Dalansoft as data processor, processing data only to run the queue, displays, notifications and billing the
          clinic has enabled.
        </p>
      </Block>

      <Block heading="Security measures">
        <Bullets items={[
          'TLS encryption for all traffic; encryption at rest for stored data.',
          'Token-based authentication (JWT) with role-based access control for owner, doctor, receptionist and TV-display roles.',
          'Clinic-level data isolation enforced on every database query — one clinic can never read another\'s data.',
          'Audit logs on sensitive actions (queue changes, wallet transactions, staff management).',
          'Automated backups and infrastructure monitoring with health checks.',
        ]} />
      </Block>

      <Block heading="Infrastructure">
        <p>
          The platform runs on reputable cloud providers in the Asia-Pacific region with managed PostgreSQL,
          continuous deployment checks and uptime monitoring. We do not run production systems on personal hardware.
        </p>
      </Block>

      <Block heading="Payments and tax">
        <p>
          Platform fees (₹9 incl. GST per visit) are GST-compliant, with a full wallet ledger available to
          every clinic in its dashboard.
        </p>
      </Block>

      <Block heading="What Dalan Health is not">
        <Bullets items={[
          'Not a medical device, and not a provider of medical advice or treatment.',
          'Not an insurer or a payer; we never decide anything clinical.',
          'Not a data broker — patient data is never sold or used for advertising.',
        ]} />
      </Block>

      <Block heading="Responsible disclosure">
        <p>
          Found a security issue? Email {CONTACT} with the details. We investigate every report and appreciate
          coordinated disclosure — please give us reasonable time to fix before publishing.
        </p>
      </Block>
    </LegalShell>
  );
}
