import { Component } from '@angular/core';
import { StoreService } from "../../services/store.service";


@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {

  public showMenu = false;
  counter = 0;

  constructor(
    private storeService: StoreService
  ) { }

  ngOnInit(): void {
    this.storeService.myCart$.subscribe(products => {
      this.counter = products.length;
    })
  }

  toggleSideBar(): void {
    this.showMenu = !this.showMenu;
  }

}
