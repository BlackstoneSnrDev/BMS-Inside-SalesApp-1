import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'log-component',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.css',
        '../../css/neumorphism.component.css',],
})

export class LogComponent implements OnInit {
    public loadingNotes: boolean = true;

    public log: any;
    public tglAddNote: boolean = false;
    public tglChangeNoteStatus: boolean = false;

    public addNewNoteForm!: FormGroup;
    public newFormControl: any = {};

    public currentCall: any = [];
    public currentCallNotes: any = [];
    public dupCurrentCallNotes: any;
    public optLogStatus: any;
    public searchNote = new FormControl();
    public noteNewStatus = new FormControl('');

    constructor(private DataService: DataService, private confirmationService: ConfirmationService, private messageService: MessageService) { }

    ngOnInit() {

        this.DataService.currentCall.subscribe((currentCall: any) => {

            if (currentCall) {
                this.currentCall = currentCall;
                this.currentCallNotes = currentCall.notes.sort((a: { date: any; }, b: { date: any; }) => b.date - a.date)
                this.currentCallNotes.forEach((element: any, index: number) => {
                    this.currentCallNotes[index]['slIndex'] = index;
                    this.currentCallNotes[index]['noteStatus'] = 'Pending';

                });

                this.dupCurrentCallNotes = this.currentCallNotes
                console.log(this.currentCallNotes)

                this.loadingNotes = false
            } else {
                console.log('no current call');
                this.loadingNotes = true
            }

        });
        this.newFormControl["note"] = new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1500)])
        this.newFormControl["noteStatus"] = new FormControl('Pending', [Validators.required, Validators.minLength(1)])
        this.addNewNoteForm = new FormGroup(this.newFormControl);

        this.DataService.getSelectData().subscribe(
            (response) => {
                this.optLogStatus = response.selectLogStatus;
            },

            (error) => {
                console.error(error);
            }
        );

    }

    toggleAddLog() {

        this.tglAddNote = !this.tglAddNote;
        this.addNewNoteForm.reset
    }

    onSubmitNote() {

        //this.DataService.addNewNote(this.currentCall.uid, this.addNewNoteForm.value.note);
        console.log(this.addNewNoteForm.value)
        this.tglAddNote = !this.tglAddNote;
        this.addNewNoteForm.reset

    }

    filterNotes() {

        this.loadingNotes = true
        let value = this.searchNote.value.toLowerCase()
        if (value) {
            this.loadingNotes = true
            this.currentCallNotes = this.dupCurrentCallNotes
            this.currentCallNotes = this.currentCallNotes.filter((a: any, g: any) =>
                a.data.toLowerCase().includes(value) || a.enteredBy.toLowerCase().includes(value) || g.toString().includes(value) || a.noteStatus.toLowerCase().includes(value))
            this.loadingNotes = false

        } else {
            this.currentCallNotes = this.dupCurrentCallNotes
            this.loadingNotes = false

        }


        console.log(this.currentCallNotes)
    }

    toggleNoteStatus(elementId: any) {

        this.tglChangeNoteStatus = !this.tglChangeNoteStatus

        document.getElementById('noteSl' + elementId)?.classList.toggle(
            'hide'
        );


    }

    changeNoteStatus(id: any, oldStatus: any) {

        let value = this.noteNewStatus.value
        if (oldStatus.toLowerCase() !== value?.toLowerCase()) {
            this.confirmationService.confirm({
                message:
                    'Are you sure you want to set the status of "' + id + '" note as "' + value + '"?',
                header: 'Warning',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.tglChangeNoteStatus = false
                    document.getElementById('noteSl' + id)?.classList.toggle(
                        'hide'
                    );
                    this.noteNewStatus.setValue('')
                    this.currentCallNotes[id]['noteStatus'] = value
                    console.log(this.currentCallNotes)
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Service Message',
                        detail: 'Note "' + id + '" status was set to "' + value + '".',
                    });
                }
            });
    
            this.tglChangeNoteStatus = false
            document.getElementById('noteSl' + id)?.classList.toggle(
                'hide'
            );
            this.noteNewStatus.setValue('')
            this.currentCallNotes[id]['noteStatus'] = value
            console.log(this.currentCallNotes)
            this.messageService.add({
                severity: 'success',
                summary: 'Service Message',
                detail: 'Note "' + id + '" status was set to "' + value + '".',
            });
        }else{
            this.messageService.add({
                severity: 'error',
                summary: 'Service Message',
                detail: 'Note "' + id + '" status was already set to "' + value + '" before.',
            });
        }

        

    }

}
