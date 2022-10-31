import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { FormControl } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Device } from 'twilio-client';

@Component({
  selector: 'phone-component',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.css', '../../css/neumorphism.component.css'],
})
export class PhoneComponent implements OnInit {
  public componentPhone: any;
  public phoneHistory: any;
  public tglAutoDialer: boolean = false;
  public containerCallStatus: boolean = false;
  public holdStatus: boolean = false;
  public muteStatus: boolean = false;
  public xferStatus: boolean = false;
  public tglEditLayout: boolean = false;

  public dialSessionArray: any = [];
  public currentCall: any;
  public dupDialSessionArray: any;

  public currentCallPhoneNumber: any;

  public searchCall = new FormControl();

  public optVoiceMail: any;
  public voiceMailLeft = new FormControl();

  public optSMS: any;
  public smsMessageSent = new FormControl();

  public optEmail: any;
  public emailSent = new FormControl();

  public callStatus: any = 'Call Status';
  public _device: any;
  public options: any = {
    codecPreferences: ['pcmu', 'opus'],
  };
  public callStatusLabel: any;
  timeLeft: number = 0;
  interval: any;
  constructor(
    public DataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.DataService.getFormElementsData().subscribe(
      (response) => {
        this.componentPhone = response.componentPhone;
      },
      (error) => {
        console.error(error);
      }
    );

    this.DataService.dialSessionArray.subscribe((dialSessionArray: any) => {
      this.dialSessionArray = dialSessionArray;
      this.dupDialSessionArray = this.dialSessionArray;
    });

    this.DataService.currentCall.subscribe((currentCall: any) => {
      if (currentCall) {
        this.currentCall = currentCall;
        this.currentCallPhoneNumber = currentCall['Phone Number'];
      }
    });

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

    this.DataService.sendText().then((response) => {
      console.log('Send Text: ', response.token);
      // Setup Twilio.Device
      this._device = new Device(response.token, {
        // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
        // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
        codecPreferences: this.options.codecPreferences,
        // Use fake DTMF tones client-side. Real tones are still sent to the other end of the call,
        // but the client-side DTMF tones are fake. This prevents the local mic capturing the DTMF tone
        // a second time and sending the tone twice. This will be default in 2.0.
        fakeLocalDTMF: true,
        // Use `enableRingingState` to enable the device to emit the `ringing`
        // state. The TwiML backend also needs to have the attribute
        // `answerOnBridge` also set to true in the `Dial` verb. This option
        // changes the behavior of the SDK to consider a call `ringing` starting
        // from the connection to the TwiML backend to when the recipient of
        // the `Dial` verb answers.
        enableRingingState: true,
      });

      this._device.on('ready', (device: any) => {
        console.log('Twilio.Device Ready!');
      });

      this._device.on('error', (error: any) => {
        console.log('Twilio.Device Error: ' + error.message);
      });

      this._device.on('connect', (conn: any) => {
        this.callStatusLabel = 'Call established';
        console.log('Successfully established call!');
        this.updateCallStatus('In Call');
        this.containerCallStatus = true;
      });

      this._device.on('disconnect', (conn: any) => {
        if (this.tglAutoDialer) {
          this.nextCall(), this.btnCall(this.currentCallPhoneNumber);
        }
        this.callStatusLabel = 'Call ended';
        console.log('Call ended');
        this.updateCallStatus('Call Status');
        this.pauseTimer();
        setTimeout(() => {
          this.containerCallStatus = false;
        }, 400);
      });

      this._device.on('incoming', (conn: any) => {
        console.log('Incoming connection from ' + conn.parameters.From);
        // accept the incoming connection and start two-way audio
        conn.accept();
      });

      this._device.on('cancel', (conn: any) => {
        console.log('Call canceled');
        this.callStatusLabel = 'Call canceled';
        this.updateCallStatus('Call Status');
        this.pauseTimer();
        setTimeout(() => {
          this.containerCallStatus = false;
        }, 400);
      });
    });
  }

  updateCallStatus(status: any) {
    this.callStatus = status;
  }

  nextCall() {
    let currentCallIndex = this.dialSessionArray.findIndex(
      (x: { uid: any }) => x.uid === this.currentCall.uid
    );

    this.DataService.setActiveCall(
      this.dialSessionArray[currentCallIndex + 1].uid
    );

    let newCallName = this.dialSessionArray[currentCallIndex + 1].fullname;
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Next call: ' + newCallName,
    });
  }

  selectCustomer(uid: string) {
    this.DataService.setActiveCall(uid);

    let oldCall = this.currentCall.fullname;
    let oldCallPhone = this.currentCall.phonenumber;

    setTimeout(() => {
      if (oldCallPhone !== this.currentCall.phonenumber)
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail:
            'Current customer has changed from "' +
            oldCall +
            '" to "' +
            this.currentCall.fullname +
            '".',
        });
    }, 400);
  }

  showTimeHandled(callId: any) {
    document.getElementById('call' + callId)?.classList.toggle('hide');
  }

  filterCall() {
    let value = this.searchCall.value.toLowerCase();
    if (value) {
      this.dialSessionArray = this.dupDialSessionArray;
      this.dialSessionArray = this.dialSessionArray.filter(
        (a: any, g: any) =>
          a.MRN.toLowerCase().includes(value) ||
          a.fullname.toLowerCase().includes(value) ||
          a.phonenumber
            .toLowerCase()
            .replace(/[()-\s]/g, '')
            .includes(value.replace(/[()-\s]/g, ''))
      );
    } else {
      this.dialSessionArray = this.dupDialSessionArray;
    }
  }

  toggleAutoDialer() {
    this.functionMissing();

    this.tglAutoDialer = !this.tglAutoDialer;
    let msg = '';
    if (this.tglAutoDialer) {
      msg = 'Auto-dialer is now active.';
    } else {
      msg = 'Auto-dialer was deactivated successfully.';
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: msg,
    });
  }

  btnCall(outgoingNumber: any) {
    console.log('Outgoing Number: ', outgoingNumber);

    var regExNumber = '+1' + ('' + outgoingNumber).replace(/\D/g, '');
    console.log('Calling ' + regExNumber + '...');
    let callstatus: any = this.callStatusLabel;
    if (this._device) {
      var outgoingConnection = this._device.connect({
        outgoingPhoneNumber: regExNumber,
      });
      outgoingConnection.on('ringing', function () {
        callstatus = 'Ringing...';
      });
    }
    this.callStatusLabel = callstatus;
    this.startTimer();
    this.containerCallStatus = !this.containerCallStatus;
    this.holdStatus = false;
    this.muteStatus = false;
    this.xferStatus = false;
  }

  leaveVoiceMail() {
    this.functionMissing();

    this.confirmationService.confirm({
      message: 'Are you sure you want leave this voice mail?',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Voice mail was left.',
        });

        this.voiceMailLeft.reset();
      },
    });
  }

  sendSMSMessage(e: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to send this message?',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.DataService.makeCall(
          'template',
          e.value,
          this.currentCall.uid,
          '+1' + this.currentCall.phonenumber
        ).then((response) => {
          console.log('Send SMS message: ', response);
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'SMS Message was sent.',
        });
        this.smsMessageSent.reset();
      },
      reject: () => {
        this.smsMessageSent.reset();
      },
    });
  }

  sendEmail() {
    this.functionMissing();

    this.confirmationService.confirm({
      message: 'Are you sure you want send this email?',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Email was sent.',
        });
        this.emailSent.reset();
      },
    });
  }

  btnHangUpCall() {
    this._device.disconnectAll();
    this.containerCallStatus = false;
    this.pauseTimer();
  }

  btnHoldCall() {
    this.holdStatus = !this.holdStatus;
    this.functionMissing();
  }

  btnMuteCall() {
    this.muteStatus = !this.muteStatus;
    this.functionMissing();
  }

  btnXferCall() {
    this.xferStatus = !this.xferStatus;
    this.holdStatus = true;
    this.functionMissing();
  }

  log(event: Event) {
    console.log(event);
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timeLeft++;
    }, 1000);
  }

  pauseTimer() {
    this.timeLeft = 0;
    clearInterval(this.interval);
  }

  functionMissing() {
    this.messageService.add({
      severity: 'error',
      summary: 'Service Message',
      detail: 'Function not connected to DB. Missing back-end intervention.',
      sticky: true,
    });
  }
}
function updateCallStatus(arg0: string) {
  throw new Error('Function not implemented.');
}
