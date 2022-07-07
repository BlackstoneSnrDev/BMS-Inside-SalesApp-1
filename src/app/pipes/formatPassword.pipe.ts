import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPassword'
})
export class FormatPassword implements PipeTransform {

  transform ( initValue: string){

    if(typeof initValue === 'string'){
        return ( initValue )

        ? '**** ' : initValue;

    }else{
        return ( initValue )

    }
   
}

}