import { Component, OnInit, Input } from '@angular/core';
import { Product } from './product';
import { ProductService } from './productservice';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { DataService } from '../../services/services.service';

@Component({

  selector: 'tableccomponent',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css',
    '../../css/neumorphism.component.css'],
    providers: [MessageService]

})

export class TablecccComponent{

  productDialog: boolean = false;


  product: Product = {};

  selectedRows: any = [];

  submitted: boolean = false;
  public thData: any;
  public tdData: any;

  constructor(private DataService: DataService, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit() {

      this.DataService.getTableData().subscribe(
        response => {
  
          this.thData = response.table_th
          this.tdData = response.table_td

          var index = 0
          for (let i = 0; i < this.tdData.length; i++) {
            index = i
            this.tdData[index]["index"] = index; 

        }

        },
        error => {
          console.error(error)
        }
      )
  }

  deleteSelectedRows() {
      this.confirmationService.confirm({
          message: 'Are you sure you want to delete this selection?',
          header: 'Confirm',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.tdData = this.tdData.filter((val:any) => !this.selectedRows.includes(val));
              this.selectedRows = [];
              this.messageService.add({severity:'success', summary: 'Successful', detail: 'Products Deleted', life: 3000});
          }
      });
  }


}
