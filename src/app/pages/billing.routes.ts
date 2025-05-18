import { Route, Routes } from "@angular/router";
import { BillingPageComponent } from "./billing-page/billing-page.component";


export const billingRoutes: Routes = [
    {
        path:'',
        component: BillingPageComponent
    },
    {
        path:'/:id',
        loadComponent: () => import('./billing-detail-page/billing-detail-page.component').then(m => m.BillingDetailPageComponent)

    }
]