import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '@prisma/generated';

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

  @ApiPropertyOptional({
    enum: TaskStatus,
    description: 'Task status',
    example: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ description: 'Estimated pomodoros', minimum: 1, example: 3 })
  @IsInt()
  @Min(1)
  estimatedPomodoros: number;

  @ApiPropertyOptional({
    description: 'Completed pomodoros',
    minimum: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  completedPomodoros?: number;
}
