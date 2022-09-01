import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'log-component',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css', '../../css/neumorphism.component.css'],
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
  public noteContent = new FormControl('', [Validators.minLength(1), Validators.maxLength(1500), Validators.required]);

  constructor(
    private DataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.DataService.currentCall.subscribe((currentCall: any) => {
      if (currentCall) {
        // console.log('Current Call: ', currentCall);
        this.currentCall = currentCall;
        this.currentCallNotes = currentCall.notes.sort(
          (a: { date: any }, b: { date: any }) => b.date - a.date
        );
        this.currentCallNotes.forEach((element: any, index: number) => {
          this.currentCallNotes[index]['slIndex'] = index;
        });

        this.dupCurrentCallNotes = this.currentCallNotes;

        this.loadingNotes = false;
      } else {
        this.loadingNotes = true;
      }
    });

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
    this.tglAddNote = true;
    this.currentCallNotes = this.dupCurrentCallNotes;
    this.noteContent.reset();
  }

  cancelAddNote() {
    this.tglAddNote = false
    console.log('is closing here when cancel')
    this.noteContent.reset();
  }

  saveNewNote() {
    this.DataService.addNewNote(
      this.currentCall.uid,
      this.noteContent.value as string
    );
    this.tglAddNote = !this.tglAddNote;
    this.noteContent.reset();
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Note was saved successfully.',
    });
  }

  filterNotes() {
    this.loadingNotes = true;
    let value = this.searchNote.value.toLowerCase();
    if (value) {
      this.loadingNotes = true;
      this.currentCallNotes = this.dupCurrentCallNotes;
      this.currentCallNotes = this.currentCallNotes.filter(
        (a: any, g: any) =>
          a.data.toLowerCase().includes(value) ||
          a.enteredBy.toLowerCase().includes(value) ||
          g.toString().includes(value)
      );
      this.loadingNotes = false;
    } else {
      this.currentCallNotes = this.dupCurrentCallNotes;
      this.loadingNotes = false;
    }

  }

  

}
