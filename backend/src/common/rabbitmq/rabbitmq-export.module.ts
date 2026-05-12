import { Module } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Module({
  providers: [
    {
      provide: AmqpConnection,
      useValue: undefined, // Will be injected from global
    },
  ],
  exports: [AmqpConnection],
})
export class RabbitMQExportModule {}
