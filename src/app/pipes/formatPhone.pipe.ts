import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPhone',
})
export class FormatPhone implements PipeTransform {
  transform(initValue: any, typeFormat: any) {
    let toNumber = ('' + initValue).replace(/\D/g, '');

    if (typeFormat === 'toNumber') {
      return toNumber;
    } else {
      let toPhone = toNumber.match(/^(\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
      if (toPhone) {
        var intlCode = toPhone[1] ? '+' + toPhone[1] + ' ' : '';
        return [intlCode, '(', toPhone[2], ') ', toPhone[3], '-', toPhone[4]].join(
          ''
        );
      }
      return initValue;
    }
  }
}
