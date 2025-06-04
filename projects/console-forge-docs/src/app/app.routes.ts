import { Routes } from '@angular/router';
import { GettingStartedComponent } from '../components/getting-started/getting-started.component';
import { DemoComponent } from '../components/demo/demo.component';
import { VmwareDemoComponent } from '../components/vmware-demo/vmware-demo.component';
import { WithCustomToolbarComponent } from '../components/with-custom-toolbar/with-custom-toolbar.component';
import { WithX11vncComponent } from '../components/with-x11vnc/with-x11vnc.component';
import { WithCustomEventHandlingComponent } from '../components/with-custom-event-handling/with-custom-event-handling.component';

export const routes: Routes = [
    {
        path: "getting-started",
        component: GettingStartedComponent
    },
    {
        path: "with-custom-toolbar",
        title: "With a custom toolbar",
        component: WithCustomToolbarComponent
    },
    {
        path: "with-x11-vnc",
        title: "With x11VNC (Docker)",
        component: WithX11vncComponent
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
        path: "with-custom-event-handling",
        title: "With Custom Event Handling",
        component: WithCustomEventHandlingComponent
    },
    {
        path: "",
        pathMatch: "full",
        redirectTo: "getting-started"
    }
];
