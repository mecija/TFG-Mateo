import { Route, Routes } from "@angular/router";
import { BillingPageComponent } from "./billing-page/billing-page.component";
import { ProductsPageComponent } from "./products-page/products-page.component";


export const productsRoutes: Routes = [
    {
        path:'',
        component: ProductsPageComponent
    },
    {
        path:'/:id',
        loadComponent: () => import('./product-detail-page/product-detail-page.component').then(m => m.ProductDetailPageComponent)

    }
]