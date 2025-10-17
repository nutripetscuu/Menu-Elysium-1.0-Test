/**
 * Email templates and sending utilities for onboarding
 */

interface WelcomeEmailData {
  restaurantName: string;
  ownerEmail: string;
  subdomain: string;
  adminPanelUrl: string;
  menuUrl: string;
  qrCodeDataUrl: string;
  tempPassword?: string;
}

/**
 * Send welcome email to new restaurant owner
 * For now, this logs the email content. In production, integrate with your email service.
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  console.log('[EMAIL] Sending welcome email to:', data.ownerEmail);

  const emailContent = generateWelcomeEmailHTML(data);

  // TODO: Integrate with your email service (SendGrid, AWS SES, Resend, etc.)
  // For now, we'll log the email content
  console.log('[EMAIL] Welcome email content generated');
  console.log('[EMAIL] To:', data.ownerEmail);
  console.log('[EMAIL] Subject: Welcome to NoWaiter - Your Restaurant is Ready!');

  // In development, you might want to save this to a file or display it
  if (process.env.NODE_ENV === 'development') {
    console.log('[EMAIL] Email HTML length:', emailContent.length);
    // Optionally save to file for preview
    // await fs.writeFile(`welcome-email-${Date.now()}.html`, emailContent);
  }

  // Example integration with a service:
  /*
  await emailService.send({
    to: data.ownerEmail,
    from: 'noreply@nowaiter.app',
    subject: 'Welcome to NoWaiter - Your Restaurant is Ready!',
    html: emailContent,
    attachments: [
      {
        filename: 'qr-code.png',
        content: data.qrCodeDataUrl.split(',')[1],
        encoding: 'base64'
      }
    ]
  });
  */
}

function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NoWaiter</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
    }
    .content {
      background: white;
      padding: 40px 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 10px 10px;
    }
    .welcome-section {
      margin-bottom: 30px;
    }
    .info-box {
      background: #f9fafb;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box h3 {
      margin-top: 0;
      color: #667eea;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    }
    .qr-section {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .qr-section img {
      max-width: 200px;
      border: 4px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    .quick-links {
      background: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .quick-links ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .quick-links li {
      margin: 8px 0;
    }
    .footer {
      text-align: center;
      padding: 30px 20px;
      color: #6b7280;
      font-size: 14px;
    }
    .credentials {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Welcome to NoWaiter!</h1>
    <p style="margin: 10px 0 0 0; font-size: 18px;">Your restaurant is now live</p>
  </div>

  <div class="content">
    <div class="welcome-section">
      <h2>Hi ${data.restaurantName}! 👋</h2>
      <p>Congratulations! Your digital menu is ready to go. You can now start managing your menu, accepting orders, and delighting your customers.</p>
    </div>

    <div class="info-box">
      <h3>📱 Your Menu is Live</h3>
      <p><strong>Menu URL:</strong> <a href="${data.menuUrl}">${data.menuUrl}</a></p>
      <p>Share this link with your customers, or use the QR code below!</p>
    </div>

    <div class="qr-section">
      <h3>Your Menu QR Code</h3>
      <p>Print this QR code and place it on your tables, counter, or storefront:</p>
      <img src="${data.qrCodeDataUrl}" alt="Menu QR Code" />
      <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
        Download from your admin panel for high-resolution printing
      </p>
    </div>

    <div class="info-box">
      <h3>🔐 Access Your Admin Panel</h3>
      <p><strong>Admin Panel:</strong> <a href="${data.adminPanelUrl}">${data.adminPanelUrl}</a></p>
      <p><strong>Email:</strong> ${data.ownerEmail}</p>
      ${data.tempPassword ? `
      <div class="credentials">
        <p><strong>⚠️ Temporary Password:</strong> ${data.tempPassword}</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Please change this password after your first login.</p>
      </div>
      ` : ''}
      <a href="${data.adminPanelUrl}" class="button">Go to Admin Panel →</a>
    </div>

    <div class="quick-links">
      <h3>🚀 Quick Start Guide</h3>
      <ul>
        <li><strong>Add Menu Items:</strong> Create your first menu items and categories</li>
        <li><strong>Customize Your Menu:</strong> Upload logo, set colors, and add descriptions</li>
        <li><strong>Set Up Hours:</strong> Configure your operating hours</li>
        <li><strong>Enable Ordering:</strong> Turn on online ordering when ready</li>
        <li><strong>Share QR Code:</strong> Download and print your menu QR code</li>
      </ul>
    </div>

    <div class="info-box">
      <h3>💬 Need Help?</h3>
      <p>We're here to help you succeed! Check out these resources:</p>
      <ul>
        <li>📖 <a href="https://docs.nowaiter.app">Documentation & Guides</a></li>
        <li>💬 <a href="mailto:support@nowaiter.app">Email Support</a></li>
        <li>🎥 <a href="https://nowaiter.app/tutorials">Video Tutorials</a></li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 40px;">
      <p style="font-size: 16px; color: #667eea; font-weight: 600;">
        🎁 Your 7-day free trial has started!
      </p>
      <p style="color: #6b7280; font-size: 14px;">
        Enjoy all premium features. No credit card charged until trial ends.
      </p>
    </div>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} NoWaiter. All rights reserved.</p>
    <p>
      <a href="https://nowaiter.app/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a> |
      <a href="https://nowaiter.app/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}
