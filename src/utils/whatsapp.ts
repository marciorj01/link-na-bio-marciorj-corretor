/**
 * Formats a phone number for direct WhatsApp links
 * Ensures country code 55 (Brazil) if not present
 */
export function formatWhatsAppUrl(phone: string, message: string): string {
  // Strip non-numeric characters
  let cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) {
    cleanPhone = '5521998765432';
  }
  // Ensure Brazil country code if 10 or 11 digits
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = '55' + cleanPhone;
  }
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
