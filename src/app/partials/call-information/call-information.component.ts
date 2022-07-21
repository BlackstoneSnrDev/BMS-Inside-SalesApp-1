import { Component, OnInit, OnDestroy } from '@angular/core';
// Get customer data
import { DataService } from '../../services/services.service';
// User Info
import { UsersService } from "../../services/auth.service";

@Component({

    selector: 'call-information',
    templateUrl: './call-information.component.html',
    styleUrls: ['./call-information.component.css',
    '../../css/neumorphism.component.css',]

})

export class CallInfoComponent implements OnInit {

    private _customerSubscription: any;
    public tdData: any = [];
    public dbObjKey: any;
    public activeTemplate: any;
    public dialSessionArray: any = [];

    constructor (private DataService: DataService, private usersService: UsersService) { }

    ngOnInit() {
        // Data on subscriptions and unsubscribing to prevent memory leaks... 
        // https://stackoverflow.com/questions/46906685/property-unsubscribe-does-not-exist-on-type-observabledatasnapshot

        // We frist need to ensure we have an active template (as observed in authServices) so that we can get customers data.
        this._customerSubscription = this.usersService.activeTemplate.subscribe(template =>
            template ?
                this.DataService.getDialingSessionTemplate()
                    .then(activeTemplate => this.activeTemplate = activeTemplate.sort((a, b) => a.element_order - b.element_order))
                    .then(() => {
                        this.DataService.getActiveGroupCustomerArray().subscribe(dialSessionArray =>
                            this.dialSessionArray = dialSessionArray &&
                            this.DataService.setActiveCall(dialSessionArray[0].uid)
                        )
                    })
                : null);
    }

    ngOnDestroy() {
        console.log(this.dialSessionArray);
        this._customerSubscription.unsubscribe();
    }

}