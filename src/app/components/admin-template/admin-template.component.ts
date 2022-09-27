import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import RandomId from 'src/app/services/services.randomId';
import { UsersService } from 'src/app/services/auth.service';

let len = 12;
let pattern = 'aA0';

@Component({
  selector: 'app-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrls: [
    './admin-template.component.css',
    '../../css/neumorphism.component.css',
    '../../components/table/table.component.css',
  ],
})
export class AdminTemplateComponent implements OnInit {
  public allTemplates: any;

  public thData: any;
  public tdData: any;
  public clonedTdData: any = {};
  public selectElmType!: string[];

  public tbSelectedRows: any;
  public loading: boolean = true;

  public tglTemplate: boolean = false;
  public tglCreateNewTemplate: boolean = false;
  public tglAddStatus: boolean = false;
  public tglStatus: boolean = false;

  public createNewTemplateForm!: FormGroup;
  public editFieldForm!: FormGroup;
  public addField!: any;
  public createNewStatusForm!: FormGroup;

  public userList: any;
  public filterUserList: any;
  public addUsers!: string[];

  public onValidationMsg: string = '';
  public onValidationError: string = '';
  items: number[] = [1, 2];
  itemsStatus: number[] = [1];

  public newFormControl: any = {};
  public thCustomerStatus: any;
  public tdCustomerStatus: any;

  public activeTemplate: any;

  constructor(
    private dataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.usersService.activeTemplate.subscribe(
      (template) => (this.activeTemplate = template)
    );

    this.dataService.getAllTemplates().subscribe(
      (response) => {
        this.dataService.getMyTableData().subscribe(
          (response) => {
            this.thData = response.tableTemplate_th;
            this.thCustomerStatus = response.tableTemplateStatutes_th;

            this.createNewStatusForm = new FormGroup({
              label: new FormControl('', [
                Validators.minLength(1),
                Validators.required,
              ]),
              background: new FormControl('#e6e7ee', [
                Validators.minLength(1),
                Validators.required,
              ]),
              color: new FormControl('#333333', [
                Validators.minLength(1),
                Validators.required,
              ]),
            });
            this.createNewTemplateForm = new FormGroup({
              templateName: new FormControl('', [
                Validators.required,
                Validators.minLength(1),
              ]),

              statusLabel0: new FormControl('No action required', [
                Validators.minLength(1),
                Validators.required,
              ]),
              statusBackground0: new FormControl('#e6e7ee', [
                Validators.minLength(1),
                Validators.required,
              ]),

              statusColor0: new FormControl('#333333', [
                Validators.minLength(1),
                Validators.required,
              ]),
              fieldName0: new FormControl('Phone Number'),
              fieldType0: new FormControl('number'),
              fieldVisible0: new FormControl(true),
              fieldName1: new FormControl('', [
                Validators.required,
                Validators.minLength(1),
              ]),

              fieldType1: new FormControl('', [
                Validators.required,
                Validators.minLength(1),
              ]),
              fieldVisible1: new FormControl(true, [
                Validators.required,
                Validators.minLength(1),
              ]),
            });
          },

          (error) => {
            console.error(error);
          }
        );

        this.allTemplates = response;

        let tdData: any = [];
        let slIndex: number = 0;

        for (const [index, value] of this.allTemplates.entries()) {
          tdData.push({
            templateName: value.templateName,
            templateStatus:
              value.templateName === this.activeTemplate ? true : false,
            templateFields: [],
            statuses: [],
          });

          for (const templateData in value) {
            if (value[templateData]['element_placeholder'] !== undefined) {
              slIndex += 1;

              let data = {
                name: value[templateData]['element_placeholder'],
                type: value[templateData]['element_type'],
                visible: value[templateData]['showWhileCalling'],
                slIndex: slIndex - 1,
              };

              tdData[index]['templateFields'].push(data);
            }
          }

          // attach the template's statuses to the template (tdData)
          tdData.forEach((element: any) => {
            this.dataService
              .getTemplateStatuses(element.templateName)
              .subscribe((data: any) => {
                element.statuses = data;
              });
          });
        }
        this.tdData = tdData;
        this.loading = false;

        console.log(this.allTemplates);
        this.dataService.getSelectData().subscribe(
          (response) => {
            this.selectElmType = response.selectInputType;
            //this.tdCustomerStatus = response.selectCXStatus;
          },

          (error) => {
            console.error(error);
          }
        );
      },

      (error) => {
        console.error(error);
      }
    );
  }

  cloneAddField() {
    let id = this.items.length;
    this.createNewTemplateForm.addControl(
      'fieldName' + id,
      new FormControl('', [Validators.required, Validators.minLength(1)])
    );
    this.createNewTemplateForm.addControl(
      'fieldType' + id,
      new FormControl('', [Validators.required, Validators.minLength(1)])
    );
    this.createNewTemplateForm.addControl(
      'fieldVisible' + id,
      new FormControl(true, [Validators.required, Validators.minLength(1)])
    );

    this.items.push(id);
  }

  removeClonedAddField() {
    let id = this.items.length;

    if (id > 2) {
      this.createNewTemplateForm.removeControl('fieldName' + id);
      this.createNewTemplateForm.removeControl('fieldType' + id);
      this.createNewTemplateForm.removeControl('fieldVisible' + id);

      this.items.pop();
    }
  }

  cloneAddStatus() {
    let id = this.itemsStatus.length;

    this.createNewTemplateForm.addControl(
      'statusLabel' + id,
      new FormControl('', [Validators.minLength(1), Validators.required])
    );
    this.createNewTemplateForm.addControl(
      'statusBackground' + id,
      new FormControl('#e6e7ee', [Validators.minLength(1), Validators.required])
    );
    this.createNewTemplateForm.addControl(
      'statusColor' + id,
      new FormControl('#333333', [Validators.minLength(1), Validators.required])
    );
    this.itemsStatus.push(id);
  }

  removeClonedAddStatus() {
    let id = this.itemsStatus.length;

    if (id > 1) {
      this.createNewTemplateForm.removeControl('statusLabel' + id);
      this.createNewTemplateForm.removeControl('statusBackground' + id);
      this.createNewTemplateForm.removeControl('statusColor' + id);
      this.itemsStatus.pop();
    }
  }

  templateSelected(template: string) {
    this.dataService.changeSelectedTemplate(template);
  }

  // Table on row CRUD
  onRowEditInit(rowTdData: any, index: any) {
    this.clonedTdData[index] = { ...rowTdData };
  }

  onRowEditSave(rowTdData: any, indexElm: number, indexTemplate: any) {
    this.functionMissing();

    this.confirmationService.confirm({
      message: 'Are you sure you want to edit this status?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let modifyLastElmActive = (
          document.getElementById('tr' + indexElm) as HTMLInputElement
        ).getElementsByClassName('ng-invalid');

        if (modifyLastElmActive.length > 0) {
          this.onValidationError = '*All fields must be filled out.';
        } else {
          this.tdData[indexTemplate]['statuses'][indexElm] = rowTdData;
          delete this.clonedTdData[rowTdData.id];

          // for (const [index, value] of this.tdCustomerStatus) {
          //   if (value['templateID'] == indexTemplate) {
          //     this.tdCustomerStatus[indexElm] = rowTdData;
          //   }
          // }
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail: 'Status was edited successfully.',
          });
        }
      },
      reject: () => {
        this.onRowEditCancel(indexElm, indexTemplate);
      },
    });
  }

  onRowEditCancel(index: number, indexTemplate: any) {
    this.tdData[indexTemplate]['statuses'][index] = this.clonedTdData[index];
    delete this.clonedTdData[index];
  }
  onRowDeleteRow(id: any, indexTemplate: any) {
    this.functionMissing();

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this status?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tdData[indexTemplate]['statuses'] = this.tdData[indexTemplate][
          'statuses'
        ].filter((i: any) => ![id].includes(i.slStatusId));
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Status was deleted successfully.',
        });
      },
    });

    // for (const [index, value] of this.tdCustomerStatus) {
    //   if (value['templateID'] == indexTemplate) {
    //     this.confirmationService.confirm({
    //       message: 'Are you sure you want to delete this field?',
    //       header: 'Confirm',
    //       icon: 'pi pi-exclamation-triangle',
    //       accept: () => {
    //         this.tdCustomerStatus = this.tdCustomerStatus.filter(
    //           (i: any) => ![id].includes(i.slStatusId)
    //         );
    //       },
    //     });
    //   }
    // }
  }

  toggleTemplate(indexTemplate: any) {
    document
      .getElementById('buttons' + indexTemplate)
      ?.classList.toggle('not-visible');
    this.cancelCreateNewStatus(indexTemplate);
  }

  toggleCreateNewTemplate() {
    this.tglCreateNewTemplate = !this.tglCreateNewTemplate;
  }

  saveCreateNewTemplate() {
    this.confirmationService.confirm({
      message:
        'Once the template was created, the template name, as well as the template fields and field type, <b>cannot be modified</b>. You must be certain you want to create it.',
      header: 'Warning!',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let value = this.createNewTemplateForm.value;
        let fieldArray = [];
        let statusArray = [];
        let i = 0;
        let ii = 0;

        for (const [index, item] of Object.entries(value)) {
          let uid = RandomId(len, pattern);

          if (index.match(/fieldName/g)) {
            let lastChar = index.charAt(index.length - 1);
            let fieldType = 'fieldType' + lastChar;
            let fieldVisible = 'fieldVisible' + lastChar;
            fieldArray.push({
              element: 'input',
              element_order: i,
              element_placeholder: item,
              element_table_value: item,
              element_type: value[fieldType],
              element_value: null,
              showWhileCalling: value[fieldVisible],
            });
            i = i + 1;
          } else if (index.match(/statusLabel/g)) {
            let lastChar = index.charAt(index.length - 1);
            let statusBackground = 'statusBackground' + lastChar;
            let statusColor = 'statusColor' + lastChar;
            statusArray.push({
              label: item,
              background: value[statusBackground],
              color: value[statusColor],
              function: null,
              slStatusId: ii,
              uid: uid,
            });
            ii = ii + 1;
          }
        }

        this.dataService.addTemplate({
          fieldArray: fieldArray,
          statusArray: statusArray,
          templateName: value.templateName,
        });
        this.cancelCreateNewTemplate();

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'New template was created successfully.',
        });
      },
    });
  }

  cancelCreateNewTemplate() {
    this.tglCreateNewTemplate = false;
    this.items = [1, 2];
    this.createNewTemplateForm.reset();
    this.tglStatus = false;
    this.createNewTemplateForm.patchValue({
      fieldName0: 'Phone Number',
      fieldType0: 'number',
      fieldVisible0: true,
      fieldVisible1: true,
      statusLabel0: 'No action required',
      statusBackground0: '#e6e7ee',
      statusColor0: '#333333',
    });

    let itemsCreated = this.items.length;
    let id = 1;

    for (let index = 0; index < itemsCreated - 2; index++) {
      this.createNewTemplateForm.removeControl('fieldName' + id);
      this.createNewTemplateForm.removeControl('fieldType' + id);
      id += 1;
    }
  }

  activateTemplate(id: any, templateName: any) {
    console.log(id, templateName);
    this.confirmationService.confirm({
      message:
        'Are you sure you want to <b>activate</b> this template? This will be applied in the <b>whole app.</b>',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.tdData[id]['templateFields'].length > 0) {
          this.tdData.forEach((i: any) => (i.templateStatus = false));
          this.tdData[id]['templateStatus'] = true;
          this.dataService.changeSelectedTemplate(templateName);
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail:
              'Template "' + templateName + '" was activated successfully.',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Service Message',
            detail:
              'Template "' +
              templateName +
              '" cannot be activated. It must have at least <b>one field.</b>',
          });
        }
      },
    });
  }

  deleteTemplate(id: any, currentStatus: any, templateName: any) {
    this.functionMissing();

    this.confirmationService.confirm({
      message:
        'Are you sure you want to <b>delete</b> this template? This will be applied in the <b>whole app.</b>',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let newTdData = this.tdData.filter((array: any, i: any) => i !== id);

        if (newTdData.length > 0) {
          let remainingTemplateFields = newTdData[0]['templateFields'].length;

          if (remainingTemplateFields <= 0 && this.tdData.length == 2) {
            this.messageService.add({
              severity: 'error',
              summary: 'Service Message',
              detail:
                'Template "' +
                templateName +
                '" cannot be deleted. The remaining template must have fields added and currently it has (' +
                remainingTemplateFields +
                '). Please create a new template. ',
              sticky: true,
            });
          } else {
            this.tdData = newTdData;
            if (currentStatus) {
              console.log(this.activateTemplate);
              this.tdData.forEach((i: any) => (i.templateStatus = false));
              this.tdData[0]['templateStatus'] = true;

              let newActiveTemplate = this.tdData[0]['templateName'];
              this.messageService.add({
                severity: 'success',
                summary: 'Service Message',
                detail:
                  'Template "' +
                  newActiveTemplate +
                  '" was activated automatically.',
              });
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Service Message',
              detail:
                'Template "' + templateName + '" was deleted successfully.',
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Service Message',
            detail:
              'Template "' +
              templateName +
              '" cannot be deleted. At least one template must exists.',
          });
        }
      },
    });
  }

  toggleCreateNewStatus(indexTemplate: any) {
    this.tglAddStatus = true;
    // let modifyLastElmActive = document.getElementsByClassName('templateStatus' + indexTemplate);
    // for (let i = 0, all = modifyLastElmActive.length; i < all; i++) {modifyLastElmActive[i].classList.toggle('hide');}
    // document.getElementById('btnToggleStatus' + indexTemplate)?.classList.toggle('hide');
  }

  cancelCreateNewStatus(indexTemplate: any) {
    this.tglAddStatus = false;
    this.createNewStatusForm.reset();
    this.createNewStatusForm.patchValue({
      background: '#e6e7ee',
      color: '#333333',
    });
  }

  saveCreateNewStatus(indexTemplate: any) {
    this.functionMissing();

    this.tglAddStatus = false;

    this.tdData[indexTemplate]['statuses'].push(this.createNewStatusForm.value);
    let id = this.tdData[indexTemplate]['statuses'].length - 1;
    this.tdData[indexTemplate]['statuses'][id]['slStatusId'] = id;
    console.log(this.tdData);

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Status was created successfully.',
    });
    this.cancelCreateNewStatus(indexTemplate);
  }

  toggleStatus() {
    this.tglStatus = !this.tglStatus;
    this.createNewTemplateForm.patchValue({
      statusLabel0: '',
    });
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
