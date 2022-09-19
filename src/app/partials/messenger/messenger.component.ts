import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../services/auth.service';
import { ListboxFilterOptions } from 'primeng/listbox';

@Component({
  selector: 'messenger',
  templateUrl: './messenger.component.html',
  styleUrls: [
    './messenger.component.css',
    '../../css/neumorphism.component.css',
  ],
})
export class MessengerComponent {
  public activeState: boolean[] = [true, false, false];
  public tglContacts: boolean = true;
  public tglState: boolean = false;
  public searchContact = new FormControl();
  public searchChat = new FormControl();
  public txtMessage = new FormControl('', [
    Validators.minLength(1),
    Validators.required,
    Validators.maxLength(1500),
  ]);
  public optSMS: any;
  public smsMassive = new FormControl();
  public contacts: any = [];
  public dupContacts: any;
  public contactSelection = new FormControl('', Validators.minLength(1));
  public tbGroups: any;
  public groupSelected = new FormControl();
  public tbGroupActive: any = [];
  public defaultGroup: boolean = true;
  public chats: any;
  public dupChats: any;

  public activeChats: any;
  public pendingChats: any;

  public todayDate: any;
  public chatContent: any;

  public userInfo: any;

  constructor(
    public DataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.DataService.getSelectData().subscribe(
      (response) => {
        this.optSMS = response.selectSMSMessage;
      },

      (error) => {
        console.error(error);
      }
    );

    this.DataService.dialSessionArray.subscribe((dialSessionArray: any) => {
      this.contacts = dialSessionArray;
      this.dupContacts = this.contacts;
    });

    this.DataService.getAllTextsForMessengerPage().subscribe(
        (response) => {
            console.log(response[0]['smsText'][response[0]['smsText'].length -1]);
            this.pendingChats = response.filter((a: any) => a.smsText[a.smsText.length - 1]['method'] === 'received');
            this.chats = this.pendingChats;
            this.activeChats = response;
        }
    );

    this.DataService.getMyTableData().subscribe(
      (response) => {
        console.log(response);
        //this.pendingChats = response.pending_chats;
        //this.activeChats = response.active_chats;
        //this.chats = this.pendingChats;
        //this.dupChats = this.chats;
        //this.chatContent = response.sms_content;

        setTimeout(() => {
          document
            .getElementById('chat-v-pending')
            ?.classList.add('view-active');
        }, 400);
      },

      (error) => {
        console.error(error);
      }
    );

    this.DataService.getCustomerGroups().subscribe((data) => {
      this.tbGroups = data;

      this.usersService.userInfo.subscribe((userInfo: any) => {
        if (userInfo) {
          this.userInfo = userInfo;
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

    this.tglState = true;
  }

  toggleContacts() {
    this.tglContacts = !this.tglContacts;
    this.searchContact.setValue('');
    this.contactSelection.setValue('');
  }

  selectAllContacts() {
    this.contactSelection = this.contacts;
  }

  selectSingleContact(index: any) {

    this.contactSelection = this.contacts.filter(
      (a: any, i: any) => i == index
    );
  }
  getGroupSelected() {
    let groupSelected = this.tbGroups.filter(
      (v: any) => v.group_id === this.groupSelected.value
    );

    this.DataService.selectActiveGroup(this.groupSelected.value);

    this.defaultGroup = false;

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
      detail: 'Group "' + groupName + '" was added to calling.',
    });
  }

  removeGroupSelected(groupId: string) {
    this.tbGroupActive = this.tbGroupActive.filter(
      (v: any) => v.group_id !== groupId
    );

    this.DataService.removeActiveGroup(groupId);

    this.tbGroupActive.length > 0
      ? (this.defaultGroup = false)
      : (this.defaultGroup = true);

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Group was removed from calling.',
    });
  }

  onTabClose(index: any) {
    this.chats = this.dupChats;
    this.searchChat.reset();
    this.txtMessage.reset();
  }

  onTabOpen(index: any) {
    this.chats[index]['unreadSMS'] = '0';
    this.txtMessage.reset();
  }

  sendMassiveSMS() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to send this message?',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'SMS Message sent.',
        });
      },
    });
  }

  filterContact() {
    let value = this.searchContact.value.toLowerCase();
    if (value) {
      this.contacts = this.dupContacts;
      this.contacts = this.contacts.filter(
        (a: any, g: any) =>
          a.MRN.toLowerCase().includes(value) ||
          a.fullname.toLowerCase().includes(value) ||
          a.phonenumber
            .toLowerCase()
            .replace(/[()-\s]/g, '')
            .includes(value.replace(/[()-\s]/g, ''))
      );
    } else {
      this.contacts = this.dupContacts;
    }

  }

  filterChat() {
    this.chats = this.dupChats;

    let value = this.searchChat.value.toLowerCase();
    if (value) {
      this.chats = this.dupChats;
      this.chats = this.chats.filter(
        (a: any, g: any) =>
          a.MRN.toLowerCase().includes(value) ||
          a.fullname.toLowerCase().includes(value)
      );
    } else {
      this.chats = this.dupChats;
    }

  }

  filterPendingChat() {
    this.chats = this.pendingChats;
    this.dupChats = this.pendingChats;
    this.searchChat.reset();

    document.getElementById('chat-v-pending')?.classList.add('view-active');
    document.getElementById('chat-v-active')?.classList.remove('view-active');
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Showing pending chats.',
    });
  }

  filterActiveChat() {
    this.chats = this.activeChats;
    this.dupChats = this.activeChats;

    this.searchChat.reset();
    document.getElementById('chat-v-pending')?.classList.remove('view-active');
    document.getElementById('chat-v-active')?.classList.add('view-active');
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Showing active chats.',
    });
  }

  sendSMS(chat: any) {
    console.log(this.txtMessage.value, chat.uid);
    // let timeNow = new Date();
    // let date =
    //   timeNow.getMonth() +
    //   '/' +
    //   timeNow.getDate() +
    //   '/' +
    //   timeNow.getFullYear();
    // let hour =
    //   timeNow.getHours() +
    //   ':' +
    //   timeNow.getMinutes() +
    //   ':' +
    //   timeNow.getSeconds();
    // let message = {
    //   customerId: index,

    //   dateSMS: date,
    //   timeSMS: hour,
    //   contentSMS: this.txtMessage.value,
    //   senderTypeSMS: 'user',
    //   senderNameSMS: this.userInfo.name,
    //   statusSMS: true,
    // };

    //this.chatContent.push(message);

    this.DataService.makeCall('text', this.txtMessage.value, chat.uid, '+1' + chat.phonenumber).then((response) => {
        console.log(response)
    }) 

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Message was sent successfully',
    });
    this.txtMessage.reset();
  }

  resendSMS(index: any) {
    console.log('RESEND');
  }

  startNewChat(index: any, options: ListboxFilterOptions) {
    options.reset?.();

    this.filterActiveChat();
    this.searchChat.setValue(this.contacts[index]['MRN']);
    this.chats = this.dupChats;
    this.chats = this.contacts.filter((a: any, g: any) =>
      a.MRN.toLowerCase().includes(this.contacts[index]['MRN'])
    );
    this.activeChats.push(this.contacts[index]);
  }
}
