import type { Metadata } from "next";

import { LegalList, LegalPage, LegalSection } from "@/views/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | BetaManuscript",
  description: "How BetaManuscript collects, uses, and protects personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      summary="This policy explains the personal data BetaManuscript processes, why we process it, and the choices available to you."
      lastUpdated="July 27, 2026"
    >
      <LegalSection title="1. Who we are and how to contact us">
        <p>
          BetaManuscript is a workspace for authors to share manuscripts with invited readers and organise feedback. The operator of BetaManuscript is the controller for the personal data described in this policy.
        </p>
        <p>
          For privacy questions or to exercise your rights, contact us at <a className="underline decoration-1 underline-offset-4 hover:text-[#7b1d1d]" href="mailto:support@betamanuscript.com">support@betamanuscript.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. The data we process">
        <LegalList>
          <li><strong>Account information:</strong> your email address, display name, account role, and authentication information supplied by you or your chosen sign-in provider.</li>
          <li><strong>Workspace content:</strong> manuscript text, uploaded source files and cover images, chapters, feedback tags, annotations, survey responses, and reader invitations.</li>
          <li><strong>Reader activity:</strong> reading progress and feedback submitted within a manuscript you were invited to read.</li>
          <li><strong>Communications and support:</strong> messages you send us and operational emails, including invitation and account emails.</li>
          <li><strong>Technical and usage information:</strong> information needed to keep a session secure and limited product or site analytics, such as page views and feature interactions.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Why we use your data">
        <p>We use personal data to create and secure accounts, provide the workspace, deliver reader invitations, display feedback to the relevant author and reader, respond to requests, process payments when you choose a paid plan, and protect the service against misuse.</p>
        <p>Where the UK or EU GDPR applies, these activities are generally necessary to provide the service you request, comply with legal obligations, or pursue our legitimate interests in operating and securing BetaManuscript. Where consent is required for a particular activity, we will rely on it and you may withdraw it at any time.</p>
      </LegalSection>

      <LegalSection title="4. Service providers and disclosures">
        <p>We use carefully selected providers to operate BetaManuscript. Depending on the feature you use, these include Supabase for authentication, database and file storage; Resend for transactional email; Stripe for payment processing; Vercel for hosting and site analytics; and PostHog for product analytics when configured.</p>
        <p>We give providers only the data needed to perform their services. We do not sell personal data or use manuscripts and feedback to train public AI models.</p>
      </LegalSection>

      <LegalSection title="5. Cookies and similar technology">
        <p>We use essential cookies and local storage to maintain authentication and core product functionality. We may also use analytics technology to understand how the site and product are used. You can manage or delete browser storage through your browser settings; disabling essential technology may prevent parts of the service from working.</p>
        <p>Where applicable law requires consent before a non-essential technology is used, we will request it before setting that technology.</p>
      </LegalSection>

      <LegalSection title="6. Retention and international transfers">
        <p>We keep personal data for as long as needed to provide the service, maintain required records, resolve disputes, and meet legal obligations. Workspace content is normally retained while the relevant account remains active. We may keep limited information for a longer period where necessary for security, fraud prevention, or legal compliance.</p>
        <p>Our providers may process data in countries outside your country of residence. When a transfer is subject to applicable data-protection law, we use the safeguards required for that transfer, such as an adequacy decision or contractual protections.</p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>Depending on where you live, you may have rights to access, correct, delete, restrict, or port your personal data; object to certain processing; and withdraw consent where processing is based on consent. You may also lodge a complaint with your local data-protection authority.</p>
        <p>To make a request, email <a className="underline decoration-1 underline-offset-4 hover:text-[#7b1d1d]" href="mailto:support@betamanuscript.com">support@betamanuscript.com</a>. We may need to verify your identity before responding.</p>
      </LegalSection>

      <LegalSection title="8. Security and changes">
        <p>We use technical and organisational measures designed to protect data, including authenticated access controls and restricted manuscript sharing. No method of transmission or storage is completely secure, so please use a strong, unique password and keep account access private.</p>
        <p>We may update this policy as the service or applicable law changes. The latest version will always be available on this page with its update date.</p>
      </LegalSection>
    </LegalPage>
  );
}
