import { Route, Routes } from "@angular/router";
import { BillingPageComponent } from "./billing-page/billing-page.component";
import { UserPageComponent } from "./user-page/user-page.component";


export const userRoutes: Routes = [
    {
        path:'',
        component: UserPageComponent
    }

]