import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderControllerService } from '../../api/api/orderController.service';
import { ProductControllerService } from '../../api/api/productController.service';
import { ClientControllerService } from '../../api/api/clientController.service';
import { ORDER_STATUS } from '../../app.constants';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { NgFor } from '@angular/common';
import { ProductEdit } from '../../api/model/productEdit';
import { BillEdit } from '../../api/model/billEdit';
import { ClientEdit } from '../../api/model/clientEdit';

function datetimeLocalValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  return regex.test(value) ? null : { datetimeLocal: true };
}

@Component({
  selector: 'app-order-detail-page',
  imports: [
    MatCard,
    MatIcon,
    MatOption,
    MatSelect,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgFor,
  ],
  templateUrl: './order-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPageComponent implements OnInit {
  orderForm!: FormGroup;
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);

  orderService = inject(OrderControllerService);
  authService = inject(AuthService);
  productService = inject(ProductControllerService);
  clientService = inject(ClientControllerService);

  isAdmin = computed(() => {
    const user = this.authService.user();
    return !!user?.roles?.some((role) => role.name === 'ADMIN');
  });

  orderStatus = ORDER_STATUS;
  orderStatusKeys = Object.keys(ORDER_STATUS) as Array<
    keyof typeof ORDER_STATUS
  >;

  productosDisponibles: ProductEdit[] = [];

  constructor() {
    this.orderForm = this.fb.group({
      orderId: [''],
      creationTime: ['', [datetimeLocalValidator, Validators.required]],
      deliveryTime: ['', [datetimeLocalValidator, Validators.required]],
      clientId: ['', Validators.required],
      orderStatus: ['', Validators.required],
      amount: [
        '',
        [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      ],
      deliveryAddress: ['', Validators.required],
      productos: this.fb.array([]),
    });

    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId && orderId !== 'new') {
      this.orderService.getOrderById(Number(orderId)).subscribe((order) => {
        console.log(order);

        if (order) {
          const fixDate = (dateStr: string) =>
            dateStr ? dateStr.slice(0, 16) : '';

          order.creationTime = fixDate(order.creationTime ?? '');
          order.deliveryTime = fixDate(order.deliveryTime ?? '');

          this.orderForm.patchValue(order);
          this.orderForm.get('orderId')?.setValue(order.orderId);

          const productosArray = this.orderForm.get('productos') as FormArray;
          productosArray.clear();
          if (order.productos && Array.isArray(order.productos)) {
            order.productos.forEach((prod: any) => {
              productosArray.push(
                this.fb.group({
                  id: [prod.id, Validators.required],
                  amount: [
                    prod.amount,
                    [Validators.required, Validators.min(1)],
                  ],
                })
              );
            });
          }
        }
      });
    }

    this.productos.valueChanges.subscribe(() => {
      this.calcularImporteTotal();
    });
  }

  ngOnInit() {
    this.productService
      .getAllProducts({ page: 0, size: 100 })
      .subscribe((res) => {
        this.productosDisponibles = res.content || [];
      });
  }

  get productos(): FormArray {
    return this.orderForm.get('productos') as FormArray;
  }

  addProducto() {
    this.productos.push(
      this.fb.group({
        id: [null, Validators.required],
        amount: [1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeProducto(index: number) {
    this.productos.removeAt(index);
  }

  calcularImporteTotal() {
    const productos = this.productos.value;
    if (!productos || productos.length === 0) {
      this.orderForm.get('amount')?.setValue(0);
      return;
    }

    let total = 0;
    let pending = productos.length;

    productos.forEach((prod: any) => {
      if (prod.id && prod.amount) {
        this.productService.getProductById(prod.id).subscribe({
          next: (product: ProductEdit) => {
            if (product && product.price != null) {
              total += product.price * prod.amount;
            }
            pending--;
            if (pending === 0) {
              this.orderForm
                .get('amount')
                ?.setValue(Math.round(total * 100) / 100);
            }
          },
          error: () => {
            pending--;
            if (pending === 0) {
              this.orderForm
                .get('amount')
                ?.setValue(Math.round(total * 100) / 100);
            }
          },
        });
      } else {
        pending--;
        if (pending === 0) {
          this.orderForm.get('amount')?.setValue(Math.round(total * 100) / 100);
        }
      }
    });
  }

  onSubmit($event: Event): void {
    $event.preventDefault();
    if (this.orderForm.valid) {
      const orderData = this.orderForm.getRawValue();
      const orderId = this.route.snapshot.paramMap.get('orderId');

      if (orderId === 'new') {
        delete orderData.orderId;
        this.orderService.createOrder(orderData).subscribe({
          next: (createdOrder) => {
            this.router.navigate(['/orders']);
          },
          error: (err) => {
            console.error('Error al crear pedido:', err);
          },
        });
      } else {
        orderData.orderId = orderId;
        this.orderService.updateOrder(orderData.orderId, orderData).subscribe({
          next: (updatedOrder) => {
            this.router.navigate(['/orders']);
          },
          error: (err) => {
            console.error('Error al actualizar pedido:', err);
          },
        });
      }
    } else {
      this.orderForm.markAllAsTouched();
    }
  }

  onDelete(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId && orderId !== 'new') {
      this.orderService.deleteOrder(Number(orderId)).subscribe({
        next: () => {
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          console.error('Error al borrar pedido:', err);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/orders']);
  }

  private buildConceptoString(
    productos: any[],
    callback: (concepto: string) => void
  ) {
    if (!productos || productos.length === 0) {
      callback('');
      return;
    }

    let pending = productos.length;
    const productsData: { name: string; amount: string; price: string }[] = [];

    productos.forEach((prod, index) => {
      if (prod.id && prod.amount) {
        this.productService.getProductById(prod.id).subscribe({
          next: (product: ProductEdit) => {
            productsData[index] = {
              name: product.name || `ID:${prod.id}`,
              amount: String(prod.amount),
              price: `${product.price}€`,
            };

            pending--;
            if (pending === 0) generateFormattedText();
          },
          error: () => {
            productsData[index] = {
              name: `ID:${prod.id}`,
              amount: String(prod.amount),
              price: '?',
            };

            pending--;
            if (pending === 0) generateFormattedText();
          },
        });
      } else {
        productsData[index] = {
          name: '',
          amount: '',
          price: '',
        };

        pending--;
        if (pending === 0) generateFormattedText();
      }
    });

    function generateFormattedText() {
      const col1Header = 'Producto';
      const col2Header = 'Cantidad';
      const col3Header = 'Precio';
      
      // Calcular anchos máximos
      const col1Width = Math.max(col1Header.length, ...productsData.map(p => p.name.length));
      const col2Width = Math.max(col2Header.length, ...productsData.map(p => p.amount.length));
      
      // Espacios fijos para cada columna
      const col1Space = 20; // Ajusta este número según necesites
      const col2Space = 10; // Ajusta este número según necesites
      
      let concepto = "Concepto:\n";
      
      // Encabezados con espacios literales
      concepto += col1Header.padEnd(col1Space) + " | " + 
                  col2Header.padEnd(col2Space) + " | " + 
                  col3Header + "\n";
      
      // Línea separadora alineada exactamente con los encabezados
      concepto += "-".repeat(col1Space) + "-+-" + 
                  "-".repeat(col2Space) + "-+-" + 
                  "-".repeat(col3Header.length) + "\n";
      
      // Datos con espacios literales
      productsData.forEach(data => {
        if (data.name || data.amount || data.price) {
          concepto += data.name.padEnd(col1Space) + " | " +
                     data.amount.padEnd(col2Space) + " | " +
                     data.price + "\n";
        }
      });
      
      callback(concepto.trim());
    }
  }

  createFactura() {
    const orderData = this.orderForm.getRawValue();
    const clientId = orderData.clientId;

    if (!clientId) {
      return;
    }

    this.clientService
      .getClientById(clientId)
      .subscribe((client: ClientEdit) => {
        this.buildConceptoString(orderData.productos, (concepto) => {
          const billData: Partial<BillEdit> = {
            destinatarioDenomSocial: client.empresa || client.nombre,
            destinatarioNif: client.dni,
            destinatarioDIR: client.direccion,
            destinatarioDireccionFiscal: client.direccion,
            concepto,
            baseFactura: orderData.amount?.toString() ?? '',
          };
          this.router.navigate(['/billing/new'], { state: { billData } });
        });
      });
  }

  getNombreProducto(id: number): string {
    const prod = this.productosDisponibles.find((p) => p.id === id);
    return prod!.name ?? '';
  }

  getPrecioProducto(id: number): string {
    const prod = this.productosDisponibles.find((p) => p.id === id);
    return prod && prod.price != null ? prod.price + '€' : '';
  }

  onProductoSeleccionado(index: number, producto: ProductEdit) {
    const productosArray = this.productos;
    const productoGroup = productosArray.at(index);
    if (productoGroup) {
      productoGroup.get('id')?.setValue(producto.id);
    }
  }

  getProductoById(id: number): ProductEdit | undefined {
    return this.productosDisponibles.find((p) => p.id === id);
  }
}
