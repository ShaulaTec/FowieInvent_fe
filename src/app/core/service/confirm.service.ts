import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';

export interface DeleteWithInputOptions {
    nombre: string;
    mensaje?: string;
    onAccept: () => void;
    onReject?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
    private cs = inject(ConfirmationService);

    // Canal para el diálogo custom
    private _deleteWithInput$ = new Subject<DeleteWithInputOptions | null>();
    deleteWithInput$ = this._deleteWithInput$.asObservable();

    delete(options: {
        nombre: string;
        onAccept: () => void;
        onReject?: () => void;
    }) {
        this.cs.confirm({
            header: '¿Eliminar?',
            message: `Estás a punto de eliminar <strong>${options.nombre}</strong>. Esta acción no se puede deshacer.`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
            accept: options.onAccept,
            reject: options.onReject,
        });
    }

    deleteWithInput(options: DeleteWithInputOptions) {
        this._deleteWithInput$.next(options);
    }

    closeDeleteWithInput() {
        this._deleteWithInput$.next(null);
    }
}