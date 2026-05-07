import { OrderStatus } from '../../../common/constants';

export interface IntermediateOrder {
  sourceOrderId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  total: number;
  subtotal?: number;
  taxAmount?: number;
  deliveryFee?: number;
  discountAmount?: number;
  currency?: string;
  paymentMethod: string;
  paymentStatus?: string;
  specialInstructions?: string;
  branchId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInfo {
  method: string;
  amount?: number;
  status?: string;
  transactionId?: string;
}

export abstract class BaseConnector {
  abstract readonly sourceType: string;

  abstract validateRequest(payload: any): boolean;

  abstract extractSourceOrderId(payload: any): string;

  abstract buildIdempotencyKey(payload: any): string;

  abstract toIntermediateOrder(payload: any): IntermediateOrder;

  abstract mapStatus(sourceStatus: string): OrderStatus;

  abstract mapPayment(sourcePayment: any): PaymentInfo;
}

export abstract class ThirdPartyConnector extends BaseConnector {
  abstract verifyHmacSignature(payload: string, signature: string, secret: string): boolean;

  abstract validateApiKey(apiKey: string): boolean;

  validateWebhookTimestamp(timestamp: string, windowMs = 300000): boolean {
    const ts = new Date(timestamp).getTime();
    const now = Date.now();
    return Math.abs(now - ts) <= windowMs;
  }
}
