import { createPublicMetadata } from "@/shared/config/seo";
import { LegalList, LegalPage, LegalSection } from "@/views/legal/LegalPage";

export const metadata = createPublicMetadata({
  title: "Terms of Service | BetaManuscript",
  description: "The terms that govern use of the BetaManuscript beta-reader feedback workspace.",
  pathname: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      summary="These terms set the rules for using BetaManuscript as an author, invited reader, or account holder."
      lastUpdated="July 27, 2026"
    >
      <LegalSection title="1. Agreement to these terms">
        <p>By creating an account, accepting a reader invitation, or otherwise using BetaManuscript, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.</p>
      </LegalSection>

      <LegalSection title="2. The service">
        <p>BetaManuscript provides tools for authors to organise feedback from invited beta readers, including manuscript sharing, passage-level annotations, reader progress, and feedback collection. It is not an editorial, publishing, legal, or professional advice service.</p>
      </LegalSection>

      <LegalSection title="3. Accounts and invited readers">
        <LegalList>
          <li>You must provide accurate account information and keep your sign-in credentials secure.</li>
          <li>Authors are responsible for the people they invite and for having the right to share each manuscript and related material with them.</li>
          <li>Readers may access only manuscripts they have been invited to read. Readers must not copy, distribute, publish, or share a manuscript or invitation outside the author&apos;s intended reading group.</li>
          <li>You are responsible for activity carried out through your account unless you promptly notify us of unauthorised use.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Your content">
        <p>You retain ownership of the manuscripts, feedback, and other content you submit to BetaManuscript. You grant us a limited, non-exclusive right to host, process, reproduce, and display that content solely to operate, secure, and improve the service for you and the people you authorise.</p>
        <p>You represent that you have the rights needed to upload and share your content and that it does not infringe another person&apos;s rights, break the law, or contain harmful code.</p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>You must not misuse BetaManuscript. In particular, you must not:</p>
        <LegalList>
          <li>use the service to violate the law or another person&apos;s privacy, intellectual-property, or other rights;</li>
          <li>attempt to access accounts, manuscripts, or data without permission;</li>
          <li>interfere with the security, availability, or normal operation of the service;</li>
          <li>send unsolicited, deceptive, or abusive invitations or communications; or</li>
          <li>upload malware, harmful content, or material designed to disrupt the service.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="6. Paid plans and third-party services">
        <p>Where a paid plan is offered, the current price, billing period, and applicable purchase terms are shown before checkout. Payments are processed by Stripe, and you may also be subject to Stripe&apos;s terms. We do not receive or store your full payment-card details.</p>
      </LegalSection>

      <LegalSection title="7. Availability, suspension, and termination">
        <p>We work to keep BetaManuscript available, but the service may change, be interrupted, or be unavailable from time to time. We may suspend or end access where reasonably necessary to protect the service, comply with law, or address a breach of these terms. You may stop using the service at any time.</p>
      </LegalSection>

      <LegalSection title="8. Disclaimers and liability">
        <p>BetaManuscript is provided on an &ldquo;as available&rdquo; basis. To the fullest extent permitted by law, we do not guarantee uninterrupted availability, specific reader outcomes, publication outcomes, or that feedback will be accurate, useful, or complete.</p>
        <p>Nothing in these terms excludes liability that cannot lawfully be excluded. Subject to that limitation, we are not liable for indirect, incidental, special, consequential, or punitive losses arising from use of the service.</p>
      </LegalSection>

      <LegalSection title="9. Changes and contact">
        <p>We may update these terms when the service, our business, or applicable law changes. Material changes will be posted on this page with an updated date. Continuing to use BetaManuscript after an update means you accept the updated terms, where permitted by law.</p>
        <p>Questions about these terms can be sent to <a className="underline decoration-1 underline-offset-4 hover:text-[#7b1d1d]" href="mailto:support@betamanuscript.com">support@betamanuscript.com</a>.</p>
      </LegalSection>
    </LegalPage>
  );
}
