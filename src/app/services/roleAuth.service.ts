import { Injectable } from '@angular/core';
import { RoleDTO, UserView } from '../api';
import { User, Role } from './interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class RoleAuthService {
  /**
   * Comprueba si un usuario (User o UserView) tiene el rol requerido por nombre.
   * @param user El usuario (User o UserView)
   * @param requirement El nombre del rol requerido (por ejemplo, "ADMIN")
   */
  isAllowedUserByRole(
    user: User | UserView,
    requirement: string
  ): boolean {
    if (!user?.roles) return false;

    let rolesArr: any[] = [];
    if (Array.isArray(user.roles)) {
      rolesArr = user.roles;
    } else if (user.roles instanceof Set) {
      rolesArr = Array.from(user.roles);
    }

    return rolesArr.some((role) => role.name === requirement);
  }
}
