import { Component, OnInit, Input, Output } from '@angular/core';
import { DataService } from '../../services/services.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { UsersService } from "../../services/auth.service";


@Component({
    selector: 'reusableTable-component',
    templateUrl: './reusableTable.component.html',
    styleUrls: ['./reusableTable.component.css', '../../css/neumorphism.component.css', '../../components/table/table.component.css']
})

export class ReusableTableComponent implements OnInit {
    
    @Input() thData: any;
    @Input() tdData: any;
    @Input() addNew: string = 'record';
    @Input() showBtnAddNew: boolean = true;

    constructor(private dataService: DataService, private confirmationService: ConfirmationService, private usersService: UsersService) { }

    ngOnInit() {

        console.log(this.thData)
        
    }
}
