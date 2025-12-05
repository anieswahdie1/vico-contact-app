import { debounceTime, distinctUntilChanged, Subject, Subscription } from "rxjs";

import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
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

  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(private contactService: ContactService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('ContactListComponent initialized');
    this.loadContacts();

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
    console.log('Loading contacts...');
    this.isLoading = true;
    this.error = null;

    const subscription = this.contactService.getContacts().subscribe({
      next: (response) => {
        console.log('Contacts loaded:', response.data.length);
        console.log('Number of contacts:', response.data.length);

        this.contacts = response.data;
        this.filteredContacts = [...this.contacts];
        this.totalItems = this.contacts.length;
        this.isLoading = false;

        console.log('Contacts array:', this.contacts);
        console.log('isLoading set to:', this.isLoading);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.error = 'Gagal memuat data kontak. Silakan coba lagi.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Request completed');
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
      const deleteButton = event?.target as HTMLElement;
      const originalText = deleteButton.innerHTML;
      deleteButton.innerHTML = '<span class="animate-spin">⏳</span> Menghapus...';
      deleteButton.setAttribute('disabled', 'true');

      const subscription = this.contactService.deleteContact(id).subscribe({
        next: (response) => {
          console.log('Delete successful:', response);

          this.contacts = this.contacts.filter((c) => c._id !== id);
          this.filteredContacts = this.filteredContacts.filter((c) => c._id !== id);

          this.totalItems = this.filteredContacts.length;

          if (this.paginatedContacts.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }

          this.cdr.detectChanges();

          this.showToast('Kontak berhasil dihapus!', 'success');

          console.log('After delete - contacts:', this.contacts.length);
        },
        error: (error) => {
          console.error('Error deleting contact:', error);

          deleteButton.innerHTML = originalText;
          deleteButton.removeAttribute('disabled');
          this.showToast('Gagal menghapus kontak. Silakan coba lagi.', 'error');
        },
        complete: () => {
          deleteButton.innerHTML = originalText;
          deleteButton.removeAttribute('disabled');
        },
      });

      this.subscriptions.push(subscription);
    }
  }

  handleFormSubmit(event: { contact: Contact; callback: () => void }): void {
    if (this.isEditMode && this.selectedContact?._id) {
      this.updateContact(this.selectedContact._id, event.contact, event.callback);
    } else {
      this.createContact(event.contact, event.callback);
    }
  }

  createContact(contact: Contact, callback: () => void): void {
    const subscription = this.contactService.createContact(contact).subscribe({
      next: (response) => {
        console.log('Create successful:', response);

        // Tambahkan ke array
        this.contacts.unshift(response.data);
        this.filteredContacts.unshift(response.data);
        this.totalItems = this.filteredContacts.length;

        // Reset form state melalui callback
        callback();

        // Sembunyikan form
        this.isFormVisible = false;

        // Force UI update
        this.cdr.detectChanges();

        // Show success message
        this.showToast('Kontak berhasil ditambahkan!', 'success');

        // Reset pagination ke halaman 1
        this.currentPage = 1;

        console.log('After create - contacts:', this.contacts.length);
      },
      error: (error) => {
        console.error('Error creating contact:', error);

        // Reset form state (supaya button tidak stuck)
        callback();

        // Show error message
        this.showToast('Gagal menambahkan kontak. Silakan coba lagi.', 'error');
      },
    });

    this.subscriptions.push(subscription);
  }

  updateContact(id: string, contact: Contact, callback: () => void): void {
    const subscription = this.contactService.updateContact(id, contact).subscribe({
      next: (response) => {
        console.log('Update successful:', response);

        const index = this.contacts.findIndex((c) => c._id === id);
        if (index !== -1) {
          this.contacts[index] = response.data;
        }

        const filteredIndex = this.filteredContacts.findIndex((c) => c._id === id);
        if (filteredIndex !== -1) {
          this.filteredContacts[filteredIndex] = response.data;
        }

        callback();

        this.isFormVisible = false;
        this.selectedContact = null;

        this.cdr.detectChanges();

        this.showToast('Kontak berhasil diperbarui!', 'success');
      },
      error: (error) => {
        console.error('Error updating contact:', error);

        callback();

        this.showToast('Gagal memperbarui kontak. Silakan coba lagi.', 'error');
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

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full opacity-0 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}
