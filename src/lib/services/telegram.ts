import type { CartItem } from "@/contexts/cart-context";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface OrderData {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  timestamp: string;
  tableNumber: string;
}

class TelegramService {
  private botToken: string | null = null;
  private chatId: string | null = null;

  constructor() {
    // Initialize with environment variables
    this.botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || null;
    this.chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || null;
  }

  private isConfigured(): boolean {
    return !!(this.botToken && this.chatId);
  }

  private formatOrderMessage(order: OrderData): string {
    const { items, totalPrice, totalItems, timestamp, tableNumber } = order;

    let message = `🍽️ *NUEVO PEDIDO - ELYSIUM CAFÉ*\n\n`;
    message += `📅 *Fecha:* ${new Date(timestamp).toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n\n`;

    message += `🪑 *MESA:* #${tableNumber}\n`;
    message += `📦 *Total de artículos:* ${totalItems}\n`;
    message += `💰 *Total:* $${totalPrice.toFixed(2)} MXN\n\n`;

    message += `📋 *DETALLES DEL PEDIDO:*\n`;
    message += `${'═'.repeat(30)}\n`;

    items.forEach((item, index) => {
      message += `\n${index + 1}. *${item.menuItem.name}*\n`;
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio unitario: $${item.unitPrice.toFixed(2)}\n`;
      message += `   • Subtotal: $${item.totalPrice.toFixed(2)}\n`;

      if (item.selectedSize) {
        message += `   • Tamaño: ${item.selectedSize === "medium" ? "Mediano" : "Grande"}\n`;
      }

      if (item.selectedMilk) {
        const milkNames: { [key: string]: string } = {
          regular: "Leche Regular",
          almond: "Leche de Almendra",
          oat: "Leche de Avena",
          "lactose-free": "Leche Deslactosada",
          soy: "Leche de Soja",
        };
        message += `   • Leche: ${milkNames[item.selectedMilk] || item.selectedMilk}\n`;
      }

      if (item.selectedSugar) {
        const sugarNames: { [key: string]: string } = {
          normal: "Azúcar Normal",
          stevia: "Stevia",
          "no-sugar": "Sin Azúcar",
        };
        message += `   • Endulzante: ${sugarNames[item.selectedSugar] || item.selectedSugar}\n`;
      }

      if (item.selectedFlavor) {
        message += `   • Sabor: ${item.selectedFlavor}\n`;
      }

      if (item.extras.length > 0) {
        const extraNames: { [key: string]: string } = {
          "extra-shot": "Shot Extra de Café",
          "whipped-cream": "Crema Batida",
          "vanilla-syrup": "Jarabe de Vainilla",
          "caramel-syrup": "Jarabe de Caramelo",
        };
        const formattedExtras = item.extras.map(extra => extraNames[extra] || extra).join(", ");
        message += `   • Extras: ${formattedExtras}\n`;
      }

      if (index < items.length - 1) {
        message += `${'-'.repeat(20)}\n`;
      }
    });

    message += `\n${'═'.repeat(30)}\n`;
    message += `💳 *TOTAL FINAL: $${totalPrice.toFixed(2)} MXN*\n\n`;
    message += `⏰ *Estado:* Pendiente\n`;
    message += `🎯 *Tipo:* Pedido a Mesa\n\n`;
    message += `*Por favor confirme la recepción del pedido* ✅`;

    return message;
  }

  async sendOrder(order: OrderData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Telegram bot not configured. Please check environment variables.');
      }

      const message = this.formatOrderMessage(order);
      const telegramApiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API error: ${errorData.description || 'Unknown error'}`);
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending order to Telegram:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Test connection method
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Telegram bot not configured. Please check environment variables.');
      }

      const testMessage = `🧪 *Test de Conexión - ELYSIUM CAFÉ*\n\nConexión establecida correctamente ✅\n\n${new Date().toLocaleString('es-MX')}`;
      const telegramApiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: testMessage,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API error: ${errorData.description || 'Unknown error'}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error testing Telegram connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramService();