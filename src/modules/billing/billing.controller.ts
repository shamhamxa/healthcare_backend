import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import {
  ListInvoicesDto,
  RecordPaymentDto,
  RefundDto,
  UpdateInvoiceDto,
} from './dto/billing.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  @RequirePermissions('billing.read')
  list(@CurrentUser() user: AuthenticatedUser, @Query() dto: ListInvoicesDto) {
    return this.billingService.list(user, dto);
  }

  @Get('invoices/:id')
  @RequirePermissions('billing.read')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.billingService.findOne(user, id);
  }

  @Patch('invoices/:id')
  @RequirePermissions('billing.collect')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.billingService.update(user, id, dto);
  }

  @Post('invoices/:id/payments')
  @RequirePermissions('billing.collect')
  recordPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.billingService.recordPayment(user, id, dto);
  }

  @Get('payments/:id/receipt')
  @RequirePermissions('billing.read')
  receipt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.billingService.receipt(user, id);
  }

  @Post('payments/:id/refund')
  @RequirePermissions('billing.refund')
  refund(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RefundDto,
  ) {
    return this.billingService.refund(user, id, dto);
  }
}
