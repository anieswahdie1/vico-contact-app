import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ConfirmDialogComponent {
  @Input() title = 'Konfirmasi';
  @Input() message = 'Apakah Anda yakin ingin menghapus item ini?';
  @Input() confirmText = 'Ya';
  @Input() cancelText = 'Tidak';
  @Input() isVisible = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
    this.isVisible = false;
  }

  onCancel(): void {
    this.cancel.emit();
    this.isVisible = false;
  }
}
