import { Pipe, PipeTransform } from '@angular/core';
import { ORDER_STATUS } from '../app.constants';

@Pipe({
  name: 'orderStatus'
})
export class OrderStatusPipe implements PipeTransform {
  transform(value: keyof typeof ORDER_STATUS | string): string {
    return ORDER_STATUS[value as keyof typeof ORDER_STATUS] ?? value;
  }
}