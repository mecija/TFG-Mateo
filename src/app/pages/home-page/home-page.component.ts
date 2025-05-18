import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderControllerService } from '../../api/api/orderController.service';
import { Pageable } from '../../api/model/pageable';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],

  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
  authService = inject(AuthService);
  orderService = inject(OrderControllerService);

  user = this.authService.user()?.name;
  pendingOrdersCount = signal<number>(0);

  ngOnInit(): void {
    this.loadPendingOrdersCount();
  }

  loadPendingOrdersCount(): void {
    const pageable: any = {
      page: 0,
      size: 1000,
      sort: 'orderId,asc',
    };
    this.orderService.getAllOrders(pageable).subscribe((result) => {
      const orders = result.content ?? [];
      const pendingCount = orders.filter(
        (order: any) => order.orderStatus === 'PENDING'
      ).length;
      this.pendingOrdersCount.set(pendingCount);
    });
  }
}
