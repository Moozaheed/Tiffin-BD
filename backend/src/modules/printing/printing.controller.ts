import { Controller } from '@nestjs/common';
import { PrintingService } from './printing.service';

@Controller('printing')
export class PrintingController {
  constructor(private readonly printingService: PrintingService) {}
}
