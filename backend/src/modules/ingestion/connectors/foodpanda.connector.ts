import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ThirdPartyConnector, IntermediateOrder, PaymentInfo } from './interfaces';
import { OrderStatus, SourceType } from '../../../common/constants';

@Injectable()
export class FoodpandaConnector extends ThirdPartyConnector {
  readonly sourceType = SourceType.FOODPANDA;

  validateRequest(payload: any): boolean {
    if (!payload) return false;
    if (!payload.order_id) return false;
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) return false;
    return true;
  }

  extractSourceOrderId(payload: any): string {
    if (!payload.order_id) throw new Error('Missing order_id in Foodpanda payload');
    return String(payload.order_id);
  }

  buildIdempotencyKey(payload: any): string {
    const orderId = this.extractSourceOrderId(payload);
    const ts = payload.event_timestamp || payload.created_at || Date.now();
    return `foodpanda:${orderId}:${ts}`;
  }

  toIntermediateOrder(payload: any): IntermediateOrder {
    return {
      sourceOrderId: this.extractSourceOrderId(payload),
      customer: {
        name: payload.customer?.name || payload.delivery?.name || '',
        phone: payload.customer?.phone || payload.delivery?.phone || '',
        email: payload.customer?.email,
        address: payload.delivery?.address || payload.customer?.address,
      },
      items: (payload.items || []).map((item: any) => ({
        name: item.name || item.product_name,
        quantity: item.quantity || 1,
        price: item.unit_price || item.price || 0,
        notes: item.special_instructions,
      })),
      total: payload.total_amount || payload.total || 0,
      subtotal: payload.subtotal,
      taxAmount: payload.tax_amount,
      deliveryFee: payload.delivery_fee,
      discountAmount: payload.discount_amount,
      currency: payload.currency || 'BDT',
      paymentMethod: payload.payment?.method || 'ONLINE',
      specialInstructions: payload.special_instructions,
      branchId: payload.restaurant_id || payload.branch_id,
      metadata: { source: 'foodpanda', platform_order_id: payload.order_id },
    };
  }

  mapStatus(sourceStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      new: OrderStatus.PENDING,
      accepted: OrderStatus.CONFIRMED,
      confirmed: OrderStatus.CONFIRMED,
      preparing: OrderStatus.PROCESSING,
      ready: OrderStatus.READY,
      picked_up: OrderStatus.DISPATCHED,
      delivered: OrderStatus.DELIVERED,
      failed: OrderStatus.CANCELLED,
      cancelled: OrderStatus.CANCELLED,
    };
    return statusMap[sourceStatus?.toLowerCase()] || OrderStatus.PENDING;
  }

  mapPayment(sourcePayment: any): PaymentInfo {
    return {
      method: sourcePayment?.method || 'ONLINE',
      amount: sourcePayment?.amount,
      status: sourcePayment?.status || 'paid',
      transactionId: sourcePayment?.transaction_id,
    };
  }

  verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
    const computed = crypto.createHmac('sha256', secret).update(payload).digest('base64');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  }

  validateApiKey(apiKey: string): boolean {
    return !!apiKey && apiKey.length > 0;
  }
}
