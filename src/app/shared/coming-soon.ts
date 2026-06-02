import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center py-12">
      <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
        <div class="bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-20 flex flex-col items-center text-center" style="border-radius: 53px; max-width: 480px">
          <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border mb-6" style="height: 4rem; width: 4rem">
            <i class="pi pi-wrench text-2xl"></i>
          </span>
          <h2 class="text-surface-900 dark:text-surface-0 font-bold text-2xl mb-2">En construcción</h2>
          <p class="text-surface-600 dark:text-surface-200 m-0">{{ mensaje }}</p>
        </div>
      </div>
    </div>
  `,
})
export class ComingSoon {
  @Input() mensaje = 'Seguimos trabajando en esto para brindarte un mejor servicio.';
}