import { Subscription } from "rxjs";

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

import { Contact } from "../models/contact.model";

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  // styleUrls: ['./contact-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ContactFormComponent implements OnInit {
  @Input() contact: Contact | null = null;
  @Input() isEditMode = false;
  @Output() submitForm = new EventEmitter<{ contact: Contact; callback: () => void }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  contactForm: FormGroup;
  isSubmitting = false;

  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,13}$/)]],
    });
  }

  ngOnInit(): void {
    if (this.contact) {
      this.contactForm.patchValue(this.contact);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get name() {
    return this.contactForm.get('name');
  }
  get email() {
    return this.contactForm.get('email');
  }
  get phone() {
    return this.contactForm.get('phone');
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      this.submitForm.emit({
        contact: this.contactForm.value,
        callback: () => {
          // Callback ini akan dipanggil oleh parent setelah sukses
          this.resetFormState();
        },
      });
    } else {
      Object.keys(this.contactForm.controls).forEach((key) => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  resetFormState(): void {
    this.isSubmitting = false;

    if (!this.isEditMode) {
      // Jika add mode, reset form
      this.contactForm.reset();
      Object.keys(this.contactForm.controls).forEach((key) => {
        const control = this.contactForm.get(key);
        control?.setErrors(null);
        control?.markAsPristine();
        control?.markAsUntouched();
      });
    }
  }

  resetForm(): void {
    this.contactForm.reset();
    if (this.contact) {
      this.contactForm.patchValue(this.contact);
    }
  }
}
