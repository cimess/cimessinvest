export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  const targetPhone = cleanPhone || "0000000";
  
  return `https://wa.me/${targetPhone}?text=${encodedMessage}`;
}

export function buildWhatsAppItemUrl({
  phone,
  itemTitle,
  itemUrl,
  price
}: {
  phone: string;
  itemTitle: string;
  itemUrl?: string;
  price?: string;
}): string {
  let message = `Hello, I am interested in booking a fitting for "${itemTitle}".`;
  if (price) message += ` Listed Price: ${price}.`;
  if (itemUrl) message += `\nView Design Preview: ${itemUrl}`;

  return buildWhatsAppUrl(phone, message);
}
