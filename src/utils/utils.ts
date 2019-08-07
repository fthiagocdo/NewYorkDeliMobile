import { AlertController } from "ionic-angular";
import { Injectable } from "@angular/core";
import { Storage } from '@ionic/storage';

@Injectable()
export class Utils {
  private keepmeLoggedAlias: string = 'rkZvGqUbSs';
  
  constructor(private alertCtrl: AlertController, private storage: Storage) { }

  showMessage(message, messageType?) {
    if(message != null){
      if(messageType == 'error'){
        let alert = this.alertCtrl.create(  {
          title: 'Error:',
          message: message,
          buttons: [{
            text: 'Ok',
            cssClass: 'error-color'
          }],
          cssClass: 'error-color'
        });
        alert.present();
      }else{
        let alert = this.alertCtrl.create({
          title: 'Message:',
          message: message,
          buttons: [{
            text: 'Ok',
            cssClass: 'primary-color'
          }],
          cssClass: 'primary-color'
        });
        alert.present();
      }
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  isEmpty(value){
    if(value == null || value == 'null' || value == '' || value == ""){
      return true;
    }else{
      return false;
    }
  }

  clearDetailsKeepmeLogged() {
    this.storage.remove(this.keepmeLoggedAlias);
  }

}