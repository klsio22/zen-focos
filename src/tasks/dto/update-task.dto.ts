import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsInt, Min } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
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
