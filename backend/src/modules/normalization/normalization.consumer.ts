import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { NormalizationService } from './normalization.service';
import { LoggerService } from '../../common/logger/logger.service';
import { RABBITMQ_CONSTANTS } from '../../common/constants';

interface NormalizationMessage {
  rawOrderId: string;
  correlationId?: string;
  attempt?: number;
}

@Injectable()
export class NormalizationConsumer {
  constructor(
    private readonly normalizationService: NormalizationService,
    private readonly logger: LoggerService,
  ) {}

  @RabbitSubscribe({
    exchange: RABBITMQ_CONSTANTS.EXCHANGE,
    routingKey: RABBITMQ_CONSTANTS.NORMALIZATION_ROUTING_KEY,
    queue: RABBITMQ_CONSTANTS.NORMALIZATION_QUEUE,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': RABBITMQ_CONSTANTS.DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key': RABBITMQ_CONSTANTS.DEAD_LETTER_ROUTING_KEY,
      },
    },
  })
  async handleNormalization(msg: NormalizationMessage): Promise<void | Nack> {
    const { rawOrderId, correlationId, attempt = 1 } = msg;

    this.logger.info(
      `Processing normalization for raw order ${rawOrderId} (attempt ${attempt})`,
      'NormalizationConsumer',
      { correlationId },
    );

    try {
      const normalized = await this.normalizationService.normalizeRawOrder(rawOrderId);

      this.logger.info(
        `Normalized order ${normalized.canonicalOrderNo} from raw ${rawOrderId}`,
        'NormalizationConsumer',
        {
          normalizedId: normalized.id,
          branchId: normalized.branchId,
          correlationId,
        },
      );
    } catch (err: any) {
      this.logger.error(
        `Normalization failed for raw order ${rawOrderId} (attempt ${attempt})`,
        err,
        'NormalizationConsumer',
      );

      if (attempt < RABBITMQ_CONSTANTS.MAX_RETRIES) {
        await this.retryWithDelay(rawOrderId, correlationId, attempt);
        return;
      }

      this.logger.error(
        `Max retries reached for raw order ${rawOrderId}, sending to DLQ`,
        err,
        'NormalizationConsumer',
      );
      return new Nack(false);
    }
  }

  private async retryWithDelay(
    rawOrderId: string,
    correlationId?: string,
    currentAttempt = 1,
  ): Promise<void> {
    const delayMs = Math.pow(2, currentAttempt) * 1000;

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    await this.normalizationService.enqueueRawOrder(rawOrderId);
  }
}
