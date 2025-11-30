import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    description: 'Task status',
    example: 'IN_PROGRESS',
  })
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Completed pomodoros',
    minimum: 0,
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  completedPomodoros?: number;
}
