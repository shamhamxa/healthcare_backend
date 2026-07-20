import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NumberingService } from './numbering.service';

@Global()
@Module({
  providers: [PrismaService, NumberingService],
  exports: [PrismaService, NumberingService],
})
export class PrismaModule {}
