// src/utils/promptpay.ts
//
// Generates a scannable PromptPay QR code image using the free promptpay.io
// service — no API key, backend call, or extra npm package required.
// Docs / attribution: https://promptpay.io/

/**
 * Builds a PromptPay QR code image URL.
 *
 * @param id      The PromptPay ID the money should be sent to. Accepts:
 *                - a 10-digit mobile number, e.g. "0812345678"
 *                - a 13-digit citizen ID or tax ID
 *                - a 15-digit e-Wallet ID
 *                Dashes, spaces, and a leading "+66"/"66" country code are
 *                normalized automatically.
 * @param amount  Optional amount in THB. When provided, the QR is generated
 *                with the amount pre-filled, so the payer just scans and
 *                confirms — they can't accidentally send the wrong amount.
 *                Omit it (or pass 0) to generate an "any amount" QR.
 * @returns       A URL to a PNG QR code image, e.g.
 *                "https://promptpay.io/0812345678/1500.00.png"
 */
export function getPromptPayQrUrl(id: string, amount?: number): string {
  const cleanId = normalizePromptPayId(id);

  if (!cleanId) {
    throw new Error(
      "A valid PromptPay ID (mobile number, citizen ID, or e-Wallet ID) is required."
    );
  }

  const hasAmount = typeof amount === "number" && isFinite(amount) && amount > 0;
  const path = hasAmount ? `${cleanId}/${amount!.toFixed(2)}` : cleanId;

  return `https://promptpay.io/${path}.png`;
}

/**
 * Strips formatting characters (dashes, spaces) and normalizes a leading
 * +66/66 country code back to the local 0-prefixed mobile format, e.g.
 * "+66 81-234-5678" -> "0812345678".
 */
export function normalizePromptPayId(id: string): string {
  let digits = id.replace(/[^0-9]/g, "");

  if (digits.length === 11 && digits.startsWith("66")) {
    digits = `0${digits.slice(2)}`;
  }

  return digits;
}

/**
 * Formats a PromptPay ID for display purposes only (not used in the QR URL).
 * "0812345678" -> "081-234-5678"
 * "1234567890123" -> "1-2345-67890-12-3" (citizen/tax ID grouping)
 */
export function formatPromptPayId(id: string): string {
  const digits = normalizePromptPayId(id);

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 13) {
    return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12)}`;
  }
  return digits;
}