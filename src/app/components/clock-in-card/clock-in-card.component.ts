import { ChangeDetectionStrategy, Component, effect, inject, input, OnChanges, output, signal, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatFormFieldControl, MatLabel } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';
import { FichajeControllerService } from '../../api/api/fichajeController.service';
import { FichajeEdit } from '../../api/model/fichajeEdit';
import { AuthService } from '../../services/auth.service';
import { FichajeFilter } from '../../api/model/fichajeFilter';

@Component({
  selector: 'app-clock-in-card',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatFormFieldModule,
    MatInputModule,
    MatLabel,
    MatDatepickerModule,
    MatError,
  ],
  templateUrl: './clock-in-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockInCardComponent{
  registroForm: FormGroup;
  fb = inject(FormBuilder);
  fichajeService = inject(FichajeControllerService);
  authService = inject(AuthService);

  day = input<number>();
  month = input<number>();
  
  close = output();
  fichajeCreado = output<void>(); // Nuevo evento

  todayHours = signal<number>(0); // Signal para las horas del día seleccionado

  constructor() {
    this.registroForm = this.fb.group({
      day: [this.day(), Validators.required],
      month: [this.month(), Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      descripcion: [''],
    });


    effect(() => {
      this.registroForm.patchValue({
        day: this.day(),
        month: this.month(),
      });
      this.updateTodayHours(); // <-- Actualiza las horas al cambiar día/mes
    });
  }

  updateTodayHours() {
    const user = this.authService.user();
    if (!user) {
      this.todayHours.set(0);
      return;
    }
    const year = new Date().getFullYear();
    const month = String(this.month()).padStart(2, '0');
    const day = String(this.day()).padStart(2, '0');
    const start = `${year}-${month}-${day}T00:00:00`;
    const end = `${year}-${month}-${day}T23:59:59`;

    const filter: FichajeFilter = {
      employeeId: user.id,
      initialTimeStart: start,
      initialTimeEnd: end,
    };

    this.fichajeService.getFichajesWithFilters({ page: 0, size: 100 }, filter).subscribe({
      next: (page) => {
        let totalMs = 0;
        for (const fichaje of page.content || []) {
          if (fichaje.initialTime && fichaje.exitTime) {
            const ini = new Date(fichaje.initialTime).getTime();
            const fin = new Date(fichaje.exitTime).getTime();
            if (!isNaN(ini) && !isNaN(fin) && fin > ini) {
              totalMs += fin - ini;
            }
          }
        }
        this.todayHours.set(Math.round((totalMs / 1000 / 60 / 60) * 100) / 100);
      },
      error: () => this.todayHours.set(0),
    });
  }

  onSubmit($event: Event): void {
    
    if (this.registroForm.valid) {
      const form = this.registroForm.value;
      const user = this.authService.user();
      if (!user) {
        console.error('No hay usuario autenticado');
        return;
      }

      const year = new Date().getFullYear(); 
      const month = String(form.month).padStart(2, '0');
      const day = String(form.day).padStart(2, '0');

      const initialTime = `${year}-${month}-${day}T${form.horaInicio}:00`;
      const exitTime = `${year}-${month}-${day}T${form.horaFin}:00`;

      const fichaje: FichajeEdit = {
        employeeId: user.id,
        initialTime,
        exitTime,
        initialLocation: '',
        exitLocation: '',
      };

      console.log('Fichaje a guardar:', fichaje);

      this.fichajeService.createFichaje(fichaje)
        .subscribe({
          next: (res) => {
            console.log('Fichaje guardado:', res);
            this.close.emit();
            this.fichajeCreado.emit();
          },
          error: (err) => {
            console.error('Error al guardar fichaje:', err);
          }
        });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  deleteFichajeDelDia() {
    const user = this.authService.user();
    if (!user) return;

    const year = new Date().getFullYear();
    const month = String(this.month()).padStart(2, '0');
    const day = String(this.day()).padStart(2, '0');
    const start = `${year}-${month}-${day}T00:00:00`;
    const end = `${year}-${month}-${day}T23:59:59`;

    const filter: FichajeFilter = {
      employeeId: user.id,
      initialTimeStart: start,
      initialTimeEnd: end,
    };

    this.fichajeService.getFichajesWithFilters({ page: 0, size: 100 }, filter).subscribe({
      next: (page) => {
        const fichajes = page.content || [];
        if (fichajes.length === 0) return;

        fichajes.forEach((fichaje: any) => {
          if (fichaje.id) {
            this.fichajeService.deleteFichaje(fichaje.id).subscribe({
              next: () => {
                this.updateTodayHours();
                this.onClose()
              },
              error: (err) => {
                console.error('Error al borrar fichaje:', err);
              },
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al buscar fichajes:', err);
      },
    });
  }
}
