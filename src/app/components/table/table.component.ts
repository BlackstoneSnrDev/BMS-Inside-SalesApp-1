import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/services.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';

@Component({

  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css',
    '../../css/neumorphism.component.css',]

})

export class TableComponent implements OnInit{

  constructor(private DataService: DataService, private _liveAnnouncer: LiveAnnouncer) { }

  public thData: any;
  public thTitle: any = [];
  public tdData: any;
  public thField: any = [];

  public dataSource: any;
  public displayedColumns: any;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
      
    this.DataService.getTableData().subscribe(
        response => {

          this.thData = response.table_th
          this.tdData = response.table_td

          for (let th of this.thData ) {
            this.thTitle.push(th.title);
            this.thField.push(th.field);
          }

          this.displayedColumns = this.thField;
          this.dataSource = new MatTableDataSource(this.tdData);

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
  
  getRowId(id : number) { console.log(id)}


}
