import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';


import { routing, appRoutingProviders } from './app.routing';
import { HttpClientModule } from '@angular/common/http';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FormComponent } from './components/form/form.component';
import { HistorialComponent } from './components/history/historial.component';
import { FormVerticalComponent } from './components/form-vertical/form-vertical.component';


import { QueueComponent } from './partials/queue/queue.component';
import { CallInfoComponent } from './partials/call-information/call-information.component';

import { OnlyMyBacon } from './directives/click-outside.directive';
import { TextareaAutoresizeDirective } from './directives/resize.directive';


@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    HistorialComponent,
    FormVerticalComponent,
    SidebarComponent,
    QueueComponent,
    CallInfoComponent,
    TextareaAutoresizeDirective,
    OnlyMyBacon

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    routing
  ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
