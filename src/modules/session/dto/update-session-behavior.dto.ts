import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateSessionBehaviorDto {
  @ApiProperty({
    description:
      'Enable keep-alive behavior for this session. When enabled, OpenWA auto-starts previously authenticated sessions on app boot and auto-reconnects them after unexpected disconnects. A manual Stop pauses the behavior until the operator starts the session again.',
    example: true,
  })
  @IsBoolean()
  autoRestartEnabled: boolean;
}
