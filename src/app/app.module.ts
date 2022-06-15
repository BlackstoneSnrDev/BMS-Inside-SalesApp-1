import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routing, appRoutingProviders } from './app.routing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

///// My components 
// HTML
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormComponent } from './components/form/form.component';
import { LogComponent } from './components/log/log.component';
import { PhoneComponent } from './components/phone/phone.component';
import { TableComponent } from './components/table/table.component';

///// Partials
import { QueueComponent } from './partials/queue/queue.component';
import { CallInfoComponent } from './partials/call-information/call-information.component';
import { SettingsComponent } from './partials/settings/settings.component';
import { StatisticsComponent } from './partials/statistics/statistics.component';

///// My directives
import { TextareaAutoresizeDirective } from './directives/resize.directive';

///// Libraries
// Angular material
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';


// Ng2 Charts
import { NgChartsModule } from 'ng2-charts';

// PrimeNG
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({

  declarations: [
    AppComponent,
    ///// My components 
    // HTML
    FormComponent,
    LogComponent,
    PhoneComponent,
    NavbarComponent,
    TableComponent,
    // Partials
    QueueComponent,
    CallInfoComponent,
    SettingsComponent,
    StatisticsComponent,
    ///// My directives
    TextareaAutoresizeDirective,
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    ///// Libraries
    // Angular material
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    // Ng2 Charts
    NgChartsModule,
    // PrimeNG
    TableModule,
    PaginatorModule,
    CheckboxModule,
    ToolbarModule,
    ConfirmDialogModule,
    DialogModule,
    TooltipModule,
  ],

  providers: [
    appRoutingProviders,
    // PrimeNG
    ConfirmationService,
    MessageService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
