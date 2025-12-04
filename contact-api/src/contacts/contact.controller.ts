import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
} from "@nestjs/common";

import { ApiResponse } from "../shared/responses/api-response.dto";
import { ContactsService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    const contact = await this.contactsService.create(createContactDto);
    return ApiResponse.success('Kontak berhasil dibuat', contact);
  }

  @Get()
  async findAll() {
    const contacts = await this.contactsService.findAll();
    return ApiResponse.success('Daftar kontak berhasil diambil', contacts);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    const contacts = await this.contactsService.search(query);
    return ApiResponse.success('Hasil pencarian berhasil diambil', contacts);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contact = await this.contactsService.findOne(id);
    return ApiResponse.success('Kontak berhasil ditemukan', contact);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    const contact = await this.contactsService.update(id, updateContactDto);
    return ApiResponse.success('Kontak berhasil diupdate', contact);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.contactsService.remove(id);
    return ApiResponse.success('Kontak berhasil dihapus', null);
  }
}
