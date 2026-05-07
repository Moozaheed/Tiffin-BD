import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ThirdPartyConnector, IntermediateOrder, PaymentInfo } from './interfaces';
import { OrderStatus, SourceType } from '../../../common/constants';

@Injectable()
export class FoodiConnector extends ThirdPartyConnector {
  readonly sourceType = SourceType.FOODI;

  validateRequest(payload: any): boolean {
    if (!payload) return false;
    if (!payload.order_id) return false;
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) return false;
    return true;
  }

  extractSourceOrderId(payload: any): string {
    if (!payload.order_id) throw new Error('Missing order_id in Foodi payload');
    return String(payload.order_id);
  }

  buildIdempotencyKey(payload: any): string {
    const orderId = this.extractSourceOrderId(payload);
    const ts = payload.created_at ? new Date(payload.created_at).getTime() : Date.now();
    return `foodi:${orderId}:${ts}`;
  }

  toIntermediateOrder(payload: any): IntermediateOrder {
    return {
      sourceOrderId: this.extractSourceOrderId(payload),
      customer: {
        name: payload.customer?.name || '',
        phone: payload.customer?.phone || '',
        email: payload.customer?.email,
        address: payload.address?.full_address || payload.customer?.address,
      },
      items: (payload.items || []).map((item: any) => ({
        name: item.name || item.title,
        quantity: item.quantity || 1,
        price: item.price || 0,
        notes: item.notes,
      })),
      total: payload.total || payload.grand_total || 0,
      subtotal: payload.subtotal,
      taxAmount: payload.vat,
      deliveryFee: payload.delivery_charge,
      discountAmount: payload.discount,
      currency: 'BDT',
      paymentMethod: payload.payment_method || 'ONLINE',
      specialInstructions: payload.note,
      branchId: payload.branch_id,
      metadata: { source: 'foodi', platform_order_id: payload.order_id },
    };
  }

  mapStatus(sourceStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      pending: OrderStatus.PENDING,
      confirmed: OrderStatus.CONFIRMED,
      cooking: OrderStatus.PROCESSING,
      ready: OrderStatus.READY,
      on_the_way: OrderStatus.DISPATCHED,
      delivered: OrderStatus.DELIVERED,
      cancelled: OrderStatus.CANCELLED,
    };
    return statusMap[sourceStatus?.toLowerCase()] || OrderStatus.PENDING;
  }

  mapPayment(sourcePayment: any): PaymentInfo {
    return {
      method: sourcePayment?.method || 'ONLINE',
      amount: sourcePayment?.amount,
      status: sourcePayment?.status || 'paid',
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
