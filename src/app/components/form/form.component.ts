// import { Component, OnInit, Input } from '@angular/core';
// import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { DataService } from '../../services/services.service';
// import { UsersService } from '../../services/auth.service';
// import { MessageService } from 'primeng/api';

// @Component({
//     selector: 'form-component',
//     templateUrl: './form.component.html',
//     styleUrls: ['./form.component.css', '../../css/neumorphism.component.css'],
// })
// export class FormComponent implements OnInit {

//     @Input() dialSessionArray: any;
//     @Input() activeTemplate: any;

//     public currentCall: any;

//     public formElement: any;
//     // public activeTemplate: any;
//     public dbObjKey: any;

//     public tgleditField: boolean = false;

//     public callDataForm!: FormGroup
//     public newFormControl: any = {};
//     public newField: any;

//     public tglModifyAddressForm: boolean = false;
//     public addressForm!: FormGroup
//     public addressFieldId: string = '';
//     public addressFieldName: string = '';

//     public countries: any;
//     public selectedCountryCode: string = 'US';
//     public cities: any;
//     public selectedCityCode: string = '';
//     public states: any;
//     public selectedStateCode: string = '';

//     public onValidationMsg: string = '';
//     public tglEditLayout: boolean = false;

//     public filterGroupList: any;
//     public tbGroups: any;
//     public userInfo: any;
//     public groupSelected = new FormControl();
//     public tbGroupActive: any = [];
//     public defaultGroup: boolean = true;

//     constructor(private dataService: DataService, private usersService: UsersService, private messageService: MessageService) { }

//     ngOnInit() {
//         this.dataService.currentCall.subscribe(currentCall => this.currentCall = currentCall);

//         this.formElement = this.activeTemplate;
//         for (let i of this.formElement) {
//             this.newFormControl[i.element_placeholder] = new FormControl({ value: i.element_value, disabled: this.tgleditField }, [Validators.required, Validators.minLength(1)]);
//         }
//         this.callDataForm = new FormGroup(this.newFormControl);

//         this.dataService.getCustomerGroups().subscribe((data) => {
//             this.tbGroups = data;
//         });
//     }

//     getGroupSelected() {
//         let groupSelected = this.tbGroups.filter(
//             (v: any) => v.group_id === this.groupSelected.value
//         );

//         this.defaultGroup = false;
//         // Show only one group
//         // this.tbGroupActive = groupSelected

//         // Show multiples groups
//         let groupId = '';
//         let groupName = '';
//         groupSelected.forEach((e: any) => {
//             groupId = e.group_id;
//             groupName = e.group_name;
//         });

//         this.tbGroupActive.push({ group_id: groupId, group_name: groupName });
//         console.log(this.tbGroupActive);

//         this.messageService.add({
//             severity: 'success',
//             summary: 'Service Message',
//             detail: 'Group "' + groupName + '" was added to calling.',
//         });
//     }

//     removeGroupSelected(groupId: string) {
//         this.tbGroupActive = this.tbGroupActive.filter(
//             (v: any) => v.group_id !== groupId
//         );

//         this.tbGroupActive.length > 0
//             ? (this.defaultGroup = false)
//             : (this.defaultGroup = true);
//         console.log(this.tbGroupActive);

//         this.messageService.add({
//             severity: 'success',
//             summary: 'Service Message',
//             detail: 'Group was removed from calling.',
//         });
//     }

//     toggleEditFields() {

//         this.tgleditField = !this.tgleditField;

//     }

//     toggleModifyAddressForm(addressId: any, addressName: any) {

//         this.addressForm = new FormGroup({
//             slcCountry: new FormControl('US', [Validators.required, Validators.minLength(1)]),
//             slcState: new FormControl('', [Validators.required, Validators.minLength(1)]),
//             txtCity: new FormControl('', [Validators.required, Validators.minLength(1)]),
//             txtStreet: new FormControl('', [Validators.required, Validators.minLength(1)]),
//             txtApt: new FormControl(''),
//             txtZip: new FormControl('', [Validators.required, Validators.minLength(1)]),
//         })

//         this.addressFieldId = addressId
//         this.addressFieldName = addressName

//         this.tglModifyAddressForm = true
//         this.dataService.getFormCountry().subscribe(

//             (response) => {

//                 this.countries = response.data
//                 this.getCountryInfo()
//             },

//             (error) => {
//                 console.error(error);
//             }

//         );
//     }

//     getCountryInfo() {


//         // this.dataService.getFormCity().subscribe(

//         //     (response) => {
//         // this.selectedCountryCode = this.addressForm.get('slcCountry')!.value

//         //         this.cities = response.data.filter((i: any) => i.iso2.includes(this.selectedCountryCode))
//         //         for (let a of this.cities) {
//         //             this.cities = a.cities.map((value: any, i: any) => ({ id: i, name: value }))
//         //         }
//         //         console.log(this.cities)

//         //     },

//         //     (error) => {
//         //         console.error(error);
//         //     } 

//         // );
//         this.dataService.getFormState().subscribe(

//             (response) => {

//                 this.selectedCountryCode = this.addressForm.get('slcCountry')!.value
//                 this.states = response.data.filter((i: any) => i.iso2.includes(this.selectedCountryCode)
//                 );

//                 for (let i of this.states) {
//                     this.states = i.states;
//                 }
//                 console.log(this.states);
//             },

//             (error) => {
//                 console.error(error);
//             }
//         );
//     }

//     saveAddressModified(city: string, street: string, apt: string, zip: string) {
//         this.selectedStateCode = this.addressForm.get('slcState')!.value;

//         let newAddres;
//         if (apt) {
//             newAddres =
//                 street +
//                 ', ' +
//                 apt +
//                 ', ' +
//                 city +
//                 ', ' +
//                 this.selectedStateCode +
//                 ', ' +
//                 zip +
//                 ', ' +
//                 this.selectedCountryCode;
//         } else {
//             newAddres =
//                 street +
//                 ', ' +
//                 city +
//                 ', ' +
//                 this.selectedStateCode +
//                 ', ' +
//                 zip +
//                 ', ' +
//                 this.selectedCountryCode;
//         }

//         this.callDataForm.patchValue({
//             [this.addressFieldName]: newAddres,
//         });
//         // this.formElement[this.addressFieldId]['element_value'] = newAddres;

//         this.tglModifyAddressForm = false;
//         console.log(this.formElement);
//         this.messageService.add({
//             severity: 'success',
//             summary: 'Service Message',
//             detail: 'Address was added successfully.',
//         });
//     }

//     cancelEditFields() {
//         for (let i of this.formElement) {
//             this.callDataForm.patchValue({
//                 [i.element_placeholder]: i.element_value,
//             });
//         }
//         this.tgleditField = false;
//     }

//     saveEditFields() {
//         console.log(this.callDataForm.value);
//         this.tgleditField = false;
//     }

//     groupFilter(array: any, searching: any): void {
//         this.filterGroupList = array.filter((i: any) =>
//             i.group_name.toLowerCase().includes(searching.toLowerCase())
//         );
//         console.log(this.filterGroupList);
//     }

//     log(val: any) {
//         console.log(val);
//     }
// }

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';
import { UsersService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

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

  public callDataForm!: FormGroup;
  public newFormControl: any = {};
  public newField: any;

  public tglModifyAddressForm: boolean = false;
  public addressForm!: FormGroup;
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

  public filterGroupList: any;
  public tbGroups: any;
  public userInfo: any;
  public groupSelected = new FormControl();
  public tbGroupActive: any = [];
  public defaultGroup: boolean = true;

  constructor(
    private dataService: DataService,
    private usersService: UsersService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
   
    this.formElement = this.activeTemplate;

        console.log(this.formElement)
        this.dataService.currentCall.subscribe(
          (currentCall) => {
            this.currentCall = currentCall
          
            console.log(this.currentCall)
    
          for (let fieldName in this.currentCall) {
            for (let fieldValue of this.formElement) {

              if(fieldName === fieldValue.element_table_value){
                fieldValue.element_value = this.currentCall[ fieldName ]

                this.newFormControl[fieldValue.element_table_value] = new FormControl(
                  { value: fieldValue.element_value, disabled: this.tgleditField },
                  [Validators.required, Validators.minLength(1)]
                );
                this.callDataForm = new FormGroup(this.newFormControl);
              }
            }
          }
        }
        );

    this.dataService.getCustomerGroups().subscribe((data) => {
      this.tbGroups = data;
    });
  }

  getGroupSelected() {
    let groupSelected = this.tbGroups.filter(
      (v: any) => v.group_id === this.groupSelected.value
    );

    this.defaultGroup = false;
    // Show only one group
    // this.tbGroupActive = groupSelected

    // Show multiples groups
    let groupId = '';
    let groupName = '';
    groupSelected.forEach((e: any) => {
      groupId = e.group_id;
      groupName = e.group_name;
    });

    this.tbGroupActive.push({ group_id: groupId, group_name: groupName });

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Group "' + groupName + '" was added to calling.',
    });
  }

  removeGroupSelected(groupId: string) {
    this.tbGroupActive = this.tbGroupActive.filter(
      (v: any) => v.group_id !== groupId
    );

    this.tbGroupActive.length > 0
      ? (this.defaultGroup = false)
      : (this.defaultGroup = true);

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Group was removed from calling.',
    });
  }

  toggleEditFields() {
    this.tgleditField = !this.tgleditField;
    console.log(this.callDataForm.value)
  }

  toggleModifyAddressForm(addressId: any, addressName: any) {
    this.addressForm = new FormGroup({
      slcCountry: new FormControl('US', [
        Validators.required,
        Validators.minLength(1),
      ]),
      slcState: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtCity: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtStreet: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtApt: new FormControl(''),
      txtZip: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
    });

    this.addressFieldId = addressId;
    this.addressFieldName = addressName;

    this.tglModifyAddressForm = true;
    this.dataService.getFormCountry().subscribe(
      (response) => {
        this.countries = response.data;
        this.getCountryInfo();
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
        this.selectedCountryCode = this.addressForm.get('slcCountry')!.value;
        this.states = response.data.filter((i: any) =>
          i.iso2.includes(this.selectedCountryCode)
        );

        for (let i of this.states) {
          this.states = i.states;
        }
        console.log(this.states);
      },

      (error) => {
        console.error(error);
      }
    );
  }

  saveAddressModified(city: string, street: string, apt: string, zip: string) {
    this.selectedStateCode = this.addressForm.get('slcState')!.value;

    let newAddres;
    if (apt) {
      newAddres =
        street +
        ', ' +
        apt +
        ', ' +
        city +
        ', ' +
        this.selectedStateCode +
        ', ' +
        zip +
        ', ' +
        this.selectedCountryCode;
    } else {
      newAddres =
        street +
        ', ' +
        city +
        ', ' +
        this.selectedStateCode +
        ', ' +
        zip +
        ', ' +
        this.selectedCountryCode;
    }

    this.callDataForm.patchValue({
      [this.addressFieldName]: newAddres,
    });
    // this.formElement[this.addressFieldId]['element_value'] = newAddres;

    this.tglModifyAddressForm = false;
    console.log(this.formElement);
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Address was added successfully.',
    });
  }

  cancelEditFields() {
    for (let i of this.formElement) {
      this.callDataForm.patchValue({
        [i.element_placeholder]: i.element_value,
      });
    }
    this.tgleditField = false;
  }

  saveEditFields() {
    console.log(this.callDataForm.value);
    this.tgleditField = false;
  }

  groupFilter(array: any, searching: any): void {
    this.filterGroupList = array.filter((i: any) =>
      i.group_name.toLowerCase().includes(searching.toLowerCase())
    );
    console.log(this.filterGroupList);
  }

  log(val: any) {
    console.log(val);
  }
}