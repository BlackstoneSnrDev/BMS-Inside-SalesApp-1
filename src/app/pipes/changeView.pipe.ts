import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'changeView'
})

export class ChangeView implements PipeTransform {

    transform ( tdData: [], modifyBy: string): any[] {

        switch(modifyBy){

            case 'all':
            return tdData

            default:
            return tdData.filter((i: any) => i.group.includes(modifyBy))

        }

    }
}