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
        // finds the group_id in the row's group array
            return tdData.filter((i: any) => i.group.includes(modifyBy))
        }
    }
}