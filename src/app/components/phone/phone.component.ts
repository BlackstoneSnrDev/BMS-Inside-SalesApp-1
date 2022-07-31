import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';

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
  public currentCallPhoneNumber: any;

  constructor(public DataService: DataService) {}

  ngOnInit() {

      this.DataService.getFormElementsData().subscribe(
          (response) => {
              this.componentPhone = response.componentPhone;
              console.log(response.componentPhone);
          },
          (error) => {
              console.error(error);
          }
      );

      this.DataService.dialSessionArray.subscribe((dialSessionArray: any) => {
          this.dialSessionArray = dialSessionArray;
      })

      this.DataService.currentCall.subscribe((currentCall: any) => {
          if (currentCall) {
              this.currentCall = currentCall;
              this.currentCallPhoneNumber = this.DataService.formatPhoneNumber(currentCall.phonenumber);
          } else {
              console.log('no current call');
          }

      })

  }

  nextCall() {
    let currentCallIndex = this.dialSessionArray.findIndex((x: { uid: any; }) => x.uid === this.currentCall.uid)
    this.DataService.setActiveCall(this.dialSessionArray[currentCallIndex + 1].uid);
  }

  selectCustomer(uid: string){
    this.DataService.setActiveCall(uid);
  }

  showTimeHandle(event: Event) {
    return (
      event.target as HTMLInputElement
    ).parentElement?.parentElement?.lastElementChild?.previousElementSibling?.classList.toggle(
      'hide'
    );
  }

  toggleAutoDialer() {
    this.tglAutoDialer = !this.tglAutoDialer;
  }

  btnAnswerCall() {
    this.containerCallStatus = !this.containerCallStatus;
    this.holdStatus = false;
    this.muteStatus = false;
    this.xferStatus = false;
  }

  btnHangUpCall() {
    this.containerCallStatus = false;
  }

  btnHoldCall() {
    this.holdStatus = !this.holdStatus;
  }

  btnMuteCall() {
    this.muteStatus = !this.muteStatus;
  }

  btnXferCall() {
    this.xferStatus = !this.xferStatus;
    this.holdStatus = true;
  }

  toggleEditLayout() {
    this.tglEditLayout = !this.tglEditLayout;
  }

  editLayout(elementId: number) {
    console.log(elementId);
  }

  createNewField() {
    console.log('elementId');
  }

  log(event: Event) {
    console.log(event);
  }

}
