// src/services/qrCodeService.ts
import QRCode from 'qrcode';

/**
 * Generate QR code as data URL (base64 image)
 * This can be embedded directly in HTML emails
 */
export async function generateQRCodeDataUrl(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1B2A4A',  // Dark navy - matches your template
        light: '#FFFFFF'   // White background
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a fallback QR code or empty string
    return '';
  }
}

/**
 * Generate QR code as base64 string (without the data:image prefix)
 */
export async function generateQRCodeBase64(data: string): Promise<string> {
  try {
    const dataUrl = await generateQRCodeDataUrl(data);
    // Remove the "data:image/png;base64," prefix
    return dataUrl.replace(/^data:image\/\w+;base64,/, '');
  } catch (error) {
    console.error('Error generating QR code base64:', error);
    return '';
  }
}

/**
 * Generate QR code as SVG string (for better rendering in email)
 */
export async function generateQRCodeSVG(data: string): Promise<string> {
  try {
    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: 300,
      margin: 2,
      color: {
        dark: '#1B2A4A',
        light: '#FFFFFF'
      }
    });
    return svgString;
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    return '';
  }
}

/**
 * Generate QR code URL using external API (fallback method)
 * Uses qrserver.com API - no library needed
 */
export function generateQRCodeUrl(data: string): string {
  // Encode the data for URL
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&color=1B2A4A&bgcolor=FFFFFF`;
}

/**
 * Generate a complete QR code with both data URL and URL for email
 */
export async function generateQRCodeForEmail(orderData: {
  orderId: string;
  tourName: string;
  customerName: string;
  date: string;
}): Promise<{
  dataUrl: string;
  base64: string;
  svg: string;
  externalUrl: string;
}> {
  // Create a JSON string with all the order data
  const qrData = JSON.stringify({
    orderId: orderData.orderId,
    tourName: orderData.tourName,
    customerName: orderData.customerName,
    date: orderData.date,
    validationUrl: `https://siamjourneys.com/validate-booking/${orderData.orderId}`
  });

  // Generate QR code using different methods
  const [dataUrl, svg] = await Promise.all([
    generateQRCodeDataUrl(qrData),
    generateQRCodeSVG(qrData)
  ]);

  // Also get the external URL
  const externalUrl = generateQRCodeUrl(qrData);

  return {
    dataUrl,
    base64: dataUrl.replace(/^data:image\/\w+;base64,/, ''),
    svg,
    externalUrl
  };
}

/**
 * Simple QR code generation for just the order number
 * This is the simplest approach for your email template
 */
export async function generateOrderQRCode(orderId: string): Promise<{
  dataUrl: string;
  externalUrl: string;
}> {
  // Create the data string - just the order ID for simplicity
  const qrData = orderId;

  // Generate QR code as data URL
  const dataUrl = await generateQRCodeDataUrl(qrData);
  
  // Also get the external URL (for fallback)
  const externalUrl = generateQRCodeUrl(qrData);

  return {
    dataUrl,
    externalUrl
  };
}