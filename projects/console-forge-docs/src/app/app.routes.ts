import { Routes } from '@angular/router';
import { GettingStartedComponent } from '../components/getting-started/getting-started.component';
import { DemoComponent } from '../components/demo/demo.component';

export const routes: Routes = [
    {
        path: "getting-started",
        component: GettingStartedComponent
    },
    {
        path: "in-action",
        component: DemoComponent
    },
    {
        path: "",
        pathMatch: "full",
        redirectTo: "getting-started"
    }
];
