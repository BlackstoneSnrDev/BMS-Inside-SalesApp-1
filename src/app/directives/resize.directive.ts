import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appTextareaAutoresize]'
})
export class TextareaAutoresizeDirective implements OnInit {

  constructor(private elementRef: ElementRef) { }

  @HostListener(':input')
  onChange() {

    this.resize();
    console.log(this)

  }

  ngOnInit() {

    if (this.elementRef.nativeElement.scrollHeight) {
      setTimeout(() => this.resize());
    }

  }

  resize() {

    this.elementRef.nativeElement.style.height = '0';
    this.elementRef.nativeElement.style.height = this.elementRef.nativeElement.scrollHeight + 'px';
    
  }
}