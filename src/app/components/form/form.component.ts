import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';
import { UsersService } from '../../services/auth.service';

@Component({
    selector: 'form-component',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css', '../../css/neumorphism.component.css'],
})

export class FormComponent implements OnInit {

    @Input() dialSessionArray: any;
    @Input() activeTemplate: any;

    public currentCall: any;

    public formElement: any;
    //public activeTemplate: any;
    public dbObjKey: any;

    public tgleditField: boolean = false;

    public callDataForm!: FormGroup
    public newFormControl: any = {};
    public newField: any;

    public tglModifyAddressForm: boolean = false;
    public addressForm!: FormGroup
    public addressFieldId: string = '';
    public addressFieldName: string = '';

    public countries: any;
    public selectedCountryCode: string = 'US';
    public cities: any;
    public selectedCityCode: string = '';
    public states: any;
    public selectedStateCode: string = '';

    public onValidationMsg: string = '';
    public tglEditLayout: boolean = false;

    constructor(private dataService: DataService, private usersService: UsersService) { }

    ngOnInit() {
        this.dataService.currentCall.subscribe(currentCall => this.currentCall = currentCall);

        this.formElement = this.activeTemplate;
        for (let i of this.formElement) {
            this.newFormControl[i.element_placeholder] = new FormControl({ value: i.element_value, disabled: this.tgleditField }, [Validators.required, Validators.minLength(1)]);
        }
        this.callDataForm = new FormGroup(this.newFormControl);


    }

    toggleEditFields() {

        this.tgleditField = !this.tgleditField;

    }

    toggleModifyAddressForm(addressId: any, addressName: any) {

        this.addressForm = new FormGroup({
            slcCountry: new FormControl('US', [Validators.required, Validators.minLength(1)]),
            slcState: new FormControl('', [Validators.required, Validators.minLength(1)]),
            txtCity: new FormControl('', [Validators.required, Validators.minLength(1)]),
            txtStreet: new FormControl('', [Validators.required, Validators.minLength(1)]),
            txtApt: new FormControl(''),
            txtZip: new FormControl('', [Validators.required, Validators.minLength(1)]),
        })

        this.addressFieldId = addressId
        this.addressFieldName = addressName

        this.tglModifyAddressForm = true
        this.dataService.getFormCountry().subscribe(

            (response) => {

                this.countries = response.data
                this.getCountryInfo()
            },

            (error) => {
                console.error(error);
            }

        );
    }

    getCountryInfo() {


        // this.dataService.getFormCity().subscribe(

        //     (response) => {
            // this.selectedCountryCode = this.addressForm.get('slcCountry')!.value

        //         this.cities = response.data.filter((i: any) => i.iso2.includes(this.selectedCountryCode))
        //         for (let a of this.cities) {
        //             this.cities = a.cities.map((value: any, i: any) => ({ id: i, name: value }))
        //         }
        //         console.log(this.cities)

        //     },

        //     (error) => {
        //         console.error(error);
        //     } 

        // );
        this.dataService.getFormState().subscribe(

            (response) => {
                
                this.selectedCountryCode = this.addressForm.get('slcCountry')!.value
                this.states = response.data.filter((i: any) => i.iso2.includes(this.selectedCountryCode))

                for (let i of this.states) {
                    this.states = i.states
                }
                console.log(this.states)

            },

            (error) => {
                console.error(error);
            }

        );
    }

    saveAddressModified(city: string, street: string, apt: string, zip: string) {

        this.selectedStateCode = this.addressForm.get('slcState')!.value

        this.onValidationMsg = "Address was added successfully.";
        setTimeout(() => {
            this.onValidationMsg = "";
        }, 6000);

        let newAddres
        if (apt) {
            newAddres = this.selectedCountryCode + ', ' + this.selectedStateCode + ', ' + city + ', ' + street + ', ' + apt + ', ' + zip
        } else {
            newAddres = this.selectedCountryCode + ', ' + this.selectedStateCode + ', ' + city + ', ' + street + ', ' + zip
        }

        this.callDataForm.patchValue({
            [this.addressFieldName]: newAddres
        });
        this.formElement[this.addressFieldId]['element_value'] = newAddres

        this.tglModifyAddressForm = false
        console.log(this.formElement)
    }

    cancelEditFields() {

        for (let i of this.formElement) {
            this.callDataForm.patchValue({
                [i.element_placeholder]: i.element_value
            });
        }
        this.tgleditField = false;

    }

    saveEditFields() {

        console.log(this.callDataForm.value)
        this.tgleditField = false;
    }

    log(val: any) { console.log(val); }
}
