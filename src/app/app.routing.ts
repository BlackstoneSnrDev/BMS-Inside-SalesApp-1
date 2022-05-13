// Import angular router's module
import { ModuleWithProviders } from '@angular/core'; 
import { Routes, RouterModule } from '@angular/router'; 

// Import components
import { CallInfoComponent } from './partials/call-information/call-information.component';
import { QueueComponent } from './partials/queue/queue.component';
import { SettingsComponent } from './partials/settings/settings.component';
import { StatisticsComponent } from './partials/statistics/statistics.component';

// URL Config
const appRoutes: Routes = [

    {path: '', component: CallInfoComponent},
    {path: 'call-information', component: CallInfoComponent},
    {path: 'queue', component: QueueComponent},
    {path: 'settings', component: SettingsComponent},
    {path: 'statistics', component: StatisticsComponent},
    {path: '**', component: CallInfoComponent}

];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);