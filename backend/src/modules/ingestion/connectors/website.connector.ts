import { Injectable } from '@nestjs/common';
import { BaseConnector, IntermediateOrder, PaymentInfo } from './interfaces';
import { OrderStatus, SourceType } from '../../../common/constants';

@Injectable()
export class WebsiteConnector extends BaseConnector {
  readonly sourceType = SourceType.WEBSITE;

  validateRequest(payload: any): boolean {
    if (!payload) return false;
    if (!payload.order_id && !payload.order_number) return false;
    if (!payload.customer?.name || !payload.customer?.phone) return false;
    if (!Array.isArray(payload.items) || payload.items.length === 0) return false;
    if (!payload.total || payload.total <= 0) return false;
    return true;
  }

  extractSourceOrderId(payload: any): string {
    const id = payload.order_id || payload.order_number;
    if (!id) throw new Error('Missing order_id in website payload');
    return String(id);
  }

  buildIdempotencyKey(payload: any): string {
    const orderId = this.extractSourceOrderId(payload);
    const ts = payload.created_at ? new Date(payload.created_at).getTime() : Date.now();
    return `website:${orderId}:${ts}`;
  }

  toIntermediateOrder(payload: any): IntermediateOrder {
    return {
      sourceOrderId: this.extractSourceOrderId(payload),
      customer: {
        name: payload.customer.name,
        phone: payload.customer.phone,
        email: payload.customer.email,
        address: payload.customer.address || payload.delivery_address,
      },
      items: (payload.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        notes: item.notes,
      })),
      total: payload.total,
      subtotal: payload.subtotal,
      taxAmount: payload.tax,
      deliveryFee: payload.delivery_fee,
      discountAmount: payload.discount,
      currency: payload.currency || 'BDT',
      paymentMethod: payload.payment_method || 'CASH',
      specialInstructions: payload.special_instructions,
      branchId: payload.branch_id,
      metadata: { source: 'website', originalPayload: payload },
    };
  }

  mapStatus(sourceStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      pending: OrderStatus.PENDING,
      confirmed: OrderStatus.CONFIRMED,
      completed: OrderStatus.DELIVERED,
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
}
