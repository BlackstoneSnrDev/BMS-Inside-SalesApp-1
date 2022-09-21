import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../services/auth.service';
import { ListboxFilterOptions } from 'primeng/listbox';
import * as moment from 'moment'; // add this 1 of 4
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
  public contactSelection: any;
  public tbGroups: any;
  public groupSelected = new FormControl();
  public tbGroupActive: any = [];
  public defaultGroup: boolean = true;
  public chats: any;
  public dupChats: any;

  public activeChats: any;
  public pendingChats: any;

  public yesterdayDate: any;
  public chatContent: any;
  public tabOpen: boolean = false;

  public userInfo: any;
  public filterTab: any;

  constructor(
    public DataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.DataService.getUserSettings().subscribe((response) => {
      response.forEach((item: any) => {
        if (item.docId === 'textMessage') {
          let textArray: {
            templateContent: any;
            templateId: any;
            templateName: any;
          }[] = [];
          Object.values(item)
            .filter((e) => typeof e !== 'string')
            .forEach((email: any) => {
              textArray.push({
                templateContent: email.data,
                templateId: email.uid,
                templateName: email.templateName,
              });
            });
          this.optSMS = textArray;
        }
      });
    });

    this.yesterdayDate = moment().add(-1, 'days');

    this.DataService.dialSessionArray.subscribe((dialSessionArray: any) => {
      this.contacts = dialSessionArray;
      this.dupContacts = this.contacts;
    });

    this.DataService.getAllTextsForMessengerPage().subscribe((response) => {
      console.log(response[0]['smsText'][response[0]['smsText'].length - 1]);
      this.pendingChats = response.filter(
        (a: any) => a.smsText[a.smsText.length - 1]['method'] === 'received'
      );

      this.chats = this.pendingChats;
      this.dupChats = this.chats;
      this.activeChats = response;

      setTimeout(() => {
        document.getElementById('chat-v-pending')?.classList.add('view-active');
      }, 400);
      this.filterTab = 'pending';
    });

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
    this.groupSelected.reset();
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
    this.tabOpen = false;
    document.getElementById('btnRemove' + index)?.classList.toggle('hide');
    document.getElementById('previewLast' + index)?.classList.toggle('hide');
  }

  onTabOpen(index: any) {
    this.chats[index]['unreadSMS'] = '0';
    this.txtMessage.reset();
    this.tabOpen = true;
    let scroll = document.getElementById('chat' + index);
    scroll!.scrollTop = scroll!.scrollHeight;
    document.getElementById('btnRemove' + index)?.classList.toggle('hide');
    document.getElementById('previewLast' + index)?.classList.toggle('hide');
  }

  removeChat(index: number) {
    let msg: any;
    if (this.filterTab === 'pending') {
      msg =
        'The status of this chat will change from "pending" to "active". You can still access it by choosing it from the contacts list or "Active Chats.';
    } else if (this.filterTab === 'active') {
      msg =
        'This chat will be removed. You might want to access it by choosing it from the contacts list.';
    }

    this.confirmationService.confirm({
      message: msg,
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.activeState[index] = !this.activeState[index];

        if (this.filterTab === 'pending') {
          this.pendingChats = this.pendingChats.filter(
            (a: any, i: any) => i != index
          );
          this.chats = this.pendingChats;
        } else if (this.filterTab === 'active') {
          this.activeChats = this.activeChats.filter(
            (a: any, i: any) => i != index
          );
          this.pendingChats = this.pendingChats.filter(
            (a: any, i: any) => i != index
          );
          this.chats = this.activeChats;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Chat was removed successfully.',
        });
      },
    });
  }

  sendMassiveSMS(e: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to send this message?',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let contactsArray = this.contactSelection;
        console.log(contactsArray);

        this.messageService.add({
          severity: 'error',
          summary: 'Service Message',
          detail: 'Function not created yet.',
        });
        this.smsMassive.reset();
      },
      reject: () => {
        this.smsMassive.reset();
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
    this.filterTab = 'pending';
    console.log(this.chats);

    document.getElementById('chat-v-pending')?.classList.add('view-active');
    document.getElementById('chat-v-active')?.classList.remove('view-active');
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Showing pending chats.',
    });
  }

  filterActiveChat() {
    this.filterTab = 'active';

    this.chats = this.activeChats;
    this.dupChats = this.activeChats;
    console.log(this.chats);

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

    this.DataService.makeCall(
      'text',
      this.txtMessage.value,
      chat.uid,
      '+1' + chat.phonenumber
    ).then((response) => {
      console.log(response);
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Message was sent successfully',
    });
    this.txtMessage.reset();
    this.tabOpen = false;
  }

  resendSMS(index: any) {
    console.log('RESEND');
  }

  startNewChat(index: any, options: ListboxFilterOptions) {
    setTimeout(() => {
      this.contactSelection = '';
    }, 0);

    this.filterActiveChat();
    this.searchChat.setValue(this.contacts[index]['MRN']);

    let findDuplicate = this.activeChats.filter(
      (a: any, i: any) => a.uid == this.contacts[index]['uid']
    ).length;

    this.chats = this.dupChats;
    this.chats = this.contacts.filter((a: any, g: any) =>
      a.MRN.toLowerCase().includes(this.contacts[index]['MRN'])
    );
    if (findDuplicate < 1) {
      this.activeChats.push(this.contacts[index]);
    }
  }
}
