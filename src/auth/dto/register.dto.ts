import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@zenfocos.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Usuário ZenFocos', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
