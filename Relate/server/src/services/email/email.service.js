'use strict';

const AGENTMAIL_API_URL = 'https://api.agentmail.to/v0';

/* =========================================================
   RELATE EMAIL — HTML
========================================================= */

function composeResetEmailHtml(resetUrl) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Reset Your Relate Password</title>

  <style>
    @media only screen and (max-width: 620px) {
      .email-shell {
        padding: 20px 12px !important;
      }

      .main-card {
        width: 100% !important;
      }

      .content {
        padding: 34px 24px !important;
      }

      .headline {
        font-size: 42px !important;
        line-height: 0.95 !important;
      }

      .intro {
        font-size: 16px !important;
      }

      .reset-button {
        display: block !important;
        width: auto !important;
      }
    }
  </style>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3eadb;
    font-family:Arial, Helvetica, sans-serif;
    color:#071a38;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f3eadb;"
  >
    <tr>
      <td
        align="center"
        class="email-shell"
        style="padding:42px 18px;"
      >

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          class="main-card"
          style="
            width:600px;
            max-width:600px;
            background:#fffaf1;
            border:3px solid #071a38;
            border-radius:24px;
            overflow:hidden;
            box-shadow:8px 8px 0 #071a38;
          "
        >

          <!-- TOP ART AREA -->

          <tr>
            <td
              style="
                padding:28px 30px 22px;
                background:#5424c7;
                border-bottom:3px solid #071a38;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    valign="middle"
                    style="
                      font-family:Arial, Helvetica, sans-serif;
                      font-size:24px;
                      font-weight:900;
                      letter-spacing:-1px;
                      color:#fffaf1;
                    "
                  >
                    RELATE<span style="color:#ffd65a;">.</span>
                  </td>

                  <td
                    align="right"
                    valign="middle"
                  >

                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>

                        <td
                          style="
                            width:18px;
                            height:18px;
                            background:#ffd65a;
                            border:2px solid #071a38;
                            border-radius:50%;
                          "
                        >
                          &nbsp;
                        </td>

                        <td style="width:10px;">
                          &nbsp;
                        </td>

                        <td
                          style="
                            width:16px;
                            height:16px;
                            background:#ff8068;
                            border:2px solid #071a38;
                            border-radius:4px;
                          "
                        >
                          &nbsp;
                        </td>

                        <td style="width:10px;">
                          &nbsp;
                        </td>

                        <td
                          style="
                            width:20px;
                            height:20px;
                            background:#55c9c1;
                            border:2px solid #071a38;
                            border-radius:50%;
                          "
                        >
                          &nbsp;
                        </td>

                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <div
                style="
                  margin-top:24px;
                  font-size:11px;
                  line-height:1;
                  font-weight:800;
                  letter-spacing:2px;
                  text-transform:uppercase;
                  color:#ffd65a;
                "
              >
                YOUR LEARNING SPACE
              </div>

            </td>
          </tr>


          <!-- MAIN CONTENT -->

          <tr>
            <td
              class="content"
              style="
                padding:48px 48px 42px;
              "
            >

              <div
                style="
                  display:inline-block;
                  padding:7px 11px;
                  margin-bottom:22px;
                  background:#ffd65a;
                  border:2px solid #071a38;
                  border-radius:999px;
                  font-size:11px;
                  font-weight:900;
                  letter-spacing:1px;
                  text-transform:uppercase;
                "
              >
                Password Reset
              </div>


              <div
                class="headline"
                style="
                  font-family:Georgia, 'Times New Roman', serif;
                  font-size:54px;
                  line-height:0.94;
                  font-weight:700;
                  letter-spacing:-2.5px;
                  color:#071a38;
                  margin-bottom:24px;
                "
              >
                Let's get<br />
                you back <span style="color:#5424c7;">in.</span>
              </div>


              <div
                class="intro"
                style="
                  font-size:17px;
                  line-height:1.65;
                  color:#34445b;
                  margin-bottom:28px;
                "
              >
                Someone requested a password reset for your
                <strong style="color:#071a38;">Relate</strong>
                account.
                No worries — it happens.
              </div>


              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-bottom:30px;"
              >
                <tr>
                  <td
                    style="
                      padding:18px 20px;
                      background:#f7efe2;
                      border:2px dashed #53677c;
                      border-radius:14px;
                      font-size:14px;
                      line-height:1.55;
                      color:#53677c;
                    "
                  >
                    <strong style="color:#071a38;">
                      ✦ Quick note
                    </strong>
                    <br />
                    This link will work for
                    <strong style="color:#071a38;">
                      1 hour
                    </strong>.
                    After that, you'll need to request a new one.
                  </td>
                </tr>
              </table>


              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-bottom:34px;"
              >
                <tr>
                  <td
                    class="reset-button"
                    style="
                      background:#071a38;
                      border:3px solid #071a38;
                      border-radius:13px;
                      box-shadow:5px 5px 0 #5424c7;
                    "
                  >

                    <a
                      href="${resetUrl}"
                      style="
                        display:inline-block;
                        padding:16px 25px;
                        color:#fffaf1;
                        text-decoration:none;
                        font-size:15px;
                        line-height:1;
                        font-weight:900;
                        letter-spacing:.2px;
                      "
                    >
                      Reset my password&nbsp; →
                    </a>

                  </td>
                </tr>
              </table>


              <div
                style="
                  font-size:12px;
                  line-height:1.6;
                  color:#6d7787;
                "
              >
                If the button doesn't work, copy and paste this link
                into your browser:
              </div>

              <div
                style="
                  margin-top:8px;
                  padding:12px 14px;
                  background:#f7efe2;
                  border-radius:9px;
                  font-size:11px;
                  line-height:1.5;
                  color:#53677c;
                  word-break:break-all;
                  overflow-wrap:anywhere;
                "
              >
                ${resetUrl}
              </div>

            </td>
          </tr>


          <!-- BOTTOM VISUAL STRIP -->

          <tr>
            <td
              style="
                padding:0;
                border-top:3px solid #071a38;
                background:#ff8068;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>

                  <td
                    width="18%"
                    style="
                      height:12px;
                      background:#ffd65a;
                      border-right:3px solid #071a38;
                    "
                  >
                    &nbsp;
                  </td>

                  <td
                    width="42%"
                    style="
                      height:12px;
                      background:#5424c7;
                      border-right:3px solid #071a38;
                    "
                  >
                    &nbsp;
                  </td>

                  <td
                    width="40%"
                    style="
                      height:12px;
                      background:#55c9c1;
                    "
                  >
                    &nbsp;
                  </td>

                </tr>
              </table>

            </td>
          </tr>

        </table>


        <!-- FOOTER -->

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:600px;
            max-width:600px;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding:28px 20px 8px;
                font-size:12px;
                line-height:1.6;
                color:#687386;
              "
            >
              You received this email because a password reset
              was requested for your Relate account.
              <br />
              If you didn't request this, you can safely ignore it.
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="
                padding:8px 20px 20px;
                font-size:11px;
                font-weight:700;
                letter-spacing:1px;
                color:#9a8f82;
              "
            >
              RELATE · LEARN DIFFERENTLY
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}


/* =========================================================
   PLAIN TEXT VERSION
========================================================= */

function composeResetEmailText(resetUrl) {
  return `
RELATE.
LEARN DIFFERENTLY.

PASSWORD RESET

Let's get you back in.

Someone requested a password reset for your Relate account.

This reset link will work for 1 hour.

Reset your password:
${resetUrl}

If you didn't request this password reset, you can safely ignore this email.

— Relate
  `.trim();
}


/* =========================================================
   AGENTMAIL SEND
========================================================= */

async function sendViaAgentMail({
  to,
  subject,
  text,
  html,
}) {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  const inboxId = process.env.AGENTMAIL_INBOX_ID;

  if (!apiKey || !inboxId) {
    throw new Error(
      'AgentMail configuration is missing'
    );
  }

  const response = await fetch(
    `${AGENTMAIL_API_URL}/inboxes/${encodeURIComponent(
      inboxId
    )}/messages/send`,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        to,
        subject,
        text,
        html,
      }),
    }
  );

  if (!response.ok) {
    let errorMessage =
      `AgentMail request failed with status ${response.status}`;

    try {
      const errorBody = await response.text()

  console.error('[AgentMail] Send failed:', {
    status: response.status,
    body: errorBody,
  })

  throw new Error(
    `AgentMail request failed with status ${response.status}: ${errorBody}`
  )
    } catch {
      // Ignore invalid/non-JSON error response.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}


/* =========================================================
   SEND PASSWORD RESET EMAIL
========================================================= */

async function sendPasswordResetEmail({
  to,
  resetUrl,
}) {
  if (!to || !resetUrl) {
    throw new Error(
      'Email recipient and reset URL are required'
    );
  }

  try {
    const result = await sendViaAgentMail({
      to,
      subject: 'Reset Your Relate Password',
      text: composeResetEmailText(resetUrl),
      html: composeResetEmailHtml(resetUrl),
    });

    console.log(
      `[EmailService] Password reset email sent to: ${to}`
    );

    return result;
  } catch (error) {
    console.error(
      `[EmailService] Failed to send password reset email to ${to}: ${error.message}`
    );

    throw new Error(
      'Email could not be sent. Please try again later.'
    );
  }
}


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  sendPasswordResetEmail,
};