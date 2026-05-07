import {
  Controller,
  Post,
  Body,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IngestionService } from './ingestion.service';
import { WebsiteOrderDto } from './dto';
import { Public } from '../../common/decorators';
import { RATE_LIMIT_CONSTANTS } from '../../common/constants';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Public()
  @Post('website/orders')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestWebsiteOrder(@Body() dto: WebsiteOrderDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.ingestionService.ingestWebsiteOrder(dto, dto.branch_id);

    res.setHeader('X-Correlation-ID', result.correlationId);
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_CONSTANTS.SUSTAINED_LIMIT);
    res.setHeader('X-RateLimit-Window', '60');
    res.setHeader('X-RateLimit-Burst-Limit', RATE_LIMIT_CONSTANTS.BURST_LIMIT);

    return {
      statusCode: HttpStatus.ACCEPTED,
      ...result,
    };
  }

  @Public()
  @Post('third-party/:source/webhook')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestThirdPartyOrder(
    @Param('source') source: string,
    @Body() body: any,
    @Headers('x-signature') signature: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawBody = JSON.stringify(body);
    const result = await this.ingestionService.ingestThirdPartyOrder(source, body, rawBody, signature);

    res.setHeader('X-Correlation-ID', result.correlationId);

    return {
      statusCode: HttpStatus.ACCEPTED,
      ...result,
    };
  }

  @Public()
  @Post('third-party/:source/test')
  @HttpCode(HttpStatus.OK)
  async testConnectivity(@Param('source') source: string) {
    return {
      statusCode: HttpStatus.OK,
      message: `Connectivity test successful for source: ${source}`,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('chilli-bridge/orders')
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestChilliPosOrder(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.ingestionService.ingestChilliPosOrder(body);

    res.setHeader('X-Correlation-ID', result.correlationId);

    return {
      statusCode: HttpStatus.ACCEPTED,
      ...result,
    };
  }
}
