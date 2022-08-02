import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'log-component',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.css',
        '../../css/neumorphism.component.css',],
})

export class LogComponent implements OnInit {

    public log: any;
    public show: boolean = false;
    public addlog: boolean = false;

    public addNewNoteForm!: FormGroup;
    public newFormControl: any = {};

    public currentCall: any = [];
    public currentCallNotes: any = [];

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.currentCall.subscribe((currentCall: any) => { 
            if (currentCall) {
                this.currentCall = currentCall;
                this.currentCallNotes = currentCall.notes.sort((a: { date: any; }, b: { date: any; }) => b.date - a.date )
            } else {
                console.log('no current call');
            }

        });
        this.newFormControl["note"] = new FormControl('', [Validators.required, Validators.minLength(1)])
        this.addNewNoteForm = new FormGroup(this.newFormControl);
    }

    toggleAddLog() {

        this.show = !this.show;
        this.addlog = this.show;

    }

    onSubmitNote() {

        this.DataService.addNewNote(this.currentCall.uid, this.addNewNoteForm.value.note);
        this.show = !this.show;
        this.addlog = this.show;

    }

}
