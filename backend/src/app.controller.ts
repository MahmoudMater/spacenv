import { Controller, Get } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('auth')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'API is running',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        version: '1.0',
      },
    },
  })
  health(): { status: string; timestamp: string; version: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
  }

  @ApiCookieAuth('access_token')
  @Get()
  @ApiOperation({
    summary: 'Hello (smoke test)',
    description: 'Simple authenticated ping — confirms session cookie is accepted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Greeting string',
    schema: { type: 'string', example: 'Hello World!' },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid session' })
  getHello(): string {
    return this.appService.getHello();
  }
}
