import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatArray',
})
export class FormatArray implements PipeTransform {
  transform(initValue: any) {
    if (typeof initValue !== 'string') {
      return initValue ? initValue.toString().replace(/,/g, ', ') : initValue;
    } else {
      return initValue;
    }
  }
}
