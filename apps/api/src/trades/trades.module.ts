import { Module } from '@nestjs/common';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [TradesController],
    providers: [TradesService],
})
export class TradesModule { }
