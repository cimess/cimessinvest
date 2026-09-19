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

export interface OrderPaidReceiptItem {
  name: string;
  quantity: number;
  priceNaira: number;
}

export interface OrderPaidReceiptTemplateProps {
  customerName?: string;
  customerEmail: string;
  customerPhone?: string;
  orderReference: string;
  invoiceNumber?: string | null;
  storeName: string;
  orderType: string;
  amountNaira: number;
  originalAmountNaira?: number | null;
  discountNaira?: number | null;
  shippingNaira?: number | null;
  items: OrderPaidReceiptItem[];
  notes?: string | null;
  paymentDate: string;
  checkoutUrl: string;
  whatsappNumber?: string | null;
}

// Global Brand Styles
const BRAND_COLOR = "#C9A96E";
const BG_DARK = "#1A1A1A";
const TEXT_LIGHT = "#F5F0EB";

/**
 * 1. Welcome Email Template
 * From: cimessinvest Team
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
              <h1 style="color: ${TEXT_LIGHT}; font-size: 24px; font-weight: 700; margin: 0;">Welcome to Next-Gen Commerce</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 35px 30px;">
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                The <strong>cimessinvest</strong> team is thrilled to welcome you to our multi-tenant commerce platform on behalf of <strong>${companyName}</strong>.
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Our platform is engineered to transform how luxury brands, bespoke tailors, gym studios, and merchants showcase their storefronts. We provide lightning-fast Cloud CDN asset delivery, dynamic Server-Driven UI templates, and streamlined digital cataloging designed to maximize your brand&rsquo;s presence and revenue growth.
              </p>

              <div style="background-color: #1A1A1A; border-left: 3px solid ${BRAND_COLOR}; padding: 18px; margin: 25px 0; border-radius: 0 6px 6px 0;">
                <p style="margin: 0; font-size: 14px; color: ${TEXT_LIGHT}; line-height: 1.5;">
                  &ldquo;Our mission at <strong>cimessinvest</strong> is to empower creators and merchants with world-class digital infrastructure to scale effortlessly.&rdquo;
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

              <!-- Platform Team Signature -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 25px; margin-top: 30px;">
                <p style="font-size: 15px; font-weight: bold; color: ${TEXT_LIGHT}; margin: 0 0 4px 0;">cimessinvest Team</p>
                <p style="font-size: 13px; color: ${BRAND_COLOR}; margin: 0;">Multi-Tenant Commerce Infrastructure</p>
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
  const subject = `✨ Email Verification Code: ${otpCode} | cimessinvest`;
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
              <span style="color: ${BRAND_COLOR}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">WELCOME TO CIMESSINVEST</span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 6px 0 0 0;">Verify Your Email Address</h1>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Thank you for creating an account with cimessinvest. Use the 6-digit verification OTP code below to complete your client profile setup:
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
                <p style="font-size: 12px; color: #777777; margin: 0;">cimessinvest Client Experience Team</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest. All Rights Reserved. (cimessinvest.com)</p>
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

export interface TrafficWarningTemplateProps {
  userName: string;
  monthlyVisits: number;
  trafficLimit: number;
  usedPercentage: number;
  planName?: string;
  upgradeUrl?: string;
}

/**
 * 7. Traffic Warning (80% Capacity Notice)
 */
export function getTrafficWarning80EmailHtml({
  userName,
  monthlyVisits,
  trafficLimit,
  usedPercentage,
  planName = "Current Tier",
  upgradeUrl = "https://cimessinvest.com/dashboard/payment",
}: TrafficWarningTemplateProps): { subject: string; html: string } {
  const subject = `⚠️ High Traffic Notice: Your atelier storefront reached ${usedPercentage}% monthly capacity | cimessinvest`;
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
          <tr>
            <td style="background-color: #111111; padding: 25px 30px; text-align: center; border-bottom: 1px solid rgba(201, 169, 110, 0.2);">
              <span style="color: ${BRAND_COLOR}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">CIMESSINVEST PLATFORM MONITOR</span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 6px 0 0 0;">Traffic Approaching Plan Limit</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Congratulations! Your storefront has experienced surging visitor traffic this month.
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Your account has utilized <strong>${usedPercentage}%</strong> of its monthly traffic quota under the <strong>${planName}</strong> plan:
              </p>
              <div style="background-color: #111111; border: 1px solid rgba(201, 169, 110, 0.3); border-radius: 6px; padding: 20px; margin: 25px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px;">
                  <span style="color: #A09585;">Monthly Visits:</span>
                  <span style="color: ${BRAND_COLOR}; font-weight: bold;">${monthlyVisits.toLocaleString()} / ${trafficLimit.toLocaleString()} visits</span>
                </div>
                <div style="background-color: #333333; border-radius: 4px; height: 10px; overflow: hidden;">
                  <div style="background-color: ${BRAND_COLOR}; height: 10px; width: ${Math.min(100, usedPercentage)}%;"></div>
                </div>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #C5B8A8;">
                To guarantee high-speed load times and uninterrupted service for your customers, consider upgrading to the next tier today.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${upgradeUrl}" style="background-color: ${BRAND_COLOR}; color: #111111; font-weight: bold; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 4px; display: inline-block; letter-spacing: 1.5px; text-transform: uppercase;">
                  Review & Upgrade Plan
                </a>
              </div>
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; margin-top: 30px;">
                <p style="font-size: 12px; color: #777777; margin: 0;">cimessinvest Infrastructure Team</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest. All Rights Reserved. (cimessinvest.com)</p>
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
 * 8. Traffic Cap Reached (100% Capacity Notice)
 */
export function getTrafficLimit100EmailHtml({
  userName,
  monthlyVisits,
  trafficLimit,
  usedPercentage,
  planName = "Current Tier",
  upgradeUrl = "https://cimessinvest.com/dashboard/payment",
}: TrafficWarningTemplateProps): { subject: string; html: string } {
  const subject = `🚨 Action Required: Storefront monthly traffic capacity reached (100%) | cimessinvest`;
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
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #242424; border: 1px solid #D9534F; border-radius: 8px; overflow: hidden; max-width: 600px;">
          <tr>
            <td style="background-color: #1A0D0D; padding: 25px 30px; text-align: center; border-bottom: 1px solid rgba(217, 83, 79, 0.3);">
              <span style="color: #D9534F; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">TRAFFIC QUOTA EXCEEDED</span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 6px 0 0 0;">Monthly Traffic Limit Reached</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 15px; color: #E0D5C9; margin-top: 0;">Dear <strong>${userName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6; color: #E0D5C9;">
                Your storefront has reached <strong>100% (${monthlyVisits.toLocaleString()} / ${trafficLimit.toLocaleString()} visits)</strong> of its monthly traffic quota under the <strong>${planName}</strong> plan.
              </p>
              <div style="background-color: #111111; border: 1px solid rgba(217, 83, 79, 0.4); border-radius: 6px; padding: 20px; margin: 25px 0;">
                <p style="font-size: 14px; color: #E0D5C9; margin: 0 0 10px 0;">
                  Status: <strong style="color: #D9534F;">Traffic Limit Capped (100%)</strong>
                </p>
                <div style="background-color: #333333; border-radius: 4px; height: 10px; overflow: hidden;">
                  <div style="background-color: #D9534F; height: 10px; width: 100%;"></div>
                </div>
              </div>
              <p style="font-size: 14px; line-height: 1.6; color: #C5B8A8;">
                To maintain uninterrupted high-performance delivery for your clients, please upgrade your subscription or request a custom enterprise tier.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${upgradeUrl}" style="background-color: ${BRAND_COLOR}; color: #111111; font-weight: bold; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 4px; display: inline-block; letter-spacing: 1.5px; text-transform: uppercase;">
                  Upgrade Plan Now
                </a>
              </div>
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; margin-top: 30px;">
                <p style="font-size: 12px; color: #777777; margin: 0;">cimessinvest Infrastructure Team</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #161616; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #777777; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest. All Rights Reserved. (cimessinvest.com)</p>
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

export interface SuperadminOtpTemplateProps {
  otpCode: string;
  purpose: "INITIALIZATION" | "RECOVERY";
  expiresInMinutes?: number;
}

/**
 * 9. Superadmin Security OTP Email (Initialization or Emergency Recovery)
 */
export function getSuperadminOtpEmailHtml({
  otpCode,
  purpose,
  expiresInMinutes = 10,
}: SuperadminOtpTemplateProps): { subject: string; html: string } {
  const isInit = purpose === "INITIALIZATION";
  const subject = isInit
    ? `🛡️ [CRITICAL] cimessinvest Platform — Superadmin Initialization Verification Code`
    : `🔑 [SECURITY ALERT] cimessinvest Platform — Superadmin Emergency Recovery Code`;

  const actionHeadline = isInit
    ? "System Initialization Authorization"
    : "Emergency Credential Recovery";

  const actionNotice = isInit
    ? "A request has been initiated to claim and lock the root Superadmin administrative authority for cimessinvest Platform from environment configuration."
    : "A master credential reset has been requested for the root Superadmin account via emergency security question verification.";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F0F0F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F5F0EB;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0F0F0F; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #141414; border: 1px solid rgba(201, 169, 110, 0.35); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A1A1A 0%, #111111 100%); padding: 35px 30px; text-align: center; border-bottom: 2px solid ${BRAND_COLOR};">
              <span style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: ${BRAND_COLOR}; font-weight: 700; display: block; margin-bottom: 8px;">
                PLATFORM ROOT SECURITY
              </span>
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">
                CIMESSINVEST
              </h1>
              <p style="font-size: 12px; color: #A09585; margin: 6px 0 0 0; letter-spacing: 1px;">
                ${actionHeadline}
              </p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #141414;">
              <p style="font-size: 14px; line-height: 1.6; color: #E0D5C9; margin-top: 0;">
                ${actionNotice}
              </p>
              <div style="background-color: #0D0D0D; border: 1px solid rgba(201, 169, 110, 0.25); border-radius: 6px; padding: 25px; text-align: center; margin: 30px 0;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A09585; display: block; margin-bottom: 12px;">
                  Your 6-Digit Single-Use Security Key
                </span>
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: ${BRAND_COLOR}; font-family: 'Courier New', Courier, monospace; margin: 0;">
                  ${otpCode}
                </div>
                <span style="font-size: 12px; color: #777777; display: block; margin-top: 14px;">
                  Expires in <strong>${expiresInMinutes} minutes</strong>. Single-use only.
                </span>
              </div>
              <p style="font-size: 13px; line-height: 1.6; color: #A09585; margin: 20px 0 0 0;">
                🔒 If you did not initiate this authorization, someone may be attempting to access root control of your deployment. Please review your server logs and environment variables immediately.
              </p>
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; margin-top: 30px;">
                <p style="font-size: 11px; color: #666666; margin: 0;">cimessinvest Platform Guardian & Security Core</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #0A0A0A; padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="font-size: 11px; color: #555555; margin: 0;">&copy; ${new Date().getFullYear()} cimessinvest Infrastructure. Authorized Personnel Only. (cimessinvest.com)</p>
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
 * 10. Storefront Customer Order / Invoice Paid Receipt Template
 * Sent to the customer after successful payment via Paystack or checkout
 */
export function getOrderPaidReceiptEmailHtml({
  customerName = "Valued Customer",
  customerEmail,
  customerPhone,
  orderReference,
  invoiceNumber,
  storeName,
  orderType,
  amountNaira,
  originalAmountNaira,
  discountNaira,
  shippingNaira,
  items,
  notes,
  paymentDate,
  checkoutUrl,
  whatsappNumber,
}: OrderPaidReceiptTemplateProps): { subject: string; html: string } {
  const displayRef = invoiceNumber || orderReference;
  const subject = `Payment Confirmed: Invoice #${displayRef} — ${storeName}`;

  const cleanWa = whatsappNumber?.replace(/\D/g, "") || "";
  const waLink = cleanWa
    ? `https://wa.me/${cleanWa.startsWith("0") ? `234${cleanWa.slice(1)}` : cleanWa}?text=${encodeURIComponent(
        `Hi ${storeName}, I am contacting you regarding my paid order #${displayRef}.`
      )}`
    : null;

  const itemsHtml = items.length > 0
    ? items
        .map(
          (item) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); color: #F5F0EB; font-size: 13px;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); text-align: center; color: #C9A96E; font-size: 13px; font-weight: bold;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); text-align: right; color: #F5F0EB; font-size: 13px;">
          ₦${item.priceNaira.toLocaleString()}
        </td>
        <td style="padding: 12px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); text-align: right; color: #C9A96E; font-size: 13px; font-weight: bold;">
          ₦${(item.priceNaira * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
        )
        .join("")
    : `
      <tr>
        <td colspan="4" style="padding: 14px; text-align: center; color: #888888; font-size: 12px;">
          Custom Order Item
        </td>
      </tr>
    `;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${TEXT_LIGHT};">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_DARK}; padding: 35px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #1F1F1F; border: 1px solid rgba(201, 169, 110, 0.3); border-radius: 12px; overflow: hidden; max-width: 600px; box-shadow: 0 12px 35px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #111111; padding: 30px; text-align: center; border-bottom: 2px solid ${BRAND_COLOR};">
              <span style="color: ${BRAND_COLOR}; font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; display: block; margin-bottom: 6px;">
                ${storeName}
              </span>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 22px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                Payment Receipt
              </h1>
              <div style="margin-top: 12px;">
                <span style="background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10B981; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; display: inline-block;">
                  ✓ Status: PAID &amp; CONFIRMED
                </span>
              </div>
            </td>
          </tr>

          <!-- Summary Meta Box -->
          <tr>
            <td style="padding: 24px 30px; background-color: #161616; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #888888; letter-spacing: 1px; display: block; margin-bottom: 4px;">Invoice Number</span>
                    <strong style="font-size: 14px; color: ${BRAND_COLOR}; font-family: monospace;">#${displayRef}</strong>
                    <span style="font-size: 11px; color: #666666; display: block; margin-top: 2px;">Type: ${orderType}</span>
                  </td>
                  <td width="50%" style="text-align: right; vertical-align: top;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #888888; letter-spacing: 1px; display: block; margin-bottom: 4px;">Payment Date</span>
                    <span style="font-size: 13px; color: #E0D5C9;">${paymentDate}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 14px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #888888; letter-spacing: 1px; display: block; margin-bottom: 4px;">Customer Details</span>
                    <span style="font-size: 13px; color: #E0D5C9;">
                      <strong>${customerName}</strong> &bull; ${customerEmail}${customerPhone ? ` &bull; ${customerPhone}` : ""}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Itemized Breakdown -->
          <tr>
            <td style="padding: 25px 30px;">
              <h3 style="color: ${TEXT_LIGHT}; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0; border-left: 3px solid ${BRAND_COLOR}; padding-left: 10px;">
                Purchased Items
              </h3>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #161616; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.06);">
                <thead>
                  <tr style="background-color: #111111;">
                    <th style="padding: 10px 14px; text-align: left; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                    <th style="padding: 10px 14px; text-align: center; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                    <th style="padding: 10px 14px; text-align: right; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                    <th style="padding: 10px 14px; text-align: right; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Sizing / Custom Notes Box if present -->
              ${
                notes
                  ? `
                <div style="background-color: #181818; border-left: 3px solid ${BRAND_COLOR}; padding: 14px 16px; margin-top: 18px; border-radius: 0 6px 6px 0;">
                  <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_COLOR}; font-weight: bold; display: block; margin-bottom: 4px;">
                    Custom Measurements &amp; Order Notes:
                  </span>
                  <p style="font-size: 12px; color: #CCCCCC; margin: 0; line-height: 1.5; white-space: pre-line;">
                    ${notes}
                  </p>
                </div>
              `
                  : ""
              }

              <!-- Pricing Summary -->
              <div style="margin-top: 22px; padding: 18px 20px; background-color: #141414; border: 1px solid rgba(201, 169, 110, 0.2); border-radius: 8px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  ${
                    originalAmountNaira && discountNaira && discountNaira > 0
                      ? `
                    <tr>
                      <td style="font-size: 13px; color: #888888; padding: 3px 0;">Catalog Value:</td>
                      <td style="font-size: 13px; color: #888888; text-decoration: line-through; text-align: right; padding: 3px 0;">₦${originalAmountNaira.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #10B981; padding: 3px 0;">Negotiated Discount:</td>
                      <td style="font-size: 13px; color: #10B981; text-align: right; padding: 3px 0;">-₦${discountNaira.toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                  ${
                    shippingNaira && shippingNaira > 0
                      ? `
                    <tr>
                      <td style="font-size: 13px; color: #888888; padding: 3px 0;">Logistics / Delivery:</td>
                      <td style="font-size: 13px; color: #CCCCCC; text-align: right; padding: 3px 0;">₦${shippingNaira.toLocaleString()}</td>
                    </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="font-size: 15px; font-weight: bold; color: ${TEXT_LIGHT}; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                      Total Paid Amount:
                    </td>
                    <td style="font-size: 20px; font-weight: 800; color: ${BRAND_COLOR}; text-align: right; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                      ₦${amountNaira.toLocaleString()}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Action Buttons -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="${checkoutUrl}" style="background-color: ${BRAND_COLOR}; color: #111111; text-decoration: none; padding: 13px 28px; border-radius: 6px; font-size: 13px; font-weight: bold; display: inline-block; letter-spacing: 0.5px;">
                  View &amp; Print Full Receipt Online
                </a>
              </div>

              ${
                waLink
                  ? `
                <div style="text-align: center; margin-top: 14px;">
                  <a href="${waLink}" style="color: #25D366; text-decoration: none; font-size: 12px; font-weight: 600;">
                    Questions about your order? Chat with ${storeName} on WhatsApp &rarr;
                  </a>
                </div>
              `
                  : ""
              }

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #111111; padding: 18px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="font-size: 11px; color: #666666; margin: 0; line-height: 1.5;">
                This receipt was automatically generated for your purchase at <strong>${storeName}</strong>, powered by cimessinvest Commerce Infrastructure.
              </p>
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

// -----------------------------------------------------------------------------
// Dispute & Support Ticket Email Templates
// -----------------------------------------------------------------------------

export interface DisputeCustomerEmailProps {
  customerName?: string;
  ticketNumber: string;
  orderReference: string;
  storeName: string;
  amountNaira: number;
  disputeReason: string;
}

export function getDisputeCustomerEmailTemplate(props: DisputeCustomerEmailProps): { subject: string; html: string } {
  const { customerName, ticketNumber, orderReference, storeName, amountNaira, disputeReason } = props;
  const name = customerName ? customerName.trim() : "Valued Customer";
  const subject = `[Dispute Case ${ticketNumber}] Protection Hold Activated for Order #${orderReference}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #f5f0eb; margin: 0; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #161616; border: 1px solid #c9a96e44; border-radius: 12px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="color: #c9a96e; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Buyer Protection Escrow</span>
      <h2 style="color: #f5f0eb; margin: 8px 0 0 0; font-size: 22px;">Dispute Received &amp; Funds Frozen</h2>
      <div style="display: inline-block; background: #c9a96e22; border: 1px solid #c9a96e88; color: #c9a96e; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px 12px; border-radius: 6px; margin-top: 12px;">
        ${ticketNumber}
      </div>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #d0c8be;">
      Dear ${name},<br/><br/>
      We have received your report regarding order <strong>#${orderReference}</strong> from <strong>${storeName}</strong> for <strong>₦${amountNaira.toLocaleString()}</strong>.
    </p>

    <div style="background: #201810; border-left: 4px solid #c9a96e; border-radius: 6px; padding: 14px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #f5f0eb;">
        <strong>Immediate Action Taken:</strong> Under our 24-Hour Buyer Protection policy, the payout for this order has been <strong>frozen and held</strong> in platform escrow. The merchant cannot withdraw these funds while our compliance team investigates your report.
      </p>
    </div>

    <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div style="margin-bottom: 8px;"><strong>Reason Reported:</strong> <span style="color: #c9a96e;">${disputeReason}</span></div>
      <div style="margin-bottom: 8px;"><strong>Order Reference:</strong> ${orderReference}</div>
      <div><strong>Current Ticket Status:</strong> <span style="color: #f59e0b; font-weight: bold;">INVESTIGATING</span></div>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #a89f91;">
      We have alerted the merchant store and requested proof of delivery. If the merchant cannot provide verified delivery confirmation, a full refund will be processed to your originating payment method.
    </p>

    <div style="margin-top: 30px; text-align: center; border-top: 1px solid #2a2a2a; padding-top: 20px; font-size: 11px; color: #666;">
      cimessinvest Buyer Protection Desk &bull; 24/7 Automated Commerce Dispute Protection
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

export interface DisputeMerchantAlertEmailProps {
  merchantName: string;
  storeName: string;
  ticketNumber: string;
  orderReference: string;
  amountNaira: number;
  customerName?: string;
  disputeReason: string;
}

export function getDisputeMerchantAlertEmailTemplate(props: DisputeMerchantAlertEmailProps): { subject: string; html: string } {
  const { merchantName, storeName, ticketNumber, orderReference, amountNaira, customerName, disputeReason } = props;
  const subject = `[ACTION REQUIRED ${ticketNumber}] Payout Frozen: Buyer Dispute Filed on Order #${orderReference}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #f5f0eb; margin: 0; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #161616; border: 1px solid #ef444466; border-radius: 12px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="color: #ef4444; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Merchant Compliance Alert</span>
      <h2 style="color: #f5f0eb; margin: 8px 0 0 0; font-size: 22px;">Buyer Dispute &bull; Payout Held</h2>
      <div style="display: inline-block; background: #ef444422; border: 1px solid #ef444488; color: #ef4444; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px 12px; border-radius: 6px; margin-top: 12px;">
        ${ticketNumber}
      </div>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #d0c8be;">
      Hello ${merchantName || storeName},<br/><br/>
      A customer (${customerName || "Customer"}) has filed a dispute on order <strong>#${orderReference}</strong> for <strong>₦${amountNaira.toLocaleString()}</strong> within the 24-hour buyer protection window.
    </p>

    <div style="background: #251212; border-left: 4px solid #ef4444; border-radius: 6px; padding: 14px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #fca5a5;">
        <strong>Balance Impact:</strong> ₦${amountNaira.toLocaleString()} has been moved from your Pending Balance into <strong>Held in Dispute</strong>. Settlement to your bank account is halted pending fulfillment verification.
      </p>
    </div>

    <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div style="margin-bottom: 8px;"><strong>Reason Stated:</strong> <span style="color: #fca5a5;">${disputeReason}</span></div>
      <div style="margin-bottom: 8px;"><strong>Order Reference:</strong> ${orderReference}</div>
      <div><strong>Order Payout:</strong> ₦${amountNaira.toLocaleString()}</div>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #a89f91;">
      Please contact the customer immediately or reply to this notice with proof of package handover, tracking waybill, or sizing resolution. If unresolved, our Superadmin desk may issue a gateway refund or restrict store settlement privileges.
    </p>

    <div style="margin-top: 30px; text-align: center; border-top: 1px solid #2a2a2a; padding-top: 20px; font-size: 11px; color: #666;">
      cimessinvest Merchant Operations Desk &bull; Merchant Trust &amp; Safety Division
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

export interface MerchantSupportEmailProps {
  merchantName: string;
  storeName: string;
  ticketNumber: string;
  category: string;
  subjectLine: string;
  description: string;
}

export function getMerchantSupportAcknowledgmentTemplate(props: MerchantSupportEmailProps): { subject: string; html: string } {
  const { merchantName, storeName, ticketNumber, category, subjectLine, description } = props;
  const subject = `[Support Ticket ${ticketNumber}] We Received Your Report — ${subjectLine}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #f5f0eb; margin: 0; padding: 20px;">
  <div style="max-width: 580px; margin: 0 auto; background: #161616; border: 1px solid #3b82f644; border-radius: 12px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="color: #3b82f6; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Merchant Partner Desk</span>
      <h2 style="color: #f5f0eb; margin: 8px 0 0 0; font-size: 22px;">Report Acknowledged</h2>
      <div style="display: inline-block; background: #3b82f622; border: 1px solid #3b82f688; color: #60a5fa; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px 12px; border-radius: 6px; margin-top: 12px;">
        ${ticketNumber}
      </div>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #d0c8be;">
      Hello ${merchantName || storeName},<br/><br/>
      Thank you for contacting the engineering &amp; payment support team. We have registered your report and our specialists are reviewing the details.
    </p>

    <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div style="margin-bottom: 8px;"><strong>Category:</strong> <span style="color: #60a5fa;">${category}</span></div>
      <div style="margin-bottom: 8px;"><strong>Subject:</strong> ${subjectLine}</div>
      <div style="margin-bottom: 8px;"><strong>Details:</strong> <span style="color: #ccc;">${description}</span></div>
      <div><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">QUEUED FOR INVESTIGATION</span></div>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #a89f91;">
      You do not need to submit another ticket for this same issue. A technical or billing specialist will review your store logs and respond shortly.
    </p>

    <div style="margin-top: 30px; text-align: center; border-top: 1px solid #2a2a2a; padding-top: 20px; font-size: 11px; color: #666;">
      cimessinvest Infrastructure Support &bull; Partner Operations
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
