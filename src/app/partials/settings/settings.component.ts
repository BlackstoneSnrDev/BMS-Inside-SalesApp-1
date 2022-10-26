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
  public voiceRecorderTime: number = 0;

  public templateName: string = '';
  public editUid: string = '';

  public templateForm!: FormGroup;
  public userInfo: any;
  public initialsName: string = '';
  public todayDate: any;

  title = 'micRecorder';
  timeLeft: number = 30;
  interval: any;
  // Declare Record OBJ
  record: any;
  // Will use this flag for toggeling recording
  recording = false;
  // URL of Blob
  url: any;
  blobData: any;
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
    this.DataService.getUserSettings().subscribe((response) => {
      response.forEach((item: any) => {
        if (item.docId === 'emails') {
          let emailArray: {
            templateContent: any;
            templateId: any;
            templateName: any;
          }[] = [];
          Object.values(item)
            .filter((e) => typeof e !== 'string')
            .forEach((email: any) => {
              emailArray.push({
                templateContent: email.data,
                templateId: email.uid,
                templateName: email.templateName,
              });
            });
          this.optEmail = emailArray;
        } else if (item.docId === 'textMessage') {
          let textArray: {
            templateContent: any;
            templateId: any;
            templateName: any;
          }[] = [];
          Object.values(item)
            .filter((e) => typeof e !== 'string')
            .forEach((email: any) => {
              textArray.push({
                templateContent: email.data,
                templateId: email.uid,
                templateName: email.templateName,
              });
            });
          this.optSMS = textArray;
        } else if (item.docId === 'voicemail') {
          let voicemailArray: {
            templateContent: any;
            templateId: any;
            templateName: any;
          }[] = [];
          Object.values(item)
            .filter((e) => typeof e !== 'string')
            .forEach((email: any) => {
              voicemailArray.push({
                templateContent: email.url,
                templateId: email.uid,
                templateName: email.fileName,
              });
            });
          this.optVoiceMail = voicemailArray;
        }
      });
    });

    this.usersService.userInfo.subscribe(
      (userInfo) => (
        (this.userInfo = userInfo),
        (this.initialsName = this.userInfo.name
          .split(' ')
          .map((word: any) => word[0])
          .join(''))
      )
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

  initiateRecording() {
    this.recording = true;
    this.startTimer();
    let mediaConstraints = {
      video: false,
      audio: true,
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }

  successCallback(stream: MediaStream) {
    var options = {
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1,
      //sampleRate: 64000,
    };
    //Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }

  startTimer() {
    if (this.record) {
      this.record.clearRecordedData();
    }
    this.url = '';

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.voiceRecorderTime = this.voiceRecorderTime + 3.4;
      } else {
        this.stopRecording();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timeLeft = 30;
    this.recording = false;
    this.voiceRecorderTime = 0;

    clearInterval(this.interval);
  }

  rRecordVoiceMail() {
    this.pauseTimer();
    this.url = '';
    if (this.record) {
      this.record.clearRecordedData();
    }
    this.initiateRecording();
  }

  stopRecording() {
    this.recording = false;
    this.pauseTimer();
    if (this.record) {
      this.record.stop(this.processRecording.bind(this));
    }
  }
  /**
   * processRecording Do what ever you want with blob
   * @param  {any} blob Blog
   */
  processRecording(blob: Blob | MediaSource) {
    this.url = URL.createObjectURL(blob);
    this.blobData = blob;

  }

  saveVoiceMail() {
    this.DataService.saveBlob(this.blobData, this.templateName)
      .then((response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: response,
        });
        this.templateForm.reset();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  errorCallback(_error: any) {
    this.error = 'Can not play audio in your browser';
  }

  templateNameChange(value: string) {
    this.templateName = value;
  }

  toggleTemplate(type: any) {
    this.tglPrevTemplate = '';
    this.tglEmail = false;
    this.tglSMS = false;
    this.tglEmail = false;
    this.tglVM = false;
    this.templateForm.reset();
    this.url = '';

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
    if (this.tglSMS) {
      this.DataService.saveTextMessageTemplate(
        this.templateForm.value,
        this.editUid
      )
        .then((response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail: response,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (this.tglEmail) {
      this.DataService.saveEmailTemplate(this.templateForm.value, this.editUid)
        .then((response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail: response,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }

    this.templateForm.reset();
    this.tglEmail = false;
    this.tglSMS = false;
    this.tglEmail = false;
    this.tglVM = false;
    this.tglPrevTemplate = '';
    this.tglTemplate = false;
    this.editUid = '';
  }

  cancelCreateTemplate() {
    if (this.record) {
      this.record.clearRecordedData();
      this.url = '';
    }
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
    } else if (type === 'sms') {
      type = 'sms message';

      this.tglPrevTemplate = this.optSMS.filter(
        (array: any, i: any) => i == index
      );

      this.tglSMS = true;
      this.tglTemplate = true;
    } else if (type === 'vm') {
      type = 'voice mail';

      this.tglPrevTemplate = this.optVoiceMail.filter(
        (array: any, i: any) => i == index
      );

      this.tglVM = true;
      this.tglTemplate = true;
    }
    this.tglTitle = 'Preview ' + type + ' template';
  }

  setAudioPreview(content: any) {
    this.url = content;
  }

  editTemplate(index: any, uid: any, type: any) {

    this.tglSMS = false;
    this.tglVM = false;
    this.tglEmail = false;
    this.tglPrevTemplate = '';

    this.editUid = uid;

    let content = '';
    let name = '';
    let id = '';
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
      id = element.templateId;
    });
    this.templateForm.setValue({
      templateName: name,
      templateContent: content,
    });
    this.tglTemplate = true;
  }

  deleteTemplate(index: any, type: any, templateName: any, uid: any) {

    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the template <b>' +
        templateName +
        '</b>?',
      header: 'Deleting template',
      accept: () => {
        this.DataService.deleteSettingTemplate(uid, type).then((response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail: 'Template "' + templateName + '" was deleted successfully.',
          });
        });
      },
    });
  }
}
