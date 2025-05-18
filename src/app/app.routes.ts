import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { IsLoggedGuard } from './guards/isLoggedIn.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
    {
        path: 'home',
        component: HomePageComponent,
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'billing',
        loadComponent: () => import('./pages/billing-page/billing-page.component').then(m => m.BillingPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'billing/:billid',
        loadComponent: () => import('./pages/billing-detail-page/billing-detail-page.component').then(m => m.BillingDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'billing/new',
        loadComponent: () => import('./pages/billing-detail-page/billing-detail-page.component').then(m => m.BillingDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('./pages/order-page/order-page.component').then(m => m.OrderPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'orders/:orderId',
        loadComponent: () => import('./pages/order-detail-page/order-detail-page.component').then(m => m.OrderDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'orders/new',
        loadComponent: () => import('./pages/order-detail-page/order-detail-page.component').then(m => m.OrderDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'clients',
        loadComponent: () => import('./pages/client-page/client-page.component').then(m => m.ClientPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'clients/:clientId',
        loadComponent: () => import('./pages/client-detail-page/client-detail-page.component').then(m => m.ClientDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
        {
        path: 'clients/new',
        loadComponent: () => import('./pages/client-detail-page/client-detail-page.component').then(m => m.ClientDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'products',
        loadComponent: () => import('./pages/products-page/products-page.component').then(m => m.ProductsPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'products/:productId',
        loadComponent: () => import('./pages/product-detail-page/product-detail-page.component').then(m => m.ProductDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'products/new',
        loadComponent: () => import('./pages/product-detail-page/product-detail-page.component').then(m => m.ProductDetailPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'clockin',
        loadComponent: () => import('./pages/clock-in-page/clock-in-page.component').then(m => m.ClockInPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'user',
        loadComponent: () => import('./pages/user-page/user-page.component').then(m => m.UserPageComponent),
        canActivate: [IsLoggedGuard]
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/admin-page/admin-page.component').then(m => m.AdminPageComponent),
        canActivate: [IsLoggedGuard, RoleGuard],
        data: { role: 'ADMIN' }
    },
    {
        path: 'admin/users/new',
        loadComponent: () => import('./pages/user-detail-page/user-detail-page.component').then(m => m.UserDetailPageComponent),
        canActivate: [IsLoggedGuard, RoleGuard],
        data: { role: 'ADMIN' }
    },
    {
        path: 'admin/users/:userId',
        loadComponent: () => import('./pages/user-detail-page/user-detail-page.component').then(m => m.UserDetailPageComponent),
        canActivate: [IsLoggedGuard, RoleGuard],
        data: { role: 'ADMIN' }
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent)
    },
    {
    path: '**',
    redirectTo: '/home',
    }

];
