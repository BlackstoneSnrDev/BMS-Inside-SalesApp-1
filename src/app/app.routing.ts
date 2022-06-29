// Import angular router's module
import { ModuleWithProviders } from '@angular/core'; 
import { Routes, RouterModule } from '@angular/router'; 

// Import components
import { CallInfoComponent } from './partials/call-information/call-information.component';
import { QueueComponent } from './partials/queue/queue.component';
import { SettingsComponent } from './partials/settings/settings.component';
import { StatisticsComponent } from './partials/statistics/statistics.component';
import { AdminSettings } from './partials/admin-settings/admin-settings.component';
import { LoginComponent } from './partials/login/login.component';
import { PageNotFoundComponent } from './partials/page-not-found/page-not-found.component';

import { AuthGuard } from "./services/auth.guard";

// URL Config
const appRoutes: Routes = [

    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'call-information', component: CallInfoComponent, canActivate: [AuthGuard] },
    {path: 'queue', component: QueueComponent, canActivate: [AuthGuard] },
    {path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
    {path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },
    {path: 'admin-settings', component: AdminSettings, canActivate: [AuthGuard] },
    {path: '404', component: PageNotFoundComponent, canActivate: [AuthGuard] },
    {path: '**', redirectTo: '404'},
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);