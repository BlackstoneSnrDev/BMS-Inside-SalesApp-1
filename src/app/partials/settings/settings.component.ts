import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DataService } from '../../services/services.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: [
    './settings.component.css',
    '../../css/neumorphism.component.css',
  ],
})
export class SettingsComponent implements OnInit {
  public optVoiceMail: any;
  public optSMS: any;
  public optEmail: any;
  public tglSMS: boolean = false;
  public tglVM: boolean = false;
  public tglEmail: boolean = false;

  constructor(
    private usersService: UsersService,
    public DataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.usersService.dbObjKey.subscribe((dbObjKey) => console.log(dbObjKey));
  }

  ngOnInit() {
    this.DataService.getSelectData().subscribe(
      (response) => {
        this.optVoiceMail = response.selectVoiceMail;
        this.optSMS = response.selectSMSMessage;
        this.optEmail = response.selectEmail;
      },

      (error) => {
        console.error(error);
      }
    );
  }

  toggleSMS() {
    this.tglSMS = !this.tglSMS;
  }

  toggleVM() {
    this.tglVM = !this.tglVM;
  }

  toggleEmail() {
    this.tglEmail = !this.tglEmail;
  }
}
