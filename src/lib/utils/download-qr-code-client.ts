'use client';

import QRCode from 'qrcode';

/**
 * Client-side QR code generation and download utility
 * Generates QR codes entirely in the browser - no external API calls
 */

/**
 * Generate and download QR code as image (Client-side only)
 * @param menuUrl - The full menu URL to encode in the QR code
 * @param restaurantSubdomain - Restaurant subdomain for filename
 */
/**
 * Convert data URL to Blob (works without fetch)
 */
function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const binaryString = atob(parts[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function downloadQRCodeClient(
  menuUrl: string,
  restaurantSubdomain: string
): Promise<void> {
  try {
    console.log('[QR CODE] Generating QR code for:', menuUrl);

    // Generate QR code as data URL (canvas-based, high quality)
    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction
    });

    console.log('[QR CODE] QR code generated successfully');

    // Convert data URL to blob without fetch
    const blob = dataURLtoBlob(qrDataUrl);

    // Create download link with restaurant-specific filename
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${restaurantSubdomain}-menu-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('[QR CODE] Download initiated successfully');
  } catch (error) {
    console.error('[QR CODE] Error generating/downloading QR code:', error);
    throw new Error('Failed to generate QR code. Please try again.');
  }
}

/**
 * Generate QR code as data URL for preview/display
 */
export async function generateQRCodeDataURL(menuUrl: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return qrDataUrl;
  } catch (error) {
    console.error('[QR CODE] Error generating QR code preview:', error);
    throw new Error('Failed to generate QR code preview');
  }
}
