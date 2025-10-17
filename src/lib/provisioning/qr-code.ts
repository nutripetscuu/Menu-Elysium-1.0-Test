import QRCode from 'qrcode';

/**
 * Generate QR code for restaurant menu
 * @param subdomain - Restaurant subdomain
 * @param restaurantId - Restaurant ID
 * @returns Base64 encoded QR code image
 */
export async function generateMenuQRCode(
  subdomain: string,
  restaurantId: string
): Promise<string> {
  try {
    // Generate the menu URL
    const menuUrl = process.env.NODE_ENV === 'production'
      ? `https://${subdomain}.nowaiter.app/menu`
      : `http://localhost:9002/menu?restaurant=${restaurantId}`;

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('[QR CODE] Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer (for email attachments)
 */
export async function generateMenuQRCodeBuffer(
  subdomain: string,
  restaurantId: string
): Promise<Buffer> {
  try {
    const menuUrl = process.env.NODE_ENV === 'production'
      ? `https://${subdomain}.nowaiter.app/menu`
      : `http://localhost:9002/menu?restaurant=${restaurantId}`;

    const buffer = await QRCode.toBuffer(menuUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 500,
      margin: 2,
    });

    return buffer;
  } catch (error) {
    console.error('[QR CODE] Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}
