import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientControllerService } from '../../api/api/clientController.service';
import { ClientEdit } from '../../api/model/clientEdit';
import { AuthService } from '../../services/auth.service'; 
import { BillFilter } from '../../api/model/billFilter';

@Component({
  selector: 'app-client-detail-page',
  imports: [
    MatCard,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './client-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailPageComponent {
  clientForm!: FormGroup;
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);

  clientService = inject(ClientControllerService);
  authService = inject(AuthService);

  isAdmin = computed(() => {
    const user = this.authService.user();
    return !!user?.roles?.some((role) => role.name === 'ADMIN');
  });
  constructor() {
    this.clientForm = this.fb.group({
      id: [''],
      dni: ['', Validators.required],
      nombre: ['', Validators.required],
      pais: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      empresa: ['', Validators.required],
      direccion: ['', Validators.required],
    });

    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (clientId && clientId !== 'new') {
      this.clientService.getClientById(Number(clientId)).subscribe((client) => {
        if (client) {
          this.clientForm.patchValue(client);
        }
      });
    }
  }

  onSubmit($event: Event): void {
    $event.preventDefault();
    if (this.clientForm.valid) {
      const clientData = this.clientForm.getRawValue();
      const clientId = this.route.snapshot.paramMap.get('clientId');

      if (clientId === 'new') {
        delete clientData.id;
        this.clientService.createClient(clientData).subscribe({
          next: (createdClient) => {
            console.log('Cliente creado:', createdClient);
            this.router.navigate(['/clients']);
          },
          error: (err) => {
            console.error('Error al crear cliente:', err);
          },
        });
      } else {
        clientData.id = clientId;
        this.clientService.updateClient(clientData.id, clientData).subscribe({
          next: (updatedClient) => {
            console.log('Cliente actualizado:', updatedClient);
            this.router.navigate(['/clients']);
          },
          error: (err) => {
            console.error('Error al actualizar cliente:', err);
          },
        });
      }
    } else {
      console.log('Formulario inválido');
      this.clientForm.markAllAsTouched();
    }
  }

  onDelete(): void {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (clientId && clientId !== 'new') {
      this.clientService.deleteClient(Number(clientId)).subscribe({
        next: () => {
          this.router.navigate(['/clients']);
        },
        error: (err) => {
          console.error('Error al borrar cliente:', err);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/clients']);
  }

  onBuscarFacturasRelacionadas(): void {
    const dni = this.clientForm.get('dni')?.value;
    if (dni) {
      const billFilter: BillFilter = {
        destinatarioNif: dni,
      };
      this.router.navigate(['/billing'], {
        state: { billFilter },
      });
    }
  }
}
