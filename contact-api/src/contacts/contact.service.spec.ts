import { ConflictException, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";

import { ContactsService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { Contact } from "./entities/contact.entity";

describe('ContactsService', () => {
  let service: ContactsService;
  let mockModel: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockConstructor = jest.fn().mockImplementation(dto => ({
      ...dto,
      save: jest.fn().mockResolvedValue({
        _id: 'some-id',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }));

    mockModel = Object.assign(mockConstructor, {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getModelToken(Contact.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact successfully', async () => {
      const dto: CreateContactDto = {
        name: 'Muhammad Hafidz',
        phone: '+628123456789',
        email: 'hfz@gmail.com',
      };

      mockModel.findOne.mockResolvedValue(null);

      const result = await service.create(dto);

      expect(mockModel.findOne).toHaveBeenCalledWith({ phone: dto.phone });
      expect(mockModel).toHaveBeenCalledWith(dto);
      expect(result._id).toBe('some-id');
    });

    it('should throw ConflictException if phone exists', async () => {
      mockModel.findOne.mockResolvedValue({ _id: 'x', phone: '123' });

      await expect(
        service.create({
          name: 'anies',
          phone: '123',
          email: 'anies@gmail.com',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all contacts', async () => {
      const contacts = [{ _id: '1' }];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(contacts),
      };

      mockModel.find.mockReturnValue(mockQuery);

      expect(await service.findAll()).toEqual(contacts);
    });
  });

  describe('findOne', () => {
    it('should return contact if found', async () => {
      const contact = { _id: '123' };

      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(contact),
      });

      expect(await service.findOne('123')).toEqual(contact);
    });

    it('should throw NotFoundException if missing', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update successfully', async () => {
      const updated = { _id: '123', name: 'Updated' };

      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });

      expect(await service.update('123', { name: 'Updated' })).toEqual(updated);
    });

    it('should throw ConflictException on duplicate key', async () => {
      const err: any = new Error('duplicate');
      err.code = 11000;

      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(err),
      });

      await expect(service.update('123', {})).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete successfully', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '123' }),
      });

      await service.remove('123');
    });

    it('should throw NotFoundException if missing', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should return matched results', async () => {
      const contacts = [{ _id: '1' }];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(contacts),
      });

      expect(await service.search('john')).toEqual(contacts);
    });

    it('should return all if empty query', async () => {
      const contacts = [{ _id: '1' }];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(contacts),
      };

      mockModel.find.mockReturnValue(mockQuery);

      expect(await service.search('')).toEqual(contacts);
    });
  });
});
