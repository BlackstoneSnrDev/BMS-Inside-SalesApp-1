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
import { TextareaAutoresizeDirective } from './directives/resize.directive';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
@NgModule({

  declarations: [
    AppComponent,
    FormComponent,
    HistorialComponent,
    FormVerticalComponent,
    SidebarComponent,
    QueueComponent,
    CallInfoComponent,
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
    routing
  ],

  providers: [
    appRoutingProviders
  ],
  
  bootstrap: [AppComponent]
})

export class AppModule { }
