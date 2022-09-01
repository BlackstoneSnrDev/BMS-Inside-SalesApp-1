import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';

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
  public tglTemplate: boolean = false;
  public tglPrevTemplate: any;
  public tglTitle: string = '';

  public templateName: string = '';

  public templateForm!: FormGroup;
  public userInfo: any;
  public initialsName: string = '';
  public todayDate: any;

  title = 'micRecorder';

  //Lets declare Record OBJ
  record: any;
  //Will use this flag for toggeling recording
  recording = false;
  //URL of Blob
  url: any;
  error: any;

  constructor(
    private usersService: UsersService,
    public DataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private domSanitizer: DomSanitizer
  ) {
    this.usersService.dbObjKey.subscribe((dbObjKey) => console.log(dbObjKey));
  }

  ngOnInit() {
    this.usersService.userInfo.subscribe(
      (userInfo) => (
        (this.userInfo = userInfo),
        (this.initialsName = this.userInfo.name
          .split(' ')
          .map((word: any) => word[0])
          .join(''))
      )
    );

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

    this.templateForm = new FormGroup({
      templateName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      templateContent: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
    });
  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
  /**
   * Start recording.
   */
  initiateRecording() {

    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }
  /**
   * Will be called automatically.
   */
  successCallback(stream: MediaStream) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      //sampleRate: 64000,
    };
    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }
  /**
   * Stop recording.
   */
  stopRecording() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
  }
  /**
   * processRecording Do what ever you want with blob
   * @param  {any} blob Blog
   */
  processRecording(blob: Blob | MediaSource) {
    this.url = URL.createObjectURL(blob);
    console.log("blob", blob);
    console.log("url", this.url);
  }

  save() {
    console.log('saved');
  }
  /**
   * Process Error.
   */
  errorCallback(_error: any) {
    this.error = 'Can not play audio in your browser';
  }

  toggleTemplate(type: any) {
    this.tglPrevTemplate = '';
    this.tglEmail = false;
    this.tglSMS = false;
    this.tglEmail = false;
    this.tglVM = false;
    this.templateForm.reset();

    if (type === 'email') {
      this.tglEmail = true;
    } else if (type === 'sms') {
      this.tglSMS = true;
      type = 'sms message';
    } else if (type === 'vm') {
      this.tglVM = true;
      type = 'voice mail';
    }
    this.tglTitle = 'Create new ' + type + ' template';

    this.tglTemplate = true;
  }

  saveCreateTemplate() {
    this.templateForm.reset();
    this.tglEmail = false;
    this.tglSMS = false;
    this.tglEmail = false;
    this.tglVM = false;
    this.tglPrevTemplate = '';
    this.tglTemplate = false;

    console.log(this.templateForm.value);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail:
        'Template "' +
        this.templateForm.value.templateName +
        '" has been created successfully.',
    });
  }

  cancelCreateTemplate() {
    this.tglEmail = false;
    this.tglSMS = false;
    this.tglVM = false;
    this.tglPrevTemplate = '';
    this.tglTemplate = false;
    this.templateForm.reset();
  }

  previewTemplate(index: any, type: any) {
    this.tglSMS = false;
    this.tglVM = false;
    this.tglEmail = false;

    let timestamp = new Date().getTime();
    this.todayDate = new Date(timestamp).toLocaleString('en-US');

    if (type === 'email') {
      this.tglPrevTemplate = this.optEmail.filter(
        (array: any, i: any) => i == index
      );

      this.tglEmail = true;
      this.tglTemplate = true;

      console.log(this.optEmail.filter((array: any, i: any) => i == index));
    } else if (type === 'sms') {
      type = 'sms message';

      this.tglPrevTemplate = this.optSMS.filter(
        (array: any, i: any) => i == index
      );

      this.tglSMS = true;
      this.tglTemplate = true;

      console.log(this.optSMS.filter((array: any, i: any) => i == index));
    } else if (type === 'vm') {
      type = 'voice mail';

      this.tglPrevTemplate = this.optVoiceMail.filter(
        (array: any, i: any) => i == index
      );

      this.tglVM = true;
      this.tglTemplate = true;

      console.log(this.optVoiceMail.filter((array: any, i: any) => i == index));
    }
    this.tglTitle = 'Preview ' + type + ' template';
  }

  editTemplate(index: any, type: any) {
    this.tglSMS = false;
    this.tglVM = false;
    this.tglEmail = false;
    this.tglPrevTemplate = '';

    let content = '';
    let name = '';
    let selected = [];

    if (type === 'email') {
      this.tglEmail = true;
      selected = this.optEmail.filter((array: any, i: any) => i == index);
    } else if (type === 'sms') {
      type = 'sms message';
      this.tglSMS = true;
      selected = this.optSMS.filter((array: any, i: any) => i == index);
    } else if (type === 'vm') {
      type = 'voice mail';

      this.tglVM = true;
      selected = this.optVoiceMail.filter((array: any, i: any) => i == index);
    }
    this.tglTitle = 'Edit ' + type + ' template';

    selected.forEach((element: any) => {
      content = element.templateContent;
      name = element.templateName;
    });
    this.templateForm.setValue({
      templateName: name,
      templateContent: content,
    });
    this.tglTemplate = true;
  }

  deleteTemplate(index: any, type: any, templateName: any) {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the template <b>' +
        templateName +
        '</b>?',
      header: 'Deleting template',
      accept: () => {
        if (type === 'email') {
          this.optEmail = this.optEmail.filter(
            (array: any, i: any) => i !== index
          );
        } else if (type === 'sms') {
          this.optSMS = this.optSMS.filter((array: any, i: any) => i !== index);
        } else if (type === 'vm') {
          this.optVoiceMail = this.optVoiceMail.filter(
            (array: any, i: any) => i !== index
          );
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Template "' + templateName + '" was deleted successfully.',
        });
      },
    });
  }
}
