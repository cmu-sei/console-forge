import { Routes } from '@angular/router';
import { GettingStartedComponent } from '../components/getting-started/getting-started.component';
import { DemoComponent } from '../components/demo/demo.component';
import { VmwareDemoComponent } from '../components/vmware-demo/vmware-demo.component';

export const routes: Routes = [
    {
        path: "getting-started",
        component: GettingStartedComponent
    },
    {
        path: "with-vnc",
        title: "With VNC",
        component: DemoComponent
    },
    {
        path: "with-vmware",
        title: "With VMWare WMKS",
        component: VmwareDemoComponent
    },
    {
        path: "",
        pathMatch: "full",
        redirectTo: "getting-started"
    }
];
