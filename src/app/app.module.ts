import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routing, appRoutingProviders } from './app.routing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DatePipe } from '@angular/common';

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
import { ReusableTableComponent } from './components/reusableTable/reusableTable.component';
import { AdminRolesComponent } from './components/admin-roles/admin-roles.component';
import { AdminDeptsComponent } from './components/admin-depts/admin-depts.component';

///// Partials
import { QueueComponent } from './partials/queue/queue.component';
import { CallInfoComponent } from './partials/call-information/call-information.component';
import { SettingsComponent } from './partials/settings/settings.component';
import { StatisticsComponent } from './partials/statistics/statistics.component';
import { LoginComponent } from './partials/login/login.component';
import { PageNotFoundComponent } from './partials/page-not-found/page-not-found.component';
import { AdminSettings } from './partials/admin-settings/admin-settings.component';
import { MessengerComponent } from './partials/messenger/messenger.component';

///// My directives
import { TextareaAutoresizeDirective } from './directives/resize.directive';
import { AuthGuard } from './services/auth.guard';
import { ThemeService } from './components/theme/theme.service';

///// My pipes
import { FormatBoolean } from './pipes/formatBoolean.pipe';
import { ChangeView } from './pipes/changeView.pipe';
import { FormatPassword } from './pipes/formatPassword.pipe';
import { FormatLabel } from './pipes/formatLabel.pipe';
import { FormatArray } from './pipes/formatArray.pipe';
import { FormatPhone } from './pipes/formatPhone.pipe';

///// Libraries
// Angular material
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { environment } from '../environments/environment';
//import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/compat/functions';

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
import { AccordionModule } from 'primeng/accordion';
import { TabMenuModule } from 'primeng/tabmenu';
import { FileUploadModule } from 'primeng/fileupload';
import { PasswordModule } from 'primeng/password';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';
import { ScrollTopModule } from 'primeng/scrolltop';
import { EditorModule } from 'primeng/editor';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';

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
    ReusableTableComponent,
    MessengerComponent,
    AdminRolesComponent,
    AdminDeptsComponent,
    ///// My directives
    TextareaAutoresizeDirective,
    ///// My pipes
    FormatBoolean,
    ChangeView,
    FormatPassword,
    FormatLabel,
    FormatArray,
    FormatPhone,
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
    MatSlideToggleModule,
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
    ListboxModule,
    PaginatorModule,
    CheckboxModule,
    ToolbarModule,
    ConfirmDialogModule,
    DialogModule,
    TooltipModule,
    ToastModule,
    DropdownModule,
    KnobModule,
    AccordionModule,
    TabMenuModule,
    FileUploadModule,
    PasswordModule,
    InputSwitchModule,
    InputTextareaModule,
    SkeletonModule,
    BadgeModule,
    ScrollTopModule,
    EditorModule,
    SplitButtonModule,
    MultiSelectModule,
    OverlayPanelModule,
  ],

  providers: [
    appRoutingProviders,
    // PrimeNG
    ConfirmationService,
    MessageService,
    AuthGuard,
    DatePipe,
    FormatPhone,
    // { provide: BUCKET, useValue: 'my-bucket-name' }
    //{ provide: USE_FUNCTIONS_EMULATOR, useValue: environment.useEmulators ? ['localhost', 5001] : undefined },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
