export const metadata = {
  title: "Cookie Policy",
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

export default function CookiesPage() {
  return (
    <article>
      <p style={{ fontSize: "0.825rem", color: "var(--slate-500)", marginBottom: "1.5rem" }}>
        Last updated: 19 April 2026
      </p>

      {disclaimer}

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device (computer,
        smartphone, or tablet) when you visit a website. They are widely used
        to make websites work efficiently, to remember your preferences, and to
        provide information to website owners about how their site is being
        used.
      </p>
      <p>
        Cookies set by the website operator are called &ldquo;first-party
        cookies&rdquo;. Cookies set by parties other than the website operator
        are called &ldquo;third-party cookies&rdquo;.
      </p>

      <h2>2. How We Use Cookies</h2>
      <p>We use cookies to:</p>
      <ul>
        <li>Ensure our website functions correctly for all visitors</li>
        <li>
          Understand how visitors use our website, so we can improve their
          experience
        </li>
        <li>
          Maintain the state of certain features, such as our chatbot widget,
          during your visit
        </li>
      </ul>
      <p>
        We do not use cookies to serve targeted or behavioural advertising, and
        we do not sell cookie data to third parties.
      </p>

      <h2>3. Types of Cookies We Use</h2>

      <h3>3.1 Strictly necessary cookies</h3>
      <p>
        These cookies are essential for our website to function and cannot be
        switched off in our systems. They are typically set only in response to
        actions you take, such as submitting a form. Without these cookies,
        certain parts of our website would not work. No consent is required for
        strictly necessary cookies under the Privacy and Electronic
        Communications Regulations (PECR).
      </p>

      <h3>3.2 Analytics cookies</h3>
      <p>
        These cookies allow us to count visits and measure how visitors move
        around our website. All information collected is aggregated and
        anonymised — it does not directly identify individual users. We use
        this data to improve how our website performs and what content we
        provide. These cookies require your consent under PECR.
      </p>

      <h3>3.3 Functional cookies</h3>
      <p>
        These cookies enable enhanced functionality and personalisation, such
        as maintaining the state of a chat session during your visit. They may
        be set by us or by third-party providers whose services we have added
        to our pages.
      </p>

      <h2>4. Specific Cookies in Use</h2>
      <p>
        The following cookies are currently set when you visit our website:
      </p>
      <div className="legal-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cookie name</th>
              <th>Set by</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>_ga</td>
              <td>Google Analytics</td>
              <td>
                Distinguishes unique users for analytics reporting
              </td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>_gid</td>
              <td>Google Analytics</td>
              <td>
                Distinguishes users; resets each browser session
              </td>
              <td>24 hours</td>
            </tr>
            <tr>
              <td>_ga_[ID]</td>
              <td>Google Analytics</td>
              <td>Stores and updates a unique value for each page visit</td>
              <td>2 years</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        We may also set short-lived session cookies (which expire when you
        close your browser) for operational purposes such as maintaining form
        state or chatbot session continuity.
      </p>

      <h2>5. Third-Party Cookies</h2>
      <p>
        Some cookies on our website are set by third-party providers. We do not
        control these cookies and recommend you review each provider&apos;s
        privacy and cookie policy for full details.
      </p>
      <ul>
        <li>
          <strong>Google Analytics</strong> — used to measure website traffic
          and usage. Google may process analytics data in the United States
          under Standard Contractual Clauses. You can opt out of Google
          Analytics tracking by installing the Google Analytics opt-out browser
          add-on at{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            tools.google.com/dlpage/gaoptout
          </a>
          .
        </li>
        <li>
          <strong>AI chatbot widget</strong> — our website loads a third-party
          chatbot widget which may set functional cookies to maintain session
          continuity during a conversation. Please refer to that
          provider&apos;s privacy policy for full details [to be confirmed].
        </li>
      </ul>

      <h2>6. How to Control Cookies</h2>
      <p>
        You can control and manage cookies in several ways. Please note that
        disabling certain cookies may affect the functionality of our website.
      </p>

      <h3>6.1 Browser settings</h3>
      <p>
        Most browsers allow you to refuse new cookies, delete existing cookies,
        and be notified when a new cookie is set. Refer to your browser&apos;s
        help documentation for specific instructions:
      </p>
      <ul>
        <li>
          <strong>Google Chrome:</strong> Settings &rsaquo; Privacy and Security
          &rsaquo; Cookies and other site data
        </li>
        <li>
          <strong>Mozilla Firefox:</strong> Settings &rsaquo; Privacy &amp;
          Security &rsaquo; Cookies and Site Data
        </li>
        <li>
          <strong>Safari:</strong> Preferences &rsaquo; Privacy &rsaquo; Manage
          Website Data
        </li>
        <li>
          <strong>Microsoft Edge:</strong> Settings &rsaquo; Cookies and site
          permissions
        </li>
      </ul>

      <h3>6.2 Google Analytics opt-out</h3>
      <p>
        You can prevent Google Analytics from collecting data about your visits
        by installing the{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Analytics opt-out browser add-on
        </a>
        , which is available for all major browsers.
      </p>

      <h2>7. PECR Compliance</h2>
      <p>
        We are committed to complying with the Privacy and Electronic
        Communications Regulations (PECR) in conjunction with the UK GDPR.
        Under PECR, we obtain your consent before setting any non-essential
        cookies on your device. Strictly necessary cookies do not require
        consent and are exempt under PECR Regulation 6(4).
      </p>
      <p>
        Where consent is required, it must be freely given, specific, informed,
        and unambiguous. You may withdraw consent at any time by adjusting your
        browser settings as described in section 6.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes
        in the cookies we use or changes in applicable law. Any material
        updates will be reflected on this page with an updated &ldquo;Last
        updated&rdquo; date.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have any questions about our use of cookies or this policy,
        please contact:
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
