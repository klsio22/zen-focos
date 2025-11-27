import { IsNumber, IsString, IsOptional, IsDate, Min } from 'class-validator';

export class CreatePomodoroBreakDto {
  @IsString()
  sessionId: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsString()
  type: 'short' | 'long';

  @IsOptional()
  @IsDate()
  startTime?: Date;
}
