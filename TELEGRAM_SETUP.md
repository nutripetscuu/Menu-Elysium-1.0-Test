# Telegram Bot Setup for Order Notifications

This document explains how to set up the Telegram bot integration for receiving order notifications from your restaurant menu.

## Required Environment Variables

You need to add the following environment variables to your `.env.local` file:

```env
# Telegram Bot Configuration
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your_chat_id_here
```

## Step-by-Step Setup Guide

### 1. Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather by clicking "Start"
3. **Create a new bot** by sending: `/newbot`
4. **Choose a name** for your bot (e.g., "Elysium Café Orders")
5. **Choose a username** for your bot (must end with 'bot', e.g., "elysium_cafe_orders_bot")
6. **Copy the Bot Token** that BotFather provides (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

#### Option A: Personal Chat (Recommended for testing)
1. **Start a chat** with your newly created bot
2. **Send any message** to the bot
3. **Open this URL** in your browser (replace `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. **Find your Chat ID** in the response JSON (it will be a number like `123456789`)

#### Option B: Group Chat (Recommended for business)
1. **Create a Telegram group** or use an existing one
2. **Add your bot** to the group as an admin
3. **Send any message** in the group mentioning the bot (e.g., "Hello @your_bot_username")
4. **Open this URL** in your browser (replace `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
5. **Find the group Chat ID** in the response (it will be a negative number like `-123456789`)

### 3. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Telegram Bot Configuration
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
NEXT_PUBLIC_TELEGRAM_CHAT_ID=123456789
```

**Important Notes:**
- Replace the example values with your actual bot token and chat ID
- If using a group chat, the chat ID will be negative (e.g., `-123456789`)
- Keep these values secret and never commit them to version control

### 4. Test the Integration

1. **Restart your development server** after adding the environment variables
2. **Add items to your cart** on the website
3. **Click "Pedir a mi mesa"** to send a test order
4. **Check your Telegram** chat or group for the order notification

## Order Message Format

When a customer places an order, you'll receive a formatted message with:

- 📅 **Date and time** of the order
- 📦 **Total number of items** and **total price**
- 📋 **Detailed breakdown** of each item including:
  - Item name and quantity
  - Unit price and subtotal
  - Size options (if applicable)
  - Milk type (if applicable)
  - Sugar/sweetener type (if applicable)
  - Extra additions (if any)
- 💳 **Final total** in MXN
- ⏰ **Order status** (Pending)
- 🎯 **Order type** (Pedido a Mesa)

## Security Considerations

- **Never expose** your bot token publicly
- **Use environment variables** to store sensitive data
- **Restrict bot permissions** to only what's necessary
- **Monitor your bot** for unusual activity
- **Consider using a dedicated group** for order notifications

## Troubleshooting

### Common Issues:

1. **"Telegram bot not configured"**
   - Check that both environment variables are set correctly
   - Restart your development server after adding variables

2. **"Telegram API error: Unauthorized"**
   - Verify your bot token is correct
   - Make sure the bot token starts with a number followed by a colon

3. **"Telegram API error: Chat not found"**
   - Verify your chat ID is correct
   - For group chats, ensure the chat ID is negative
   - Make sure the bot is added to the group (if using group chat)

4. **Orders not appearing**
   - Check browser console for error messages
   - Verify the bot has permission to send messages
   - Ensure you've started a conversation with the bot

### Testing Connection

You can test the Telegram connection using the browser console:

```javascript
// Open browser console and run:
import { telegramService } from '@/lib/services/telegram';
telegramService.testConnection().then(console.log);
```

## Support

If you encounter issues:

1. **Check the browser console** for error messages
2. **Verify all environment variables** are set correctly
3. **Test the bot manually** by sending messages through Telegram
4. **Check BotFather** to ensure your bot is active

---

## Example .env.local File

```env
# Database (if using)
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key

# Telegram Bot Configuration
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyzABCdefGHI
NEXT_PUBLIC_TELEGRAM_CHAT_ID=-1001234567890

# Other configurations...
```

Remember to add `.env.local` to your `.gitignore` file to prevent committing sensitive information.