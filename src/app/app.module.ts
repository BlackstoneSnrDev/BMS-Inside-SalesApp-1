import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { routing, appRoutingProviders } from './app.routing';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FormComponent } from './components/form/form.component';
import { HistorialComponent } from './components/history/historial.component';
import { FormVerticalComponent } from './components/form-vertical/form-vertical.component';


import { QueueComponent } from './partials/queue/queue.component';
import { CallInfoComponent } from './partials/call-information/call-information.component';
import { SettingsComponent } from './partials/settings/settings.component';
import { StatisticsComponent } from './partials/statistics/statistics.component';

import { TextareaAutoresizeDirective } from './directives/resize.directive';

import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgChartsModule } from 'ng2-charts';

@NgModule({

  declarations: [
    AppComponent,
    FormComponent,
    HistorialComponent,
    FormVerticalComponent,
    SidebarComponent,
    QueueComponent,
    CallInfoComponent,
    SettingsComponent,
    StatisticsComponent,
    TextareaAutoresizeDirective
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    NgChartsModule,
    routing
  ],

  providers: [
    appRoutingProviders
  ],
  
  bootstrap: [AppComponent]
})

export class AppModule { }
