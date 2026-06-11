/**
 * Converte um número de telefone para URL do WhatsApp
 * Remove todos os caracteres não numéricos e formata para wa.me
 */
export function getWhatsAppUrl(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}`;
}
