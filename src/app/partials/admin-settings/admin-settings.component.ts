import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { UsersService } from '../../services/auth.service';

@Component({
  selector: 'admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: [
    './admin-settings.component.css',
    '../../css/neumorphism.component.css',
  ],
})
export class AdminSettings {
  public dbObjKey: any;
  public userInfo: any;

  constructor(
    private DataService: DataService,
    private usersService: UsersService
  ) {
    this.usersService.userInfo.subscribe(
      (userInfo) => (this.userInfo = userInfo)
    );
  }

  ngOnInit() {}
}
