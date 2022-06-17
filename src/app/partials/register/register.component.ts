import { Component } from "@angular/core";
import { UsersService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})

export class RegisterComponent {

  username: string = "";
  password: string = "";
  passwordError!: boolean;

  constructor(public userService: UsersService) {}

  register() {

    const user = { username: this.username, password: this.password };

    // this.userService.register(user).subscribe((data: any) => {
    //   console.log(data);
    // });

  }
}