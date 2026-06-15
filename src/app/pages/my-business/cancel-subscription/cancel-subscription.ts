import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancel-subscription',
  imports: [CommonModule],
  templateUrl: './cancel-subscription.html',
  styleUrl: './cancel-subscription.scss'
})
export class CancelSubscription {
  // Controla la visibilidad del modal
  isOpen = false;

  // Emite el evento al padre cuando se confirma la acción
  @Output() confirmCancel = new EventEmitter<void>();

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  onConfirm() {
    this.confirmCancel.emit();
    this.closeModal();

  }

  
}