import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';

@Injectable()
export class PreloaderProvider {

   private loading : any;

   constructor(public LOADINGCTRL : LoadingController) { }

   displayPreloader() : void {
      if(this.loading == null){
         this.loading = this.LOADINGCTRL.create({
            content: 'Please wait...'
         });
   
         this.loading.present();
      }
   }

   hidePreloader() : void {
      if(this.loading != null){
         this.loading.dismiss();
         this.loading = null;
      }
   }

}