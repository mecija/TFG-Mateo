import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface DaysMonth {
  day:number;
  month:number;
}

@Component({
  selector: 'app-calendar',
  imports: [NgClass],
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  months: { name: string; days: (number | null)[]; index: number }[] = [];
  weekDays: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  today: Date = new Date();
  showClockinForm = output<DaysMonth>();

  markedDays = input<DaysMonth[]>([]);
  festiveDays = input<DaysMonth[]>([]);

  isMarked(day: number | null, monthIndex: number): boolean {
    if (!day) return false;
    return this.markedDays().some(
      marked => marked.day === day && marked.month === monthIndex + 1
    );
  }

  isFestive(day: number | null, monthIndex: number): boolean {
    if (!day) return false;
    return this.festiveDays().some(
      festive => festive.day === day && festive.month === monthIndex + 1
    );
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    for (let i = 0; i < 12; i++) {
      const firstDayOfMonth = new Date(this.today.getFullYear(), i, 1).getDay(); 
      const daysInMonth = new Date(this.today.getFullYear(), i + 1, 0).getDate();

      const days: (number | null)[] = Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }, () => null);

      days.push(...Array.from({ length: daysInMonth }, (_, index) => index + 1));

      this.months.push({ name: monthNames[i], days, index: i });
    }
  }

  isToday(day: number | null, monthIndex: number): boolean {
    return (
      day === this.today.getDate() &&
      monthIndex === this.today.getMonth() &&
      this.today.getFullYear() === new Date().getFullYear()
    );
  }


  ondayClick(day: number | null, month: number): void {
    if (!day) return;
    month = month + 1;
    this.showClockinForm.emit({day, month})
    console.log({day, month});
    
  }

}
