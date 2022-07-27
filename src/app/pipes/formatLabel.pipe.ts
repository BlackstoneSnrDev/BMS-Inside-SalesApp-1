import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatLabel',
})
export class FormatLabel implements PipeTransform {
  transform(initValue: string) {
    if (typeof initValue === 'string') {
      return initValue
        ? initValue[0].toUpperCase() + initValue.substr(1).toLowerCase()
        : initValue;
    } else {
      return initValue;
    }
  }
}
