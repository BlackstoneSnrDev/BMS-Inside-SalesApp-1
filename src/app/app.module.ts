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
import { AdminTemplateComponent } from './components/admin-template/admin-template.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';

///// Partials
import { QueueComponent } from './partials/queue/queue.component';
import { CallInfoComponent } from './partials/call-information/call-information.component';
import { SettingsComponent } from './partials/settings/settings.component';
import { StatisticsComponent } from './partials/statistics/statistics.component';
import { LoginComponent } from './partials/login/login.component';
import { PageNotFoundComponent } from './partials/page-not-found/page-not-found.component';
import { AdminSettings } from './partials/admin-settings/admin-settings.component';

///// My directives
import { TextareaAutoresizeDirective } from './directives/resize.directive';
import { AuthGuard } from "./services/auth.guard";

///// My pipes
import { FormatBoolean } from './pipes/formatBoolean.pipe';
import { ChangeView } from './pipes/changeView.pipe';
import { FormatPassword } from './pipes/formatPassword.pipe';

///// Libraries
// Angular material
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';

// Firebase 
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { environment } from '../environments/environment';

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
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { KnobModule } from 'primeng/knob';
import {AccordionModule} from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import {TabMenuModule} from 'primeng/tabmenu';


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
    LoginComponent,
    PageNotFoundComponent,
    AdminSettings,
    AdminUserComponent,
    AdminTemplateComponent,
    AdminNavbarComponent,
    ///// My directives
    TextareaAutoresizeDirective,
///// My pipes
    FormatBoolean,
    ChangeView,
    FormatPassword,
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
    MatGridListModule,
    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    AngularFireDatabaseModule,
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
    ToastModule,
    DropdownModule,
    KnobModule,
    FieldsetModule,
    AccordionModule,
    TabMenuModule,
    
  ],

  providers: [
    appRoutingProviders,
    // PrimeNG
    ConfirmationService,
    MessageService,
    AuthGuard,
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
