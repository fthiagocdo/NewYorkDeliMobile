import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { get } from 'scriptjs';
import { PreloaderProvider } from '../../providers/preloader/preloader';
import { Utils } from '../../utils/utils';
import { MenuPage } from '../menu/menu';

@IonicPage()
@Component({
  selector: 'page-payment-iframe',
  templateUrl: 'payment-iframe.html',
})
export class PaymentIframePage {
  results: string;

  constructor(
    public navctrl: NavController, 
    public navprarams: NavParams,
    public loader: PreloaderProvider,
    public utils: Utils) {
      get("assets/js/paymentiframe.js", () => { });
  }

  ionViewDidLoad() {
    setTimeout(() => {
      this.loader.hidePreloader();
    }, 3000);
  }

  returnToApp() {
    this.navctrl.setRoot(MenuPage);
  }

  ionViewDidLeave() {
    this.utils.showMessage('Payment Code: ' + eval('results.value'), 'info');
  }

}
