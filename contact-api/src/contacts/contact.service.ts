import { Model } from "mongoose";

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { Contact } from "./entities/contact.entity";

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

@Injectable()
export class ContactsService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      const existingContact = await this.contactModel.findOne({
        phone: createContactDto.phone,
      });

      if (existingContact) {
        throw new ConflictException('Nomor telepon sudah digunakan');
      }

      const createdContact = new this.contactModel(createContactDto);
      return await createdContact.save();
    } catch (error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 11000) {
        throw new ConflictException('Kombinasi nama dan nomor telepon sudah ada');
      }
      throw error;
    }
  }

  async findAll(): Promise<Contact[]> {
    return await this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactModel.findById(id).exec();
    if (!contact) {
      throw new NotFoundException(`Kontak dengan ID ${id} tidak ditemukan`);
    }
    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    try {
      const updatedContact = await this.contactModel
        .findByIdAndUpdate(
          id,
          { ...updateContactDto, updatedAt: new Date() },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedContact) {
        throw new NotFoundException(`Kontak dengan ID ${id} tidak ditemukan`);
      }

      return updatedContact;
    } catch (error) {
      const mongoError = error as MongoError;
      if (mongoError.code === 11000) {
        throw new ConflictException(
          'Data konflik: Nomor telepon atau kombinasi nama+phone sudah ada',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Kontak dengan ID ${id} tidak ditemukan`);
    }
  }

  async search(query: string): Promise<Contact[]> {
    if (!query.trim()) {
      return this.findAll();
    }

    return await this.contactModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
      .exec();
  }
}
