import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatBoolean'
})

export class FormatBoolean implements PipeTransform {

    transform ( initValue: boolean, columnName: string){

        if(typeof initValue === 'boolean'){
            return ( initValue )
            ? columnName.charAt(0).toUpperCase() + columnName.slice(1).replace(/_/g,' ')
            : 'Not ' + columnName.replace(/_/g,' ');
        }else{
            return ( initValue )

        }
       
    }
}