import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ThirdPartyConnector, IntermediateOrder, PaymentInfo } from './interfaces';
import { OrderStatus, SourceType } from '../../../common/constants';

@Injectable()
export class PathaoConnector extends ThirdPartyConnector {
  readonly sourceType = SourceType.PATHAO;

  validateRequest(payload: any): boolean {
    if (!payload) return false;
    if (!payload.order_id) return false;
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) return false;
    return true;
  }

  extractSourceOrderId(payload: any): string {
    if (!payload.order_id) throw new Error('Missing order_id in Pathao payload');
    return String(payload.order_id);
  }

  buildIdempotencyKey(payload: any): string {
    const orderId = this.extractSourceOrderId(payload);
    const ts = payload.timestamp || Date.now();
    return `pathao:${orderId}:${ts}`;
  }

  toIntermediateOrder(payload: any): IntermediateOrder {
    return {
      sourceOrderId: this.extractSourceOrderId(payload),
      customer: {
        name: payload.customer?.name || payload.recipient?.name || '',
        phone: payload.customer?.phone || payload.recipient?.phone || '',
        email: payload.customer?.email,
        address: payload.delivery_location?.address || payload.customer?.address,
      },
      items: (payload.items || []).map((item: any) => ({
        name: item.name || item.item_name,
        quantity: item.quantity || 1,
        price: item.price || item.unit_price || 0,
        notes: item.special_note,
      })),
      total: payload.total || payload.order_total || 0,
      subtotal: payload.subtotal,
      taxAmount: payload.tax,
      deliveryFee: payload.delivery_fee,
      discountAmount: payload.discount,
      currency: 'BDT',
      paymentMethod: payload.payment_method || 'CASH',
      specialInstructions: payload.instructions,
      branchId: payload.branch_id || payload.store_id,
      metadata: { source: 'pathao', platform_order_id: payload.order_id },
    };
  }

  mapStatus(sourceStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      new: OrderStatus.PENDING,
      accepted: OrderStatus.CONFIRMED,
      preparing: OrderStatus.PROCESSING,
      ready: OrderStatus.READY,
      on_the_way: OrderStatus.DISPATCHED,
      delivered: OrderStatus.DELIVERED,
      cancelled: OrderStatus.CANCELLED,
    };
    return statusMap[sourceStatus?.toLowerCase()] || OrderStatus.PENDING;
  }

  mapPayment(sourcePayment: any): PaymentInfo {
    return {
      method: sourcePayment?.method || 'CASH',
      amount: sourcePayment?.amount,
      status: sourcePayment?.status || 'pending',
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
