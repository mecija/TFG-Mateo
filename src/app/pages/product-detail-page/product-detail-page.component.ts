import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
import { ProductControllerService } from '../../api/api/productController.service';
import { ProductEdit } from '../../api/model/productEdit';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    MatCard,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './product-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPageComponent {
  productForm!: FormGroup;
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);

  productService = inject(ProductControllerService);
  authService = inject(AuthService);

  isAdmin = computed(() => {
    const user = this.authService.user();
    return !!user?.roles?.some((role) => role.name === 'ADMIN');
  });

  constructor() {
    this.productForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: [''],
      imageUrl: [''],
      category: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
    });

    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId && productId !== 'new') {
      this.productService.getProductById(Number(productId)).subscribe((product) => {
        if (product) {
          this.productForm.patchValue(product);
        }
      });
    }
  }

  onSubmit($event: Event): void {
    $event.preventDefault();
    if (this.productForm.valid) {
      const productData = this.productForm.getRawValue();
      const productId = this.route.snapshot.paramMap.get('productId');

      if (productId === 'new') {
        delete productData.id;
        this.productService.createProduct(productData).subscribe({
          next: (createdProduct) => {
            console.log('Producto creado:', createdProduct);
            this.router.navigate(['/products']);
          },
          error: (err) => {
            console.error('Error al crear producto:', err);
          },
        });
      } else {
        productData.id = productId;
        this.productService.updateProduct(productData.id, productData).subscribe({
          next: (updatedProduct) => {
            console.log('Producto actualizado:', updatedProduct);
            this.router.navigate(['/products']);
          },
          error: (err) => {
            console.error('Error al actualizar producto:', err);
          },
        });
      }
    } else {
      console.log('Formulario inválido');
      this.productForm.markAllAsTouched();
    }
  }

  onDelete(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId && productId !== 'new') {
      this.productService.deleteProduct(Number(productId)).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error al borrar producto:', err);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}