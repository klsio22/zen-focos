import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@zenfocos.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123456' })
  @IsString()
  @MinLength(6)
  password: string;
}
