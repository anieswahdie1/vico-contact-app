import { Observable } from "rxjs";

import { Injectable } from "@angular/core";

import { ApiResponse } from "../interfaces/api-response.interface";
import { Contact } from "../models/contact.model";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly ENDPOINT = '/contacts';

  constructor(private apiService: ApiService) {}

  getContacts(): Observable<ApiResponse<Contact[]>> {
    return this.apiService.get<Contact[]>(this.ENDPOINT);
  }

  searchContacts(query: string): Observable<ApiResponse<Contact[]>> {
    return this.apiService.get<Contact[]>(`${this.ENDPOINT}/search`, { q: query });
  }

  getContactById(id: string): Observable<ApiResponse<Contact>> {
    return this.apiService.get<Contact>(`${this.ENDPOINT}/${id}`);
  }

  createContact(contact: Contact): Observable<ApiResponse<Contact>> {
    return this.apiService.post<Contact>(this.ENDPOINT, contact);
  }

  updateContact(id: string, contact: Contact): Observable<ApiResponse<Contact>> {
    return this.apiService.patch<Contact>(`${this.ENDPOINT}/${id}`, contact);
  }

  deleteContact(id: string): Observable<ApiResponse<Contact>> {
    return this.apiService.delete<Contact>(`${this.ENDPOINT}/${id}`);
  }
}