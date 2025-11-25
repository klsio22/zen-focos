import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ResumeSessionDto {
  @ApiProperty({ description: 'Remaining seconds to resume', minimum: 0, example: 1200 })
  @IsInt()
  @Min(0)
  remainingSeconds: number;
}
