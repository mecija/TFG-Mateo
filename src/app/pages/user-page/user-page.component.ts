import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { UserControllerService } from '../../api/api/userController.service';
import { AuthService } from '../../services/auth.service';
import { UserView } from '../../api';
import { NgClass } from '@angular/common';
import { FichajeControllerService } from '../../api/api/fichajeController.service';
import { Pageable } from '../../api/model/pageable';
import { FichajeFilter } from '../../api/model/fichajeFilter';

@Component({
  selector: 'app-user-page',
  imports: [NgClass],
  templateUrl: './user-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPageComponent implements OnInit {
  userData = signal<UserView | null>(null);
  horasSemana = signal<number>(0);

  authService = inject(AuthService);
  userController = inject(UserControllerService);
  fichajeController = inject(FichajeControllerService);

  ngOnInit(): void {
    const userId = this.authService.user()?.id;
    if (userId) {
      this.userController.getUserById(userId).subscribe((user) => {
        this.userData.set(user);
        this.cargarHorasSemana(userId);
      });
    }
  }

  cargarHorasSemana(userId: number) {
    const now = new Date();
    const day = now.getDay() || 7; 
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const filter: FichajeFilter = {
      employeeId: userId,
      initialTimeStart: monday.toISOString(),
      initialTimeEnd: sunday.toISOString(),
    };

    const pageable: any = { page: 0, size: 100, sort: 'initialTime,asc' };

    this.fichajeController
      .getFichajesWithFilters(pageable, filter)
      .subscribe((page) => {
        let totalMs = 0;
        for (const fichaje of page.content ?? []) {
          if (fichaje.initialTime && fichaje.exitTime) {
            const ini = new Date(fichaje.initialTime).getTime();
            const fin = new Date(fichaje.exitTime).getTime();
            if (!isNaN(ini) && !isNaN(fin) && fin > ini) {
              totalMs += fin - ini;
            }
          }
        }
        this.horasSemana.set(
          Math.round((totalMs / 1000 / 60 / 60) * 100) / 100
        );
      });
  }
}
