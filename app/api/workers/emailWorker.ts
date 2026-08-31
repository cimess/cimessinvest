import { sendEmail } from "@/app/lib/email/emailTransporter";
import {
  getWelcomeEmailHtml,
  getStorageWarningEmailHtml,
  getSubscriptionDueEmailHtml,
  getForgotPasswordOtpEmailHtml,
  getSignupOtpEmailHtml,
  getPaymentReceiptEmailHtml,
} from "@/app/lib/email/templates";
import { prisma } from "@/app/lib/prisma/prisma";

export type EmailEventType =
  | "WELCOME"
  | "STORAGE_WARNING_80"
  | "SUBSCRIPTION_DUE"
  | "FORGOT_PASSWORD_OTP"
  | "SIGNUP_OTP"
  | "PAYMENT_RECEIPT";

export interface BaseEmailEvent {
  type: EmailEventType;
  toEmail?: string;
  userId?: string;
}

export interface WelcomeEvent extends BaseEmailEvent {
  type: "WELCOME";
  userName: string;
  companyName?: string;
  docUrl?: string;
}

export interface StorageWarning80Event extends BaseEmailEvent {
  type: "STORAGE_WARNING_80";
  userName: string;
  storageUsedMB: number;
  storageLimitMB: number;
  usedPercentage: number;
  dashboardUrl?: string;
}

export interface SubscriptionDueEvent extends BaseEmailEvent {
  type: "SUBSCRIPTION_DUE";
  userName: string;
  daysRemaining: number;
  renewalDate: string;
  planName: string;
  billingUrl?: string;
}

export interface ForgotPasswordOtpEvent extends BaseEmailEvent {
  type: "FORGOT_PASSWORD_OTP";
  userName: string;
  otpCode: string;
  expiresInMinutes?: number;
}

export interface SignupOtpEvent extends BaseEmailEvent {
  type: "SIGNUP_OTP";
  userName: string;
  otpCode: string;
  expiresInMinutes?: number;
}

export interface PaymentReceiptEvent extends BaseEmailEvent {
  type: "PAYMENT_RECEIPT";
  userName: string;
  planName: string;
  amountFormatted: string;
  reference: string;
  transactionDate: string;
  storageLimitMB: number;
}

export type EmailEvent =
  | WelcomeEvent
  | StorageWarning80Event
  | SubscriptionDueEvent
  | ForgotPasswordOtpEvent
  | SignupOtpEvent
  | PaymentReceiptEvent;

/**
 * Worker handler to process incoming email dispatch events.
 * Resolves recipient email from DB if userId is provided.
 */
export async function processEmailEvent(event: EmailEvent) {
  try {
    let recipientEmail = event.toEmail;
    let userName = "userName" in event ? event.userName : "Valued Customer";

    // 1. Resolve recipient info from Database if userId is passed
    if (!recipientEmail && event.userId) {
      const user = await prisma.user.findUnique({
        where: { id: event.userId },
        select: { email: true, companyName: true },
      });
      if (user) {
        recipientEmail = user.email;
        userName = user.companyName || userName;
      }
    }

    if (!recipientEmail) {
      console.error("[EmailWorker] Cannot dispatch event: Missing recipient email.", event);
      return { success: false, error: "Missing recipient email" };
    }

    // 2. Route event to corresponding HTML template builder
    let templateData: { subject: string; html: string };

    switch (event.type) {
      case "WELCOME":
        templateData = getWelcomeEmailHtml({
          userName,
          companyName: event.companyName,
          docUrl: event.docUrl || "https://cimessinvest.com/doc",
        });
        break;

      case "STORAGE_WARNING_80":
        templateData = getStorageWarningEmailHtml({
          userName,
          storageUsedMB: event.storageUsedMB,
          storageLimitMB: event.storageLimitMB,
          usedPercentage: event.usedPercentage,
          dashboardUrl: event.dashboardUrl,
        });
        break;

      case "SUBSCRIPTION_DUE":
        templateData = getSubscriptionDueEmailHtml({
          userName,
          daysRemaining: event.daysRemaining,
          renewalDate: event.renewalDate,
          planName: event.planName,
          billingUrl: event.billingUrl,
        });
        break;

      case "FORGOT_PASSWORD_OTP":
        templateData = getForgotPasswordOtpEmailHtml({
          userName,
          otpCode: event.otpCode,
          expiresInMinutes: event.expiresInMinutes || 15,
        });
        break;

      case "SIGNUP_OTP":
        templateData = getSignupOtpEmailHtml({
          userName,
          otpCode: event.otpCode,
          expiresInMinutes: event.expiresInMinutes || 15,
        });
        break;

      case "PAYMENT_RECEIPT":
        templateData = getPaymentReceiptEmailHtml({
          userName,
          planName: event.planName,
          amountFormatted: event.amountFormatted,
          reference: event.reference,
          transactionDate: event.transactionDate,
          storageLimitMB: event.storageLimitMB,
        });
        break;

      default:
        console.error("[EmailWorker] Unknown event type:", (event as { type: string }).type);
        return { success: false, error: "Unknown event type" };
    }

    // 3. Dispatch email via Resend transporter
    const result = await sendEmail({
      to: recipientEmail,
      subject: templateData.subject,
      html: templateData.html,
    });

    console.log(`[EmailWorker] Dispatched event ${event.type} to ${recipientEmail}:`, result);
    return result;
  } catch (error: unknown) {
    console.error("[EmailWorker] Failed processing email event:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

/**
 * Worker Trigger Helpers
 */
export async function triggerWelcomeEmail(params: Omit<WelcomeEvent, "type">) {
  return processEmailEvent({ type: "WELCOME", ...params });
}

export async function triggerStorageWarning80(params: Omit<StorageWarning80Event, "type">) {
  return processEmailEvent({ type: "STORAGE_WARNING_80", ...params });
}

export async function triggerSubscriptionDueEmail(params: Omit<SubscriptionDueEvent, "type">) {
  return processEmailEvent({ type: "SUBSCRIPTION_DUE", ...params });
}

export async function triggerForgotPasswordOTP(params: Omit<ForgotPasswordOtpEvent, "type">) {
  return processEmailEvent({ type: "FORGOT_PASSWORD_OTP", ...params });
}

export async function triggerSignupOTP(params: Omit<SignupOtpEvent, "type">) {
  return processEmailEvent({ type: "SIGNUP_OTP", ...params });
}

export async function triggerPaymentReceiptEmail(params: Omit<PaymentReceiptEvent, "type">) {
  return processEmailEvent({ type: "PAYMENT_RECEIPT", ...params });
}
