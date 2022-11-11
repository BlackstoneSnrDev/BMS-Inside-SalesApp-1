import { Component, OnInit, OnDestroy } from '@angular/core';
// Get customer data
import { DataService } from '../../services/services.service';
// User Info
import { UsersService } from '../../services/auth.service';

@Component({
  selector: 'call-information',
  templateUrl: './call-information.component.html',
  styleUrls: [
    './call-information.component.css',
    '../../css/neumorphism.component.css',
  ],
})
export class CallInfoComponent implements OnInit {
  private _customerSubscription: any;
  public tdData: any = [];
  public dbObjKey: any;
  public userInfo: any;
  public activeTemplate: any;
  public dialSessionArray: any = [];

  constructor(
    private DataService: DataService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    // Data on subscriptions and unsubscribing to prevent memory leaks...
    // https://stackoverflow.com/questions/46906685/property-unsubscribe-does-not-exist-on-type-observabledatasnapshot

    // We frist need to ensure we have an active template (as observed in authServices) so that we can get customers data.
    this._customerSubscription = this.usersService.activeTemplate.subscribe(
      (template) =>
        template
          ? this.DataService.getDialingSessionTemplate()
              .then(
                (activeTemplate) => (
                  (this.activeTemplate = activeTemplate.sort(
                    (a, b) => a.element_order - b.element_order
                  )),
                  console.log(activeTemplate)
                )
              )
              .then(() => {
                this.DataService.getActiveGroupCustomerArray();
              })
          : null
    );
    this.usersService.dbObjKey.subscribe((dbObjKey: any) => {
      if (dbObjKey) {
        this.dbObjKey = dbObjKey;
        console.log(dbObjKey);
      } else {
        console.log('missing db data');
      }
    });

    this.usersService.userInfo.subscribe((userInfo: any) => {
      if (userInfo && userInfo.username) {
        this.userInfo = userInfo;
        console.log('User Info Loaded');
      } else {
        console.log('No User Info');
      }
    });
  }

  ngOnDestroy() {
    this._customerSubscription.unsubscribe();
  }
}
