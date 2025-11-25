import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class PauseSessionDto {
  @ApiProperty({
    description: 'Remaining seconds when paused',
    minimum: 0,
    example: 1200,
  })
  @IsInt()
  @Min(0)
  remainingSeconds: number;
}
