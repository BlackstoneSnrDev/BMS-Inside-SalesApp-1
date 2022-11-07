import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';
import { UsersService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { FormatPhone } from '../../pipes/formatPhone.pipe';

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
  public tglChangeCustomerStatus: boolean = false;
  public customerNewStatus = new FormControl('');
  public optCustomerStatus: any;
  public customerStatus: any;

  constructor(
    private dataService: DataService,
    private usersService: UsersService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formatPhone: FormatPhone
  ) {}

  ngOnInit() {
    this.formElement = this.activeTemplate;

    this.dataService.currentCall.subscribe((currentCall) => {
      this.currentCall = currentCall;
      if (this.currentCall) {
        this.currentCall['customerStatus'] = this.currentCall.status
          ? [this.currentCall.status]
          : [
              {
                label: 'No statuses.',
                background: '#a91e2c',
                color: 'white',
                uid: '0',
              },
            ];
        this.tglModifyAddressForm = false;
        this.tgleditField = false;
        this.addressForm = new FormGroup({
          slcCountry: new FormControl('', [
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

        // this.dataService.getAllStatuses().then(
        //     (response) => {
        //         this.optCustomerStatus = response;

        //     }
        // )

        this.customerStatus = this.currentCall['customerStatus'];
        this.filterCXStatus(this.customerStatus);
      }

      for (let fieldName in this.currentCall) {
        for (let fieldValue of this.formElement) {
          if (fieldName === fieldValue.element_table_value) {
            fieldValue.element_value = this.currentCall[fieldName];

            this.newFormControl[fieldValue.element_table_value] =
              new FormControl(
                {
                  value: this.formatPhone.transform(
                    fieldValue.element_value,
                    'toPhone'
                  ),
                  disabled: this.tgleditField,
                },
                [Validators.required, Validators.minLength(1)]
              );
            this.newFormControl['customerStatus'] = new FormControl('Pending', [
              Validators.required,
              Validators.minLength(1),
            ]);
            this.callDataForm = new FormGroup(this.newFormControl);
          }
        }
      }
    });

    this.dataService.getCustomerGroups().subscribe((data: any[]) => {
      this.tbGroups = data;

      this.usersService.userInfo.subscribe((userInfo: any) => {
        if (userInfo) {
          this.tbGroupActive = [];
          userInfo.activeGroup.forEach((group: any) => {
            let groupSelected = data.filter((v: any) => v.group_id === group);
            let groupId = '';
            let groupName = '';
            groupSelected.forEach((e: any) => {
              groupId = e.group_id;
              groupName = e.group_name;
            });
            this.tbGroupActive.push({
              group_id: groupId,
              group_name: groupName,
            });
          });
        }
      });
    });
  }

  filterCXStatus(currentCXStatus: any) {
    this.dataService.getAllStatuses().then((response) => {
      this.optCustomerStatus = response.filter(
        (a: any) => a.uid !== currentCXStatus[0]['uid']
      );
    });
  }

  getGroupSelected() {
    let groupSelected = this.tbGroups.filter(
      (v: any) => v.group_id === this.groupSelected.value
    );

    this.dataService.selectActiveGroup(this.groupSelected.value);

    this.defaultGroup = false;

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
      detail: 'Group "' + groupName + '" was added successfully.',
    });
    this.groupSelected.reset();
  }

  removeGroupSelected(groupId: string) {
    let groupSelected = this.tbGroups.filter(
      (v: any) => v.group_id === groupId
    );

    let groupName = '';
    groupSelected.forEach((e: any) => {
      groupName = e.group_name;
    });

    this.tbGroupActive = this.tbGroupActive.filter(
      (v: any) => v.group_id !== groupId
    );

    this.dataService.removeActiveGroup(groupId);

    this.tbGroupActive.length > 0
      ? (this.defaultGroup = false)
      : (this.defaultGroup = true);

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Group "' + groupName + '" was removed successfully.',
    });

    this.groupSelected.reset();
  }

  toggleEditFields() {
    this.tgleditField = !this.tgleditField;
  }

  toggleModifyAddressForm(
    addressId: any,
    addressName: any,
    formControlName: any
  ) {
    this.addressForm.reset();
    let currentAddres = this.callDataForm.get(formControlName)?.value;
    let count = currentAddres.split(',').length - 1;
    let street, apt, city, state, zip, country;
    if (count > 4) {
      street = currentAddres.split(',')[0];
      apt = currentAddres.split(',')[1].trim();
      city = currentAddres.split(',')[2];
      state = currentAddres.split(',')[3];
      zip = currentAddres.split(',')[4];
      country = currentAddres.split(',')[5];
    } else {
      street = currentAddres.split(',')[0];
      city = currentAddres.split(',')[1];
      state = currentAddres.split(',')[2];
      zip = currentAddres.split(',')[3];
      country = currentAddres.split(',')[4];
    }

    if (country == undefined || country == null) {
      this.addressForm.patchValue({
        slcCountry: 'US',
      });

      this.messageService.add({
        severity: 'error',
        summary: 'Service Message',
        detail: 'Address format is incorrect. Please fill out the form.',
      });
    } else {
      if (this.addressForm) {
        this.addressForm.patchValue({
          slcCountry: country.replace(/\s/g, ''),
          slcState: state.replace(/\s/g, ''),
          txtCity: city.trim(),
          txtStreet: street.trim(),
          txtApt: apt,
          txtZip: zip.replace(/\s/g, ''),
        });
      }
    }
    this.addressFieldId = addressId;
    this.addressFieldName = addressName;
    this.dataService.getFormCountry().subscribe(
      (response) => {
        this.countries = response.data;
        this.getCountryInfo();
      },

      (error) => {
        console.error(error);
      }
    );
    this.tglModifyAddressForm = true;
  }

  getCountryInfo() {
    this.dataService.getFormState().subscribe(
      (response) => {
        this.selectedCountryCode = this.addressForm.get('slcCountry')!.value;
        this.states = response.data.filter((i: any) =>
          i.iso2.includes(this.selectedCountryCode)
        );

        for (let i of this.states) {
          this.states = i.states;
        }
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

    this.tglModifyAddressForm = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Address was added successfully.',
    });
  }

  cancelEditFields() {
    for (let i of this.formElement) {
      this.callDataForm.patchValue({
        [i.element_table_value]: i.element_value,
      });
    }
    this.tgleditField = false;
  }

  saveEditFields() {
    this.callDataForm.value.uid = this.currentCall.uid;
    this.tgleditField = false;
    this.callDataForm.value['Phone Number'] = this.formatPhone.transform(
      this.callDataForm.value['Phone Number'],
      'toNumber'
    );
    this.dataService.editCustomer(this.callDataForm.value);
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Record was edited successfully.',
    });
  }

  groupFilter(array: any, searching: any): void {
    this.filterGroupList = array.filter((i: any) =>
      i.group_name.toLowerCase().includes(searching.toLowerCase())
    );
  }

  log(val: any) {
    console.log(val);
  }

  toggleCustomerStatus() {
    this.tglChangeCustomerStatus = !this.tglChangeCustomerStatus;

    document.getElementById('btnCustomerStatus')?.classList.toggle('hide');
    document.getElementById('btnCancelStatus')?.classList.toggle('hide');
    document.getElementById('customerStatus')?.classList.toggle('hide');
  }

  changeCustomerStatus(
    oldStatus: any,
    customerName: any,
    customerUid: any,
    newStatus: any
  ) {
    let newCXStatus = this.optCustomerStatus.filter(
      (a: any, i: any) => a.uid == newStatus.value
    );
    let newStatusName = newCXStatus[0]['label'];
    if (oldStatus !== newStatus.value) {
      this.confirmationService.confirm({
        message:
          'Are you sure you want to set <b>' +
          customerName +
          's </b> status as "' +
          newStatusName +
          '"?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.tglChangeCustomerStatus = false;
          this.toggleCustomerStatus();
          this.customerNewStatus.setValue('');
          this.filterCXStatus(this.customerStatus);
          this.dataService.changeCurrentCallStatus(
            customerUid,
            newStatus.value
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail:
              customerName + ' status was set to "' + newStatusName + '".',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Service Message',
        detail:
          customerName +
          ' status was already set to "' +
          newStatusName +
          '" before.',
      });
    }
  }
}
