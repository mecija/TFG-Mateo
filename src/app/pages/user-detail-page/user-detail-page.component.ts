import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
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
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { UserControllerService } from '../../api/api/userController.service';
import { UserEdit } from '../../api/model/userEdit';
import { RoleDTO } from '../../api/model/roleDTO';
import { AuthService } from '../../services/auth.service';
import { NgForOf, NgIf } from '@angular/common';

const STATIC_ROLES: RoleDTO[] = [
  {
    id: 1,
    name: 'USER',
    description: 'Usuario estándar con permisos básicos',
  },
  {
    id: 2,
    name: 'ADMIN',
    description: 'Administrador con permisos completos',
  },
  {
    id: 3,
    name: 'MANAGER',
    description: 'Gerente con permisos intermedios',
  },
];

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [
    MatCard,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPageComponent {
  userForm!: FormGroup;
  isNewUser = signal(false);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);

  userService = inject(UserControllerService);
  authService = inject(AuthService);

  roles: RoleDTO[] = STATIC_ROLES;
  isAdmin = computed(() => {
    const user = this.authService.user();
    return !!user?.roles?.some((role) => role.name === 'ADMIN');
  });

  constructor() {
    const userId = this.route.snapshot.paramMap.get('userId');
    
    if (userId === 'new' || !userId ) {
      this.isNewUser.set(true);
    }  

    this.userForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      enabled: [true, Validators.required],
      roles: [[], Validators.required],
      ...(this.isNewUser() && { password: ['', Validators.required] }),
    });

    if (!this.isNewUser() && userId) {
      this.userService.getUserById(Number(userId)).subscribe((user) => {
        if (user) {
          const userRolesArr = Array.isArray(user.roles)
            ? user.roles
            : user.roles
            ? Array.from(user.roles)
            : [];
          const selectedRoles = userRolesArr
            .map((ur) => this.roles.find((r) => r.id === ur.id))
            .filter(Boolean);
          this.userForm.patchValue({ ...user, roles: selectedRoles });
        }
      });
    }
  }

  compareRoles = (a: RoleDTO, b: RoleDTO) => a && b && a.id === b.id;

  onSubmit($event: Event): void {
    $event.preventDefault();
    if (this.userForm.valid) {
      const userData: UserEdit = this.userForm.getRawValue();
      const userId = this.route.snapshot.paramMap.get('userId');

      if (this.isNewUser()) {
        delete userData.id;
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.router.navigate(['/admin']);
          },
          error: (err) => {
            console.error('Error al crear usuario:', err);
          },
        });
      } else {
        userData.id = Number(userId);
        this.userService.updateUser(userData.id, userData).subscribe({
          next: () => {
            this.router.navigate(['/admin']);
          },
          error: (err) => {
            console.error('Error al actualizar usuario:', err);
          },
        });
      }
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  onDelete(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId && userId !== 'new') {
      this.userService.deleteUser(Number(userId)).subscribe({
        next: () => {
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          console.error('Error al borrar usuario:', err);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }
}
