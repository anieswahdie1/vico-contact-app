import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Contact Management App';
  currentYear = new Date().getFullYear();
}
