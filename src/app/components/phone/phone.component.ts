import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
  selector: 'phone-component',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.css',
  '../../css/neumorphism.component.css',
],
})

export class PhoneComponent implements OnInit {

  public componentPhone: any;
  public phoneHistory: any;
  public toggleStatus: boolean = false;
  public containerCallStatus: boolean = false;
  public holdStatus: boolean = false;
  public muteStatus: boolean = false;
  public xferStatus: boolean = false;
    
  constructor(private DataService: DataService) { }

    ngOnInit() {
      
        this.DataService.getFormElementsData().subscribe(
            response => {
              this.componentPhone = response.componentPhone
            },
            error => {
              console.error(error)
            }
        )

        this.DataService.getCallHistoryData().subscribe(
            response => {
              this.phoneHistory = response.callHistory
              console.log("Output 1" + this.phoneHistory)

            },
            error => {
              console.error(error)
            }
        )
      }

      showTimeHandle(event: Event){
        return (event.target as HTMLInputElement).parentElement?.parentElement?.lastElementChild?.previousElementSibling?.classList.toggle("hide");
      }

      btnAutoDialer(){
        this.toggleStatus = ! this.toggleStatus
      }

      btnAnswerCall(){
        this.containerCallStatus = ! this.containerCallStatus
        this.holdStatus = false;
        this.muteStatus = false;
        this.xferStatus = false;
      }
      
      btnHangUpCall(){
        this.containerCallStatus = false;
      }

      btnHoldCall(){
        this.holdStatus = ! this.holdStatus
      }
      
      btnMuteCall(){
        this.muteStatus = ! this.muteStatus
      }

      btnXferCall(){
        this.xferStatus = ! this.xferStatus
        this.holdStatus = true
      }
  }
  