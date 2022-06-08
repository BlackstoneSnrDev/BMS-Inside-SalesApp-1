import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';


import { routing, appRoutingProviders } from './app.routing';
import { HttpClientModule } from '@angular/common/http';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FormComponent } from './components/form/form.component';
import { LogComponent } from './components/log/log.component';
import { PhoneComponent } from './components/phone/phone.component';
import { TablecccComponent } from './components/table/table.component';
import { MatCheckboxModule } from '@angular/material/checkbox';


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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TableModule } from 'primeng/table';
import { ProductService } from './components/table/productservice';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';


import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({

  declarations: [
    AppComponent,
    FormComponent,
    LogComponent,
    PhoneComponent,
    NavbarComponent,
    TablecccComponent,
    QueueComponent,
    CallInfoComponent,
    SettingsComponent,
    StatisticsComponent,
    TextareaAutoresizeDirective,
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
    MatProgressSpinnerModule,
    MatCheckboxModule,
    FormsModule,
    TableModule,
    PaginatorModule,
    CheckboxModule,
    ToastModule, InputTextModule, FileUploadModule, ToolbarModule, RatingModule, RadioButtonModule, InputNumberModule,
    ConfirmDialogModule, InputTextareaModule, CalendarModule, SliderModule, ContextMenuModule, MultiSelectModule, DialogModule, DropdownModule, ProgressBarModule, TooltipModule
    ,
    ButtonModule,
    routing
  ],

  providers: [
    appRoutingProviders, ProductService, MessageService, ConfirmationService
  ],

  bootstrap: [AppComponent]
})

export class AppModule { }
