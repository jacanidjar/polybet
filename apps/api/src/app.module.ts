import { Module } from '@nestjs/common';
import { AgentController } from './agent/agent.controller';
import { AgentService } from './agent/agent.service';
import { PrismaModule } from './prisma/prisma.module';
import { MarketsModule } from './markets/markets.module';
import { TradesModule } from './trades/trades.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';

import { FaucetModule } from './faucet/faucet.module';

@Module({
    imports: [PrismaModule, MarketsModule, TradesModule, UsersModule, CommentsModule, FaucetModule],
    controllers: [AgentController],
    providers: [AgentService],
})
export class AppModule { }
