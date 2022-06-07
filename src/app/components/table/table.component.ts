import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/services.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {SelectionModel} from '@angular/cdk/collections';
@Component({

  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css',
    '../../css/neumorphism.component.css',]

})

export class TableComponent implements OnInit {

  constructor(private DataService: DataService, private _liveAnnouncer: LiveAnnouncer) { }

  public thData: any;
  public thTitle: any = [];
  public tdData: any;
  public thField: any = [];
  public tdField: any = [];
  public countRow: any = [];
  public dataSource: any;
  public selection: any;

  public displayedColumns: any;

  public checked: any;
  public allchecked: boolean = false;
  public selectedRow: boolean = false;

  public inputValue: string = ""
  public editField: boolean = false;
  public disabledField: string = "input-neumorphism";
  public enableField: string = "input-disabled-neumorphism";

  public toggleFilter: boolean = false;
  public toggleMenu: boolean = false;
  public toggleRowMenu: boolean = false;

  pageNumber: number = 0;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {

    this.DataService.getTableData().subscribe(
      response => {

        this.thData = response.table_th
        this.tdData = response.table_td
        
        // for (let i = 1; i<=5; i++) {
        //   this.countRow.push(( this.tdData.length / i).toFixed(0))
        // }

        for (let th of this.thData) {
          this.thTitle.push(th.title);
          this.thField.push(th.field);
        }

        for (let td of this.tdData) {
          this.tdField.push(td);
        }

        this.displayedColumns = this.thField;
        this.dataSource = new MatTableDataSource(this.tdData);
        this.selection = new SelectionModel<any>(true, []);

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      },
      error => {
        console.error(error)
      }
    )
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  
goToPage() {
  this.paginator.pageIndex = this.pageNumber - 1;
  this.paginator.page.next({
    pageIndex: this.paginator.pageIndex,
    pageSize: this.paginator.pageSize,
    length: this.paginator.length
  });
}


  allRecordsChecked(id: number) {
    this.allchecked = !this.allchecked
    this.toggleMenu = ! this.toggleMenu
    console.log(id)

    var recordId: any = []

    this.dataSource.filteredData.forEach((r: string, id: number) => {
      recordId.push({
        "id": id,
        "new": "status",
        "value": this.allchecked,
      });
    });

     //return recordId
    //console.log(recordId)

  }

  recordChecked(id: number, event: Event, rowSelected: number) {

    this.checked = (event.target as HTMLInputElement).querySelector('input')?.ariaChecked

    if(this.checked === "true" && rowSelected == 1 ){
      this.toggleMenu = false
    }else{
      this.toggleMenu = true
    }

    var recordStatus =
    {
      "id": id,
      "new": "status",
      "value": this.checked,
    };

    //return recordStatus
    console.log(recordStatus)

  }

  selectRow(element: any, id: number) {
    element.selectedRow = !element.selectedRow;
  }

  getRowId(id: number) {

    this.toggleRowMenu = false;

    var row =
    {
      "id": id,
      "new": "group",
      "value": "TOASSIGN",
    };

    //return row
    console.log(row)

  }

  editColumn(columnName: string, columnValue: string,){

    console.log("editing" + columnName + columnValue)


  }
  editFields(){

    this.editField = !this.editField;

}

showFilter(){
  this.toggleFilter = ! this.toggleFilter
}

displayMenu(){
  this.toggleMenu = ! this.toggleMenu

}

get allSelected(): boolean {
  return this.selection.selected.length === this.tdField.length
 ;
 }

 toggleMasterSelection() {
  if (this.allSelected) {
    this.selection.clear();
  } else {
    this.selection.select(...this.tdField);
  }
}
}
