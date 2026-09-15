import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DrawerComponent } from '@vodafone/ui-components';

@Component({
  imports: [DrawerComponent],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  open = signal<boolean>(false);
  openDrawer() {
    this.open.set(true);
  }
  closeDrawer() {
    this.open.set(false);
  }
}
