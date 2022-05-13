import { Component } from "@angular/core";

@Component({

    selector: 'queue',
    templateUrl: './queue.component.html',
    styleUrls: ['./queue.component.css']

})
export class QueueComponent {
  
    constructor(){

        console.log("Constructor Executed");

    }

}
