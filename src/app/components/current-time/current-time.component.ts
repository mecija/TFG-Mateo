import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  inject,
  effect,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FichajeControllerService, FichajeFilter, Pageable } from '../../api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-current-time',
  imports: [MatCardModule],
  templateUrl: './current-time.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentTimeComponent {
  horaSignal = input(new Date(1970, 0, 0, 0, 0));
  fichajeService = inject(FichajeControllerService);
  authService = inject(AuthService);

  horasHoy = signal('00:00');
  user = this.authService.user();

  today = new Date();
  yyyy = this.today.getFullYear();
  mm = String(this.today.getMonth() + 1).padStart(2, '0');
  dd = String(this.today.getDate()).padStart(2, '0');
  start = `${this.yyyy}-${this.mm}-${this.dd}T00:00:00`;
  end = `${this.yyyy}-${this.mm}-${this.dd}T23:59:59`;

  filter: FichajeFilter = {
    employeeId: this.user!.id,
    initialTimeStart: this.start,
    initialTimeEnd: this.end,
  };

  pageable: Pageable = { page: 0, size: 100 };
  updateSignal = input(0);

  constructor() {
    this.updateRequest(this.pageable, this.filter);

    effect(
      () => {
        this.updateSignal();
        this.updateRequest(this.pageable, this.filter); 
      },
      
    );
  }

  updateRequest(pageable: Pageable, filter: FichajeFilter) {
    this.fichajeService
      .getFichajesWithFilters(pageable, filter)
      .subscribe((page) => {
        let totalMs = 0;
        for (const fichaje of page.content!) {
          if (fichaje.initialTime && fichaje.exitTime) {
            const start = new Date(fichaje.initialTime).getTime();
            const end = new Date(fichaje.exitTime).getTime();
            totalMs += end - start;
          }
        }
        // Convierte totalMs a HH:mm
        const totalSeconds = Math.floor(totalMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        this.horasHoy.set(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}`
        );
      });
  }
}
