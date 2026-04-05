function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function getNotificationEmailHtml(message: string): string {
  const safeMessage = escapeHtml(message)
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#2e4a42; font-family:Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#2e4a42; margin:0; padding:40px 0;">
      <tr>
        <td align="center">

          <!-- Email Card -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background-color:#3d5c53; border-radius:12px; overflow:hidden;">

            <!-- Header -->
            <tr>
              <td align="center" style="padding:30px 20px; background-color:#3d5c53;">
                
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>

                    <!-- Logo -->
                    <td valign="middle" style="vertical-align:middle;">
                      <img 
                        src="https://www.yournextstep.me/Nextstep_logo.png" 
                        width="78"
                        alt="NextStep Logo"
                        style="display:block; border:0; outline:none; text-decoration:none; margin-right:-14px;"
                      />
                    </td>

                    <!-- Brand Name -->
                    <td valign="middle" style="vertical-align:middle;">
                      <span style="
                        color:#ffffff;
                        font-size:28px;
                        font-weight:bold;
                        font-family:Arial, sans-serif;
                        line-height:1;
                      ">
                        NextStep
                      </span>
                    </td>

                  </tr>
                </table>

              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td align="center" style="padding:10px 30px 0 30px;">
                <h1 style="color:#ffffff; font-size:24px; margin:0; font-family:Arial, sans-serif;">
                  New Notification from NextStep 🔔
                </h1>
              </td>
            </tr>

            <!-- Subtitle -->
            <tr>
              <td align="center" style="padding:15px 30px 10px 30px;">
                <p style="color:#b0c4bd; font-size:16px; line-height:1.7; margin:0; font-family:Arial, sans-serif;">
                  Hello there,<br />
                  You have a new update regarding your college admission journey.
                </p>
              </td>
            </tr>

            <!-- Notification Message Box -->
            <tr>
              <td align="center" style="padding:25px 30px 20px 30px;">
                <table cellpadding="0" cellspacing="0" border="0" style="background-color:#2e4a42; border:1px solid #50786d; border-radius:12px; width: 100%;">
                  <tr>
                    <td align="center" style="padding:24px 32px;">
                      <p style="
                        color:#b3cdc5;
                        font-size:18px;
                        font-weight:500;
                        line-height:1.5;
                        margin:0;
                        font-family:Arial, sans-serif;
                      ">
                        ${safeMessage}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA / Action Info -->
            <tr>
              <td align="center" style="padding:0 30px 20px 30px;">
                <p style="color:#8ca79d; font-size:14px; line-height:1.6; margin:0; font-family:Arial, sans-serif; padding-bottom: 20px;">
                  Please log in to your dashboard to view more details.
                </p>
                <a href="https://yournextstep.me/dashboard" style="display:inline-block; padding:12px 24px; background-color:#50786d; color:#ffffff; text-decoration:none; font-size:15px; font-weight:bold; border-radius:6px; font-family:Arial, sans-serif;">
                  Go to Dashboard
                </a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:30px 30px 0 30px;">
                <hr style="border:none; border-top:1px solid #50786d; margin:0;" />
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:20px 30px 30px 30px;">
                <p style="color:#6b8f83; font-size:13px; line-height:1.5; margin:0 0 8px 0; font-family:Arial, sans-serif;">
                  If you didn’t request this notification, please contact support.
                </p>
                <p style="color:#6b8f83; font-size:12px; line-height:1.5; margin:0; font-family:Arial, sans-serif;">
                  © ${new Date().getFullYear()} NextStep. All rights reserved.<br/>
                  <a href="mailto:hello.yournextstep@gmail.com" style="color:#6b8f83; text-decoration:none;">hello.yournextstep@gmail.com</a>
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
</html>
  `
}
