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
  @Output() submitForm = new EventEmitter<Contact>();
  @Output() cancel = new EventEmitter<void>();

  contactForm: FormGroup;
  isSubmitting = false;

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
      this.submitForm.emit(this.contactForm.value);
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

  resetForm(): void {
    this.contactForm.reset();
    if (this.contact) {
      this.contactForm.patchValue(this.contact);
    }
  }
}
