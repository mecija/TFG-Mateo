import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  output,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterFieldLabelPipe } from '../../pipes/filter-filed.pipe';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FilterFieldLabelPipe],
  templateUrl: './filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent {
  filterFields = input<string[]>([]);
  activeField = input<string>('');
  searchValue = input<string>('');

  filterChange = output<{ field: string; value: string }>();

  onFieldChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.filterChange.emit({
        field: target.value,
        value: this.searchValue(),
      });
    }
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.filterChange.emit({
        field: this.activeField(),
        value: target.value,
      });
    }
  }
}
