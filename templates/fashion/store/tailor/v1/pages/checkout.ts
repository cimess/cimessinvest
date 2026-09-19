import { TemplatePageDefinition } from "@/templates/types";

export const tailorCheckoutPageV1: TemplatePageDefinition = {
  slug: "checkout",
  title: "Fitting Booking & Checkout",
  isSystem: true,
  version: 1,
  sections: [
    {
      id: "tailor_checkout_form",
      type: "CheckoutForm",
      version: 1,
      copy: {
        headline: "Complete Your Commission",
        subheadline: "Direct settlement with the Master Tailor via Paystack.",
        secureNotice: "Guaranteed split disbursement & encrypted transaction processing.",
      },
      layout: {
        themeMode: "DARK",
      },
    },
  ],
};
