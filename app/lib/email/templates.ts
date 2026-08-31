/**
 * Premium Responsive HTML Email Templates
 */

export interface WelcomeTemplateProps {
  userName: string;
  companyName?: string;
  docUrl?: string;
}

export interface StorageWarningTemplateProps {
  userName: string;
  storageUsedMB: number;
  storageLimitMB: number;
  usedPercentage: number;
  dashboardUrl?: string;
}

export interface SubscriptionDueTemplateProps {
  userName: string;
  daysRemaining: number;
  renewalDate: string;
  planName: string;
  billingUrl?: string;
}

export interface ForgotPasswordOtpTemplateProps {
  userName: string;
  otpCode: string;
  expiresInMinutes?: number;
}

export interface SignupOtpTemplateProps {
  userName: string;
  otpCode: string;
  expiresInMinutes?: number;
}

export interface PaymentReceiptTemplateProps {
  userName: string;
  planName: string;
  amountFormatted: string;
  reference: string;
  transactionDate: string;
  storageLimitMB: number;
}

// Global Brand Styles
const BRAND_COLOR = "#C9A96E";
const BG_DARK = "#1A1A1A";
const TEXT_LIGHT = "#F5F0EB";

/**
 * 1. Welcome Email Template
 * From: Aimuan Thankgod, Founder of cimessinvest
 */
export function getWelcomeEmailHtml({
  userName,
  companyName = "Cimessinvest",
  docUrl = "https://cimessinvest.com/doc",
}: WelcomeTemplateProps): { subject: string; html: string } {
  const subject = `Welcome to the Platform, ${userName}!`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border: 1px solid rgba(201, 169, 110, 0.3); border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #111111; padding: 30px; text-align: center; border-bottom: 1px solid rgba(201, 169, 110, 0.2);">
              <span style="color: ${BRAND_COLOR}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: 8px;">CIMESSINVEST PLATFORM</span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 24px; font-weight: 700; margin: 0;">Welcome to Next-Gen Fashion Commerce</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                I Aimuan ThankGOD, Founder and CEO of cimessinvest, am thrilled to personally welcome you to our platform on behalf of <strong>${companyName}</strong>.
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Our platform is engineered to transform how luxury brands, bespoke tailors, and fashion houses showcase their collections. We provide lightning-fast Cloud CDN asset delivery, dynamic theme engines, and streamlined digital cataloging designed to maximize your brand&rsquo;s global presence and revenue growth.
              </p>

              <div style="background-color: #1A1A1A; border-left: 3px solid ${BRAND_COLOR}; padding: 18px; margin: 25px 0; border-radius: 0 6px 6px 0;">
                <p style="margin: 0; font-size: 14px; color: ${TEXT_LIGHT}; line-height: 1.5;">
                  &ldquo;Our mission at <strong>cimessinvest</strong> is to empower creators and luxury artisans with world-class digital infrastructure to scale effortlessly.&rdquo;
                </p>
              </div>

              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Explore our full feature documentation and integration guide to start elevating your store:
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: ${BRAND_COLOR};">
                    <a href="${docUrl}" target="_blank" style="font-size: 13px; font-weight: bold; color: #1A1A1A; text-decoration: none; padding: 14px 28px; display: inline-block; letter-spacing: 1.5px; text-transform: uppercase;">
                      Read Platform Documentation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Founder Signature -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 25px; margin-top: 30px;">
                <p style="font-size: 15px; font-weight: bold; color: ${TEXT_LIGHT}; margin: 0 0 4px 0;">Aimuan Thankgod</p>
                <p style="font-size: 13px; color: ${BRAND_COLOR}; margin: 0;">Founder & CEO, cimessinvest</p>
                <p style="font-size: 12px; color: #A09585; margin: 4px 0 0 0;">Website: <a href="https://cimessinvest.com" style="color: ${BRAND_COLOR}; text-decoration: none;">cimessinvest.com</a></p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #161616; padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * 2. Storage 80% Capacity Alert Template
 */
export function getStorageWarningEmailHtml({
  userName,
  storageUsedMB,
  storageLimitMB,
  usedPercentage,
  dashboardUrl = "https://cimessinvest.com/dashboard",
}: StorageWarningTemplateProps): { subject: string; html: string } {
  const subject = `⚠️ Action Required: Storage Capacity at ${usedPercentage}%`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #261E0A; padding: 25px 30px; border-bottom: 1px solid rgba(234, 179, 8, 0.3);">
              <span style="color: #EAB308; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">STORAGE QUOTA ALERT</span>
              <h1 style="color: #FDE047; font-size: 22px; font-weight: 700; margin: 6px 0 0 0;">Your Storage is 80% Full</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Your account storage has reached <strong>${usedPercentage}%</strong> capacity. You have used <strong>${storageUsedMB} MB</strong> out of your <strong>${storageLimitMB} MB</strong> limit.
              </p>

              <!-- Progress Visual -->
              <div style="background-color: #141414; padding: 20px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #E0D5C9; margin-bottom: 8px;">
                  <span>Used: <strong>${storageUsedMB} MB</strong></span>
                  <span>Limit: <strong>${storageLimitMB} MB</strong></span>
                </div>
                <div style="background-color: #333333; height: 12px; border-radius: 6px; overflow: hidden;">
                  <div style="background-color: #EAB308; width: ${Math.min(100, usedPercentage)}%; height: 100%;"></div>
                </div>
              </div>

              <p style="font-size: 14px; line-height: 1.6; color: #E0D5C9;">
                To avoid any disruption when uploading new high-resolution images or videos, consider upgrading your plan or removing unused media assets from your dashboard.
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #EAB308;">
                    <a href="${dashboardUrl}" target="_blank" style="font-size: 13px; font-weight: bold; color: #1A1A1A; text-decoration: none; padding: 12px 24px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
                      Manage Storage & Upgrade &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #999999; margin-top: 30px;">Best regards,<br><strong>cimessinvest Operations Team</strong></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest. Storage Notification System.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * 3. Subscription Expiry Warning Template (1 Week Due or Due Today)
 */
export function getSubscriptionDueEmailHtml({
  userName,
  daysRemaining,
  renewalDate,
  planName,
  billingUrl = "https://cimessinvest.com/dashboard/billing",
}: SubscriptionDueTemplateProps): { subject: string; html: string } {
  const isDueToday = daysRemaining <= 0;
  const subject = isDueToday
    ? `🔴 Urgent: Your ${planName} Subscription is Due Today`
    : `⏳ Reminder: Your ${planName} Subscription is Due in ${daysRemaining} Days`;

  const bannerBg = isDueToday ? "#3B0707" : "#1E1B0E";
  const borderCol = isDueToday ? "rgba(239, 68, 68, 0.5)" : "rgba(201, 169, 110, 0.4)";
  const titleCol = isDueToday ? "#EF4444" : BRAND_COLOR;
  const buttonBg = isDueToday ? "#EF4444" : BRAND_COLOR;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border: 1px solid ${borderCol}; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${bannerBg}; padding: 25px 30px; border-bottom: 1px solid ${borderCol};">
              <span style="color: ${titleCol}; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">SUBSCRIPTION BILLING</span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 6px 0 0 0;">
                ${isDueToday ? "Subscription Due Today" : `Renewal Due in ${daysRemaining} Days`}
              </h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                ${
                  isDueToday
                    ? `Your <strong>${planName}</strong> plan subscription is due today (${renewalDate}). Please renew now to maintain uninterrupted access to your landing page settings and custom media storage.`
                    : `This is a friendly reminder that your <strong>${planName}</strong> plan subscription will renew on <strong>${renewalDate}</strong> (in ${daysRemaining} days).`
                }
              </p>

              <!-- Subscription Details Box -->
              <div style="background-color: #161616; padding: 18px; border-radius: 6px; border-left: 3px solid ${titleCol}; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #A09585;">Subscription Details:</p>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: ${TEXT_LIGHT};">Plan: <strong>${planName}</strong></p>
                <p style="margin: 0; font-size: 14px; color: ${TEXT_LIGHT};">Due Date: <strong>${renewalDate}</strong></p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 25px 0;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: ${buttonBg};">
                    <a href="${billingUrl}" target="_blank" style="font-size: 13px; font-weight: bold; color: #1A1A1A; text-decoration: none; padding: 12px 24px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
                      Renew Subscription Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #999999; margin-top: 25px;">
                Thank you for being a valued customer of <strong>cimessinvest</strong>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest Billing Services.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * 4. Forgot Password OTP Email Template
 */
export function getForgotPasswordOtpEmailHtml({
  userName,
  otpCode,
  expiresInMinutes = 15,
}: ForgotPasswordOtpTemplateProps): { subject: string; html: string } {
  const subject = `🔐 Password Reset Code: ${otpCode} | cimessinvest`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border: 1px solid rgba(201, 169, 110, 0.4); border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #111111; padding: 25px 30px; text-align: center; border-bottom: 1px solid rgba(201, 169, 110, 0.2);">
              <span style="color: ${BRAND_COLOR}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">SECURITY AUTHENTICATION</span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 6px 0 0 0;">Password Reset Request</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                We received a request to reset your password for your manager account. Use the 6-digit verification code below to authorize your password change:
              </p>

              <!-- OTP Code Display Box -->
              <div style="background-color: #111111; border: 1px border-style: dashed; border-color: ${BRAND_COLOR}; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
                <span style="color: #A09585; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 8px;">Your 6-Digit OTP Code</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: ${BRAND_COLOR}; letter-spacing: 8px;">${otpCode}</span>
                <span style="color: #888888; font-size: 12px; display: block; margin-top: 8px;">This code will expire in ${expiresInMinutes} minutes.</span>
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #999999;">
                If you did not request a password reset, please ignore this email or contact support immediately if you suspect unauthorized access.
              </p>

              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; margin-top: 30px;">
                <p style="font-size: 12px; color: #777777; margin: 0;">cimessinvest Security Team</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest. Security Services.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * 5. Platform Payment Invoice / Receipt Email Template
 */
export function getPaymentReceiptEmailHtml({
  userName,
  planName,
  amountFormatted,
  reference,
  transactionDate,
  storageLimitMB,
}: PaymentReceiptTemplateProps): { subject: string; html: string } {
  const subject = `🧾 Official Payment Receipt - ${reference} | cimessinvest`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border: 1px solid rgba(201, 169, 110, 0.4); border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #111111; padding: 25px 30px; border-bottom: 1px solid rgba(201, 169, 110, 0.2);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="color: ${BRAND_COLOR}; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">OFFICIAL INVOICE & RECEIPT</span>
                    <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 4px 0 0 0;">cimessinvest</h1>
                  </td>
                  <td align="right">
                    <span style="background-color: #064E3B; color: #34D399; font-size: 11px; font-weight: bold; padding: 6px 12px; border-radius: 4px; border: 1px solid #059669; letter-spacing: 1px;">PAID</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #E0D5C9;">
                Thank you for your payment! Your transaction was successfully processed. Here is your official payment receipt and plan confirmation:
              </p>

              <!-- Invoice Table Details -->
              <div style="background-color: #161616; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 20px; margin: 20px 0;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #E0D5C9;">
                  <tr>
                    <td style="padding: 8px 0; color: #A09585;">Transaction Ref:</td>
                    <td align="right" style="padding: 8px 0; font-family: monospace; font-weight: bold; color: ${BRAND_COLOR};">${reference}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #A09585;">Date & Time:</td>
                    <td align="right" style="padding: 8px 0; color: ${TEXT_LIGHT};">${transactionDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #A09585;">Activated Plan:</td>
                    <td align="right" style="padding: 8px 0; font-weight: bold; color: ${TEXT_LIGHT}; uppercase;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #A09585;">Storage Capacity Granted:</td>
                    <td align="right" style="padding: 8px 0; font-weight: bold; color: #34D399;">${storageLimitMB} MB</td>
                  </tr>
                  <tr style="border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 12px 0 0 0; font-size: 15px; font-weight: bold; color: ${TEXT_LIGHT};">Total Paid:</td>
                    <td align="right" style="padding: 12px 0 0 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLOR};">${amountFormatted}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #A09585;">
                Your subscription status is now <strong>ACTIVE</strong> and your custom media catalog has been unlocked.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest Billing Services. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * 6. Signup Email Verification OTP Template
 */
export function getSignupOtpEmailHtml({
  userName,
  otpCode,
  expiresInMinutes = 15,
}: SignupOtpTemplateProps): { subject: string; html: string } {
  const subject = `✨ Email Verification Code: ${otpCode} | Ti Stiches`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border: 1px solid rgba(201, 169, 110, 0.4); border-radius: 8px; overflow: hidden; max-width: 600px;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #111111; padding: 25px 30px; text-align: center; border-bottom: 1px solid rgba(201, 169, 110, 0.2);">
              <span style="color: ${BRAND_COLOR}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">WELCOME TO TI STICHES</span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 6px 0 0 0;">Verify Your Email Address</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Thank you for creating an account with Ti Stiches. Use the 6-digit verification OTP code below to complete your client profile setup:
              </p>

              <!-- OTP Code Display Box -->
              <div style="background-color: #111111; border: 1px dashed ${BRAND_COLOR}; padding: 25px; text-align: center; margin: 25px 0; border-radius: 8px;">
                <span style="color: #A09585; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 8px;">Your Verification OTP Code</span>
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; color: ${BRAND_COLOR}; letter-spacing: 8px;">${otpCode}</span>
                <span style="color: #888888; font-size: 12px; display: block; margin-top: 8px;">This code will expire in ${expiresInMinutes} minutes.</span>
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #999999;">
                If you did not initiate this registration, please ignore this email.
              </p>

              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; margin-top: 30px;">
                <p style="font-size: 12px; color: #777777; margin: 0;">Ti Stiches Client Experience Team</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} Ti Stiches Atelier. All Rights Reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html };
}

