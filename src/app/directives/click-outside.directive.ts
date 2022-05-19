import {Directive, HostListener, ElementRef} from '@angular/core';

@Directive({
  selector: `[onlyMyBacon]`
})
export class OnlyMyBacon {
    public isShown: boolean = false;

    public value1: string = ''
  constructor(private el: ElementRef) {
  }
  
  @HostListener('click', ['$event'])
  handleClick(event: Event) {

    this.value1 = (event.target as HTMLInputElement).id;
    this.isShown = ! this.isShown;


        console.log(this.value1);
    
  }
  
  
}