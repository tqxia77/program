import { Controller, Post, Get } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  async seedAll() {
    return this.seederService.seedAll();
  }

  @Get('status')
  async getStatus() {
    return this.seederService.getStatus();
  }
}
