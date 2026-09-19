import { sendEmail } from "@/app/lib/email/emailTransporter";
import {
  getWelcomeEmailHtml,
  getStorageWarningEmailHtml,
  getSubscriptionDueEmailHtml,
  getForgotPasswordOtpEmailHtml,
  getSignupOtpEmailHtml,
  getPaymentReceiptEmailHtml,
  getTrafficWarning80EmailHtml,
  getTrafficLimit100EmailHtml,
  getSuperadminOtpEmailHtml,
  getOrderPaidReceiptEmailHtml,
  getDisputeCustomerEmailTemplate,
  getDisputeMerchantAlertEmailTemplate,
  getMerchantSupportAcknowledgmentTemplate,
} from "@/app/lib/email/templates";
import { prisma } from "@/app/lib/prisma/prisma";

export type EmailEventType =
  | "WELCOME"
  | "STORAGE_WARNING_80"
  | "SUBSCRIPTION_DUE"
  | "FORGOT_PASSWORD_OTP"
  | "SIGNUP_OTP"
  | "PAYMENT_RECEIPT"
  | "TRAFFIC_WARNING_80"
  | "TRAFFIC_LIMIT_100"
  | "SUPERADMIN_SECURITY_OTP"
  | "ORDER_PAID_RECEIPT"
  | "DISPUTE_CUSTOMER_ALERT"
  | "DISPUTE_MERCHANT_ALERT"
  | "MERCHANT_SUPPORT_REPORT";

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

export interface TrafficWarning80Event extends BaseEmailEvent {
  type: "TRAFFIC_WARNING_80";
  userName: string;
  monthlyVisits: number;
  trafficLimit: number;
  usedPercentage: number;
  planName?: string;
  upgradeUrl?: string;
}

export interface TrafficLimit100Event extends BaseEmailEvent {
  type: "TRAFFIC_LIMIT_100";
  userName: string;
  monthlyVisits: number;
  trafficLimit: number;
  usedPercentage: number;
  planName?: string;
  upgradeUrl?: string;
}

export interface SuperadminSecurityOtpEvent extends BaseEmailEvent {
  type: "SUPERADMIN_SECURITY_OTP";
  toEmail: string;
  otpCode: string;
  purpose: "INITIALIZATION" | "RECOVERY";
  expiresInMinutes?: number;
}

export interface OrderPaidReceiptEvent extends BaseEmailEvent {
  type: "ORDER_PAID_RECEIPT";
  toEmail: string;
  customerName?: string;
  customerPhone?: string;
  orderReference: string;
  invoiceNumber?: string | null;
  storeName: string;
  orderType: string;
  amountNaira: number;
  originalAmountNaira?: number | null;
  discountNaira?: number | null;
  shippingNaira?: number | null;
  items: Array<{ name: string; quantity: number; priceNaira: number }>;
  notes?: string | null;
  paymentDate: string;
  checkoutUrl: string;
  whatsappNumber?: string | null;
}

export interface DisputeCustomerAlertEvent extends BaseEmailEvent {
  type: "DISPUTE_CUSTOMER_ALERT";
  toEmail: string;
  customerName?: string;
  ticketNumber: string;
  orderReference: string;
  storeName: string;
  amountNaira: number;
  disputeReason: string;
}

export interface DisputeMerchantAlertEvent extends BaseEmailEvent {
  type: "DISPUTE_MERCHANT_ALERT";
  toEmail: string;
  merchantName: string;
  storeName: string;
  ticketNumber: string;
  orderReference: string;
  amountNaira: number;
  customerName?: string;
  disputeReason: string;
}

export interface MerchantSupportReportEvent extends BaseEmailEvent {
  type: "MERCHANT_SUPPORT_REPORT";
  toEmail: string;
  merchantName: string;
  storeName: string;
  ticketNumber: string;
  category: string;
  subjectLine: string;
  description: string;
}

export type EmailEvent =
  | WelcomeEvent
  | StorageWarning80Event
  | SubscriptionDueEvent
  | ForgotPasswordOtpEvent
  | SignupOtpEvent
  | PaymentReceiptEvent
  | TrafficWarning80Event
  | TrafficLimit100Event
  | SuperadminSecurityOtpEvent
  | OrderPaidReceiptEvent
  | DisputeCustomerAlertEvent
  | DisputeMerchantAlertEvent
  | MerchantSupportReportEvent;

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

      case "TRAFFIC_WARNING_80":
        templateData = getTrafficWarning80EmailHtml({
          userName,
          monthlyVisits: event.monthlyVisits,
          trafficLimit: event.trafficLimit,
          usedPercentage: event.usedPercentage,
          planName: event.planName,
          upgradeUrl: event.upgradeUrl,
        });
        break;

      case "TRAFFIC_LIMIT_100":
        templateData = getTrafficLimit100EmailHtml({
          userName,
          monthlyVisits: event.monthlyVisits,
          trafficLimit: event.trafficLimit,
          usedPercentage: event.usedPercentage,
          planName: event.planName,
          upgradeUrl: event.upgradeUrl,
        });
        break;

      case "SUPERADMIN_SECURITY_OTP":
        templateData = getSuperadminOtpEmailHtml({
          otpCode: event.otpCode,
          purpose: event.purpose,
          expiresInMinutes: event.expiresInMinutes,
        });
        break;

      case "ORDER_PAID_RECEIPT":
        templateData = getOrderPaidReceiptEmailHtml({
          customerName: event.customerName,
          customerEmail: event.toEmail,
          customerPhone: event.customerPhone,
          orderReference: event.orderReference,
          invoiceNumber: event.invoiceNumber,
          storeName: event.storeName,
          orderType: event.orderType,
          amountNaira: event.amountNaira,
          originalAmountNaira: event.originalAmountNaira,
          discountNaira: event.discountNaira,
          shippingNaira: event.shippingNaira,
          items: event.items,
          notes: event.notes,
          paymentDate: event.paymentDate,
          checkoutUrl: event.checkoutUrl,
          whatsappNumber: event.whatsappNumber,
        });
        break;

      case "DISPUTE_CUSTOMER_ALERT":
        templateData = getDisputeCustomerEmailTemplate({
          customerName: event.customerName,
          ticketNumber: event.ticketNumber,
          orderReference: event.orderReference,
          storeName: event.storeName,
          amountNaira: event.amountNaira,
          disputeReason: event.disputeReason,
        });
        break;

      case "DISPUTE_MERCHANT_ALERT":
        templateData = getDisputeMerchantAlertEmailTemplate({
          merchantName: event.merchantName,
          storeName: event.storeName,
          ticketNumber: event.ticketNumber,
          orderReference: event.orderReference,
          amountNaira: event.amountNaira,
          customerName: event.customerName,
          disputeReason: event.disputeReason,
        });
        break;

      case "MERCHANT_SUPPORT_REPORT":
        templateData = getMerchantSupportAcknowledgmentTemplate({
          merchantName: event.merchantName,
          storeName: event.storeName,
          ticketNumber: event.ticketNumber,
          category: event.category,
          subjectLine: event.subjectLine,
          description: event.description,
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

export async function triggerTrafficWarning80(params: Omit<TrafficWarning80Event, "type">) {
  return processEmailEvent({ type: "TRAFFIC_WARNING_80", ...params });
}

export async function triggerTrafficLimit100(params: Omit<TrafficLimit100Event, "type">) {
  return processEmailEvent({ type: "TRAFFIC_LIMIT_100", ...params });
}

export async function triggerSuperadminSecurityOTP(params: Omit<SuperadminSecurityOtpEvent, "type">) {
  return processEmailEvent({ type: "SUPERADMIN_SECURITY_OTP", ...params });
}

export async function triggerOrderPaidReceiptEmail(params: Omit<OrderPaidReceiptEvent, "type">) {
  return processEmailEvent({ type: "ORDER_PAID_RECEIPT", ...params });
}

export async function triggerDisputeCustomerAlert(params: Omit<DisputeCustomerAlertEvent, "type">) {
  return processEmailEvent({ type: "DISPUTE_CUSTOMER_ALERT", ...params });
}

export async function triggerDisputeMerchantAlert(params: Omit<DisputeMerchantAlertEvent, "type">) {
  return processEmailEvent({ type: "DISPUTE_MERCHANT_ALERT", ...params });
}

export async function triggerMerchantSupportReport(params: Omit<MerchantSupportReportEvent, "type">) {
  return processEmailEvent({ type: "MERCHANT_SUPPORT_REPORT", ...params });
}

