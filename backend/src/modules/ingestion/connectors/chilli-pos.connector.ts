import { Injectable } from '@nestjs/common';
import { BaseConnector, IntermediateOrder, PaymentInfo } from './interfaces';
import { OrderStatus, SourceType } from '../../../common/constants';

@Injectable()
export class ChilliPosConnector extends BaseConnector {
  readonly sourceType = SourceType.CHILLI_POS;

  validateRequest(payload: any): boolean {
    if (!payload) return false;
    if (!payload.order_id && !payload.reference_no) return false;
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) return false;
    return true;
  }

  extractSourceOrderId(payload: any): string {
    const id = payload.order_id || payload.reference_no;
    if (!id) throw new Error('Missing order_id in Chilli POS payload');
    return String(id);
  }

  buildIdempotencyKey(payload: any): string {
    const orderId = this.extractSourceOrderId(payload);
    const ts = payload.created_timestamp || payload.created_at || Date.now();
    return `chilli-pos:${orderId}:${ts}`;
  }

  toIntermediateOrder(payload: any): IntermediateOrder {
    return {
      sourceOrderId: this.extractSourceOrderId(payload),
      customer: {
        name: payload.customer?.name || 'Walk-in',
        phone: payload.customer?.phone || '',
        email: payload.customer?.email,
        address: payload.customer?.address,
      },
      items: (payload.items || []).map((item: any) => ({
        name: item.name || item.product_name || item.description,
        quantity: item.quantity || item.qty || 1,
        price: item.price || item.unit_price || 0,
        notes: item.modifiers || item.notes,
      })),
      total: payload.total || payload.grand_total || payload.bill_total || 0,
      subtotal: payload.subtotal,
      taxAmount: payload.tax || payload.vat,
      discountAmount: payload.discount,
      currency: 'BDT',
      paymentMethod: payload.payment_type || payload.payment_method || 'CASH',
      specialInstructions: payload.kitchen_note || payload.special_instructions,
      branchId: payload.branch_id || payload.outlet_id,
      metadata: {
        source: 'chilli_pos',
        pos_terminal: payload.terminal_id,
        table_number: payload.table_no,
        order_type: payload.order_type,
      },
    };
  }

  mapStatus(sourceStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      new: OrderStatus.PENDING,
      open: OrderStatus.PENDING,
      accepted: OrderStatus.CONFIRMED,
      in_kitchen: OrderStatus.PROCESSING,
      ready: OrderStatus.READY,
      completed: OrderStatus.DELIVERED,
      cancelled: OrderStatus.CANCELLED,
      void: OrderStatus.CANCELLED,
    };
    return statusMap[sourceStatus?.toLowerCase()] || OrderStatus.PENDING;
  }

  mapPayment(sourcePayment: any): PaymentInfo {
    return {
      method: sourcePayment?.method || sourcePayment?.type || 'CASH',
      amount: sourcePayment?.amount,
      status: sourcePayment?.status || 'pending',
    };
  }
}
