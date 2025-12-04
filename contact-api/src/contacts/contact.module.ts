import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ContactsController } from './contact.controller';
import { ContactsService } from './contact.service';
import { Contact, ContactSchema } from './entities/contact.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
