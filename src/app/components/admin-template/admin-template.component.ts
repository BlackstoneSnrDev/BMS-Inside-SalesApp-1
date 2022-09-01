import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

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
  items: number[] = [1];
  itemsStatus: number[] = [1];

  public newFormControl: any = {};
  public thCustomerStatus: any;
  public tdCustomerStatus: any;

  constructor(
    private dataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {

    this.dataService.getAllTemplates().subscribe(
      (response) => {
        this.dataService.getMyTableData().subscribe(
          (response) => {
            this.thData = response.tableTemplate_th;
            this.thCustomerStatus = response.tableTemplateStatutes_th;

            for (let fieldName of this.thCustomerStatus) {
            

                  this.newFormControl[fieldName.field] =
                    new FormControl(
                      '',
                      [Validators.required, Validators.minLength(1)]
                    );
                  
                  this.createNewStatusForm = new FormGroup(this.newFormControl);
                
              
            }
            

            this.createNewTemplateForm = new FormGroup({
              templateName: new FormControl('', [
                Validators.required,
                Validators.minLength(1),
              ]),

              statusLabel0: new FormControl('', [Validators.minLength(1)]),
              statusBackground0: new FormControl('#e6e7ee', [
                Validators.minLength(1),
              ]),

              statusColor0: new FormControl('#333333', [
                Validators.minLength(1),
              ]),

              fieldName0: new FormControl('', [
                Validators.required,
                Validators.minLength(1),
              ]),

              fieldType0: new FormControl('', [
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
            templateStatus: value.active,
            templateFields: [],
          });
          this.dataService.getTemplateStatuses(value.templateName).subscribe((data: any) => {
            this.tdCustomerStatus = data;
        })

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
        }
        this.tdData = tdData;
        this.loading = false;

        this.dataService.getSelectData().subscribe(
          (response) => {
            this.selectElmType = response.selectInputType;
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

    this.items.push(id);
  }

  removeClonedAddField() {
    let id = this.items.length;

    if (id > 1) {
      this.createNewTemplateForm.removeControl('fieldName' + id);
      this.createNewTemplateForm.removeControl('fieldType' + id);
      this.items.pop();
    }
  }

  cloneAddStatus() {
    let id = this.itemsStatus.length;
    this.createNewTemplateForm.addControl(
      'statusLabel' + id,
      new FormControl('', [Validators.minLength(1)])
    );
    this.createNewTemplateForm.addControl(
      'statusBackground' + id,
      new FormControl('#44476a', [Validators.minLength(1)])
    );
    this.createNewTemplateForm.addControl(
      'statusColor' + id,
      new FormControl('#44476a', [Validators.minLength(1)])
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
  onRowEditInit(tdData: any, id: number) {
    this.clonedTdData[tdData.id] = { ...tdData };
  }

  onRowEditSave(rowTdData: any, indexElm: number, indexTemplate: any) {
    let modifyLastElmActive = (
      document.getElementById('tr' + indexElm) as HTMLInputElement
    ).getElementsByClassName('ng-invalid');

    if (modifyLastElmActive.length > 0) {
      this.onValidationError = '*All fields must be filled out.';
    } else {

      
      this.tdCustomerStatus[indexElm] = rowTdData;
      delete this.clonedTdData[rowTdData.id];

      // for (const [index, value] of this.tdCustomerStatus) {
      //   if (value['templateID'] == indexTemplate) {
      //     this.tdCustomerStatus[indexElm] = rowTdData;
      //   }
      // }
      this.messageService.add({
        severity: 'success',
        summary: 'Service Message',
        detail: 'Record was edited successfully.',
      });
    }
  }

  onRowEditCancel(rowTdData: any, index: number) {
   this.tdCustomerStatus[index] = this.clonedTdData[rowTdData.id];
      delete this.tdCustomerStatus[rowTdData.id];
    
  }

  onRowDeleteRow(id: any, indexTemplate: any) {

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this status?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tdCustomerStatus = this.tdCustomerStatus.filter(
          (i: any) => ![id].includes(i.slStatusId)
        );
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

  toggleTemplate(index: any) {
    
    document.getElementById('buttons'+index)?.classList.toggle('not-visible')

  }

  toggleCreateNewTemplate() {
    this.tglCreateNewTemplate = !this.tglCreateNewTemplate;
  }

  saveCreateNewTemplate() {
    let value = this.createNewTemplateForm.value;

    this.createNewTemplateForm.reset();
    this.tglCreateNewTemplate = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'New template was created successfully.',
    });

  }

  cancelCreateNewTemplate() {
    this.tglCreateNewTemplate = false;
    this.items = this.items.filter((a: any, i: any) => i == 0);
    this.createNewTemplateForm.reset();

    let itemsCreated = this.items.length;
    let id = 1;

    for (let index = 0; index < itemsCreated - 1; index++) {
      this.createNewTemplateForm.removeControl('fieldName' + id);
      this.createNewTemplateForm.removeControl('fieldType' + id);
      id += 1;
    }
  }

  activateTemplate(id: any, templateName: any) {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to <b>activate</b> this template? This will be applied in the <b>whole app.</b>',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.tdData[id]['templateFields'].length > 0) {
          this.tdData.forEach((i: any) => (i.templateStatus = false));
          this.tdData[id]['templateStatus'] = true;
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

  changeColor() {
  }

  toggleCreateNewStatus(){
    this.tglAddStatus = true
    this.createNewStatusForm.reset()
  }

  cancelCreateNewStatus(){
    this.tglAddStatus = false
    this.createNewStatusForm.reset()

  }

  saveCreateNewStatus(){
    this.tglAddStatus = false
    this.tdCustomerStatus.push(this.createNewStatusForm.value)
    let id = this.tdCustomerStatus.length -1
    this.tdCustomerStatus[id]['slStatusId'] = id

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Status was created successfully.',
    });
    this.createNewStatusForm.reset()

  }

  toggleStatus(){
    this.tglStatus = !this.tglStatus
  }
}
