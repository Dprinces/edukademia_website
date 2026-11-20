const WHATSAPP_NUMBER = '2348067845022';

/** WhatsApp chat with Edukademia, with a pre-filled message. */
export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** WhatsApp business message link; cannot carry custom text, so only offered after a form is saved. */
export const WHATSAPP_DIRECT_URL = 'https://wa.me/message/O4UBELVXPM2GB1';
