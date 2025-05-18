import { Routes } from '@angular/router';
import { ClientPageComponent } from './client-page/client-page.component';

export const clientsRoutes: Routes = [
    {
        path:'',
        component: ClientPageComponent
    },
    {
        path:'/:id',
        loadComponent: () => import('./client-detail-page/client-detail-page.component').then(m => m.ClientDetailPageComponent)

    }
]