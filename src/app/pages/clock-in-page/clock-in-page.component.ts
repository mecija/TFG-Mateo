import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  CalendarComponent,
  DaysMonth,
} from '../../components/calendar/calendar.component';
import { ClockInCardComponent } from '../../components/clock-in-card/clock-in-card.component';
import { MatCard } from '@angular/material/card';
import { CurrentTimeComponent } from '../../components/current-time/current-time.component';
import { FichajeControllerService } from '../../api/api/fichajeController.service';
import { FichajeFilter } from '../../api/model/fichajeFilter';
import { Pageable } from '../../api/model/pageable';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clock-in-page',
  imports: [
    CalendarComponent,
    ClockInCardComponent,
    MatCard,
    CurrentTimeComponent,
  ],
  templateUrl: './clock-in-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockInPageComponent {
  fichajeService = inject(FichajeControllerService);
  authService = inject(AuthService);
  today = new Date();
  showClockinForm = signal(false);
  selectedDay = signal(this.today.getDay());
  selectedMonth = signal(this.today.getMonth());
  todayTime = signal(new Date(1970, 0, 0, 0, 0));
  markedDays = signal<DaysMonth[]>([]);
  updateCurrentTime = signal(0);

  constructor() {
    this.loadMarkedDays();
  }

  onDaySelected($event: DaysMonth): void {
    this.selectedDay.set($event.day);
    this.selectedMonth.set($event.month);

    this.showClockinForm.set(true);
  }

  onFormClosed(): void {
    this.showClockinForm.set(false);
  }

  registerTimeToday(): void {
    this.onDaySelected({
      day: this.today.getDate(),
      month: this.today.getMonth() + 1,
    });
  }

  async updateTodayTime() {
    const fichajes = await this.fichajeService.getFichajesWithFilters(
      this.getDefaultPageable(),
      this.getTodayFichajeFilter()
    );

    let totalMs = 0;
    fichajes.forEach((fichaje: any) => {
      if (fichaje.initial_time && fichaje.exit_time) {
        const start = new Date(fichaje.initial_time).getTime();
        const end = new Date(fichaje.exit_time).getTime();
        if (!isNaN(start) && !isNaN(end) && end > start) {
          totalMs += end - start;
        }
      }
    });

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60);

    this.todayTime.set(new Date(1970, 0, 1, hours, minutes));
  }

  getTodayFichajeFilter(): FichajeFilter {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const start = `${yyyy}-${mm}-${dd}T00:00:00`;
    const end = `${yyyy}-${mm}-${dd}T23:59:59`;

    return {
      employeeId: this.authService.user()?.id,
      initialTimeStart: start,
      initialTimeEnd: end,
    };
  }
  getDefaultPageable(): Pageable {
    return {
      page: 0,
      size: 100,
      sort: [],
    };
  }

  onFichajeCreado() {
    this.updateCurrentTime.update((v) => v + 1);
  }

  loadMarkedDays() {
    const user = this.authService.user();
    if (!user) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const firstDay = `${yyyy}-${mm}-01T00:00:00`;
    const lastDay = `${yyyy}-${mm}-${new Date(yyyy, today.getMonth() + 1, 0).getDate()}T23:59:59`;

    const filter: FichajeFilter = {
      employeeId: user.id,
      initialTimeStart: firstDay,
      initialTimeEnd: lastDay,
    };
    const pageable: Pageable = { page: 0, size: 100 };

    this.fichajeService.getFichajesWithFilters(pageable, filter).subscribe(page => {
      const days = (page.content ?? []).map(fichaje => {
        const date = new Date(fichaje.initialTime!);
        return { day: date.getDate(), month: date.getMonth() + 1 };
      });
      const uniqueDays = days.filter(
        (d, i, arr) => arr.findIndex(dd => dd.day === d.day && dd.month === d.month) === i
      );
      this.markedDays.set(uniqueDays);
    });
  }
}
