import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    maxLength: 255,
    example: 'Complete project documentation',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Write comprehensive documentation for the project',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Estimated pomodoros', minimum: 1, example: 3 })
  @IsInt()
  @Min(1)
  estimatedPomodoros: number;
}
