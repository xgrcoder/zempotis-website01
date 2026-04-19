export const metadata = {
  title: "Terms & Conditions",
};

const disclaimer = (
  <div
    style={{
      padding: "1rem 1.25rem",
      background: "rgba(37,99,235,0.04)",
      border: "1px solid rgba(37,99,235,0.12)",
      borderLeft: "3px solid var(--blue-600)",
      borderRadius: "var(--radius-md)",
      marginBottom: "2.5rem",
    }}
  >
    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--slate-600)" }}>
      <strong style={{ color: "var(--navy-800)" }}>Please note:</strong> This
      policy is provided in good faith. For specific legal advice tailored to
      your situation, please consult a qualified solicitor.
    </p>
  </div>
);

export default function TermsPage() {
  return (
    <article>
      <p style={{ fontSize: "0.825rem", color: "var(--slate-500)", marginBottom: "1.5rem" }}>
        Last updated: 19 April 2026
      </p>

      {disclaimer}

      <h2>1. Introduction and Acceptance</h2>
      <p>
        These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of the
        Zempotis Ltd website and the services we provide. By accessing our
        website or engaging our services, you agree to be bound by these Terms.
        If you do not agree, please do not use our website or services.
      </p>
      <p>
        Please read these Terms carefully before proceeding. If you have any
        questions, contact us at{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a> before
        engaging our services.
      </p>

      <h2>2. Who We Are</h2>
      <p>
        Zempotis Ltd (&ldquo;Zempotis&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a company registered in
        England and Wales. Our contact email is{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>.
      </p>

      <h2>3. Services We Provide</h2>
      <p>
        Zempotis provides digital services to businesses, including but not
        limited to:
      </p>
      <ul>
        <li>Business website design and development</li>
        <li>AI chatbot implementation and ongoing management</li>
        <li>AI inbound call handler setup and management</li>
        <li>Custom software and internal systems development</li>
        <li>Customer support system setup and management</li>
      </ul>
      <p>
        The scope, specification, deliverables, and timeline for each
        engagement are agreed in writing prior to commencement of work. Nothing
        in these Terms constitutes an offer to provide services; a separate
        written agreement is required.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>
        You agree to use our website and services only for lawful purposes. You
        must not:
      </p>
      <ul>
        <li>
          Use our services to engage in any unlawful, fraudulent, or harmful
          activity
        </li>
        <li>
          Attempt to gain unauthorised access to our systems, data, or those of
          our other clients
        </li>
        <li>
          Use our services to transmit unsolicited communications, malware, or
          harmful content
        </li>
        <li>
          Infringe the intellectual property rights of Zempotis or any third
          party
        </li>
        <li>
          Misrepresent your identity or affiliation when engaging our services
        </li>
        <li>
          Attempt to reverse-engineer, copy, or resell any deliverable or
          system we build without prior written consent
        </li>
      </ul>
      <p>
        We reserve the right to suspend or terminate services immediately if we
        reasonably believe you are in breach of this section.
      </p>

      <h2>5. Intellectual Property</h2>
      <p>Unless otherwise agreed in writing:</p>
      <ul>
        <li>
          All intellectual property in our website — including design, content,
          and code — belongs to Zempotis Ltd or its licensors
        </li>
        <li>
          Upon full payment for a completed project, you receive a licence to
          use the deliverables for your own business purposes
        </li>
        <li>
          Any third-party components, frameworks, or open-source libraries
          included in a project remain subject to their respective licences
        </li>
        <li>
          Zempotis retains the right to reference completed work in our
          portfolio and marketing materials unless you request otherwise in
          writing before project commencement
        </li>
        <li>
          Content, data, and materials you provide to us remain your property;
          you grant us a limited licence to use them solely for delivering the
          agreed services
        </li>
      </ul>

      <h2>6. Payment Terms</h2>

      <h3>6.1 Monthly subscriptions</h3>
      <p>
        Our services are available on monthly subscription plans. Fees are
        charged monthly in advance. Pricing is as published on our website at
        the time of written agreement. Current plans are Starter, Pro, and
        Enterprise.
      </p>

      <h3>6.2 Cancellation</h3>
      <p>
        You may cancel your subscription at any time by providing written
        notice to{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>.
        Cancellation takes effect at the end of the current billing period. We
        do not offer refunds for partial months or for services already
        delivered.
      </p>

      <h3>6.3 Late payment</h3>
      <p>
        We reserve the right to suspend services in the event of non-payment
        after [X days&apos;] written notice. We may charge interest on
        overdue amounts in accordance with the Late Payment of Commercial Debts
        (Interest) Act 1998.
      </p>

      <h3>6.4 Price changes</h3>
      <p>
        We may amend our pricing with [30 days&apos;] written notice. If you
        do not wish to continue at the revised price, you may cancel your
        subscription in accordance with section 6.2.
      </p>

      <h2>7. Client Responsibilities</h2>
      <p>You agree to:</p>
      <ul>
        <li>
          Provide accurate, complete, and timely information necessary for us
          to deliver the agreed services
        </li>
        <li>
          Respond to requests for approval, content, or feedback within agreed
          timescales; delays caused by your failure to respond may affect
          delivery timelines and costs
        </li>
        <li>
          Ensure you hold all necessary rights to any content, images, data, or
          materials you provide to us
        </li>
        <li>
          Not provide content that is unlawful, defamatory, obscene, or
          infringes any third-party rights
        </li>
        <li>
          Keep any login credentials, API keys, or access tokens we provide to
          you secure and confidential
        </li>
        <li>
          Review and test any deliverables promptly and notify us of defects
          within a reasonable period of delivery
        </li>
      </ul>

      <h2>8. Our Liability and Limitations</h2>
      <p>
        8.1 Our total aggregate liability to you for any loss or damage arising
        in connection with our services — whether in contract, tort (including
        negligence), or otherwise — shall not exceed the total fees paid by you
        in the [12] months immediately preceding the event giving rise to the
        claim.
      </p>
      <p>
        8.2 Subject to clause 8.3, we are not liable for:
      </p>
      <ul>
        <li>Indirect, consequential, or special loss</li>
        <li>Loss of profits, revenue, or anticipated savings</li>
        <li>Loss or corruption of data or information</li>
        <li>
          Damage caused by your failure to meet your responsibilities under
          section 7
        </li>
        <li>
          Any failure or disruption caused by third-party service providers,
          including but not limited to hosting providers, AI platforms, payment
          processors, or communication services
        </li>
        <li>
          Inaccuracies or errors in AI-generated content or outputs produced by
          systems we build on your behalf (AI outputs are probabilistic in
          nature and must be reviewed before being relied upon)
        </li>
      </ul>
      <p>
        8.3 Nothing in these Terms limits or excludes our liability for death
        or personal injury caused by our negligence, fraud or fraudulent
        misrepresentation, or any other liability that cannot lawfully be
        excluded or limited under English law.
      </p>

      <h2>9. Warranties and Disclaimers</h2>
      <p>
        We warrant that we will provide our services with reasonable care and
        skill in accordance with good industry practice.
      </p>
      <p>We do not warrant that:</p>
      <ul>
        <li>
          Our services will be uninterrupted, error-free, or entirely free from
          security vulnerabilities
        </li>
        <li>
          AI tools and automated systems will be completely accurate at all
          times — AI outputs are inherently probabilistic and should be reviewed
          by you before being acted upon
        </li>
        <li>
          Any specific business outcomes (such as increased sales or search
          rankings) will result from the use of our services
        </li>
      </ul>
      <p>
        Our website and any information on it are provided &ldquo;as is&rdquo;,
        without warranty of any kind beyond what is required by law.
      </p>

      <h2>10. Termination</h2>
      <p>
        10.1 Either party may terminate a services agreement at any time by
        giving [30 days&apos;] written notice to the other party.
      </p>
      <p>10.2 We may terminate immediately, without notice, if:</p>
      <ul>
        <li>
          You materially breach these Terms and fail to remedy the breach within
          [14 days] of written notice from us
        </li>
        <li>
          You become insolvent, enter administration, or have a liquidator or
          administrator appointed
        </li>
        <li>
          We reasonably believe that continued performance of the services would
          expose us to legal, regulatory, or reputational risk
        </li>
      </ul>
      <p>
        10.3 On termination for any reason, all outstanding fees for work
        completed or subscriptions due shall become immediately payable.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of
        England and Wales. Both parties submit to the exclusive jurisdiction of
        the courts of England and Wales for the resolution of any dispute.
      </p>

      <h2>12. Disputes</h2>
      <p>
        We encourage you to contact us in the first instance at{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a> if you
        have any concerns. We will endeavour to resolve all disputes fairly and
        promptly. If a resolution cannot be reached informally, the matter shall
        be referred to the courts of England and Wales as set out in section 11.
      </p>

      <h2>13. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        communicated to existing clients with reasonable notice. Continued use
        of our services after the effective date of any changes constitutes
        acceptance of the updated Terms. The current version of these Terms is
        always available on this page.
      </p>

      <h2>14. Contact Details</h2>
      <p>
        For questions about these Terms or any aspect of your engagement with
        us, please contact:
      </p>
      <ul>
        <li>
          <strong>Company:</strong> Zempotis Ltd
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>
        </li>
      </ul>
    </article>
  );
}
