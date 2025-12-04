import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  @Matches(/^[+]?[0-9\s-]+$/, {
    message: 'Nomor telepon tidak valid',
  })
  phone: string;

  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;
}
