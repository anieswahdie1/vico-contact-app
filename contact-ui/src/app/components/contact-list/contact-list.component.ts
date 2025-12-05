import { debounceTime, distinctUntilChanged, Subject, Subscription } from "rxjs";

import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ContactFormComponent } from "../contact-form/contact-form.component";
import { Contact } from "../models/contact.model";
import { ContactService } from "../services/contact.service";

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  // styleUrls: ['./contact-list.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ContactFormComponent],
})
export class ContactListComponent implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  selectedContact: Contact | null = null;
  isFormVisible = false;
  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();

    // Setup search with debounce
    const searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.onSearch(searchTerm);
      });

    this.subscriptions.push(searchSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadContacts(): void {
    this.isLoading = true;
    this.error = null;

    const subscription = this.contactService.getContacts().subscribe({
      next: (response) => {
        this.contacts = response.data;
        this.filteredContacts = [...this.contacts];
        this.totalItems = this.contacts.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.error = 'Gagal memuat data kontak. Silakan coba lagi.';
        this.isLoading = false;
      },
    });

    this.subscriptions.push(subscription);
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
      this.totalItems = this.contacts.length;
      this.currentPage = 1;
      return;
    }

    this.isLoading = true;

    const subscription = this.contactService.searchContacts(searchTerm).subscribe({
      next: (response) => {
        this.filteredContacts = response.data;
        this.totalItems = this.filteredContacts.length;
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching contacts:', error);
        // Fallback to client-side search if API fails
        this.filteredContacts = this.contacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm)
        );
        this.totalItems = this.filteredContacts.length;
        this.currentPage = 1;
        this.isLoading = false;
      },
    });

    this.subscriptions.push(subscription);
  }

  get paginatedContacts(): Contact[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredContacts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  addContact(): void {
    this.selectedContact = null;
    this.isEditMode = false;
    this.isFormVisible = true;
  }

  editContact(contact: Contact): void {
    this.selectedContact = { ...contact };
    this.isEditMode = true;
    this.isFormVisible = true;
  }

  deleteContact(id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus kontak ini?')) {
      const subscription = this.contactService.deleteContact(id).subscribe({
        next: () => {
          this.contacts = this.contacts.filter((c) => c._id !== id);
          this.filteredContacts = this.filteredContacts.filter((c) => c._id !== id);
          this.totalItems = this.filteredContacts.length;
          // Adjust page if current page becomes empty
          if (this.paginatedContacts.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
          alert('Gagal menghapus kontak. Silakan coba lagi.');
        },
      });

      this.subscriptions.push(subscription);
    }
  }

  handleFormSubmit(contact: Contact): void {
    if (this.isEditMode && this.selectedContact?._id) {
      this.updateContact(this.selectedContact._id, contact);
    } else {
      this.createContact(contact);
    }
  }

  createContact(contact: Contact): void {
    const subscription = this.contactService.createContact(contact).subscribe({
      next: (response) => {
        this.contacts.unshift(response.data);
        this.filteredContacts.unshift(response.data);
        this.totalItems = this.filteredContacts.length;
        this.isFormVisible = false;
        alert('Kontak berhasil ditambahkan!');
      },
      error: (error) => {
        console.error('Error creating contact:', error);
        alert('Gagal menambahkan kontak. Silakan coba lagi.');
      },
    });

    this.subscriptions.push(subscription);
  }

  updateContact(id: string, contact: Contact): void {
    const subscription = this.contactService.updateContact(id, contact).subscribe({
      next: (response) => {
        const index = this.contacts.findIndex((c) => c._id === id);
        if (index !== -1) {
          this.contacts[index] = response.data;
        }

        const filteredIndex = this.filteredContacts.findIndex((c) => c._id === id);
        if (filteredIndex !== -1) {
          this.filteredContacts[filteredIndex] = response.data;
        }

        this.isFormVisible = false;
        this.selectedContact = null;
        alert('Kontak berhasil diperbarui!');
      },
      error: (error) => {
        console.error('Error updating contact:', error);
        alert('Gagal memperbarui kontak. Silakan coba lagi.');
      },
    });

    this.subscriptions.push(subscription);
  }

  handleFormCancel(): void {
    this.isFormVisible = false;
    this.selectedContact = null;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
