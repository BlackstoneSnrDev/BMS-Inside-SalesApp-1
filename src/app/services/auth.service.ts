import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})

export class UsersService {

  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  constructor(private http: HttpClient, private router: Router) { }

  login(user: any): Observable<any> {

    if (user.username === "eve.holt@reqres.in") {

      this.loggedIn.next(true);
      this.router.navigateByUrl('call-information');

    }

    return this.http.post("https://reqres.in/api/login", user);

  }

  // register(user: any): Observable<any> {

  //   return this.http.post("https://reqres.in/api/register", user);

  // }

  logout() {

    this.loggedIn.next(false);
    this.router.navigateByUrl('login');

  }
}