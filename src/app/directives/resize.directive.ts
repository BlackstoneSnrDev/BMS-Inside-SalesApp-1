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
    console.log('Set' + this.elementRef.nativeElement.style.height)

  }

  resize() {
    this.elementRef.nativeElement.style.height = '0';
    console.log('Set' + this.elementRef.nativeElement.style.height)

    this.elementRef.nativeElement.style.height = this.elementRef.nativeElement.scrollHeight + 'px';
    console.log('Mas' + this.elementRef.nativeElement.style.height)

  }
}