import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class activeCall {

  constructor() { }

  test() {
    console.log('hello from services');
  }
}