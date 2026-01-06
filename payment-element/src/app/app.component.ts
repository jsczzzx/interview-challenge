import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaymentElementComponent } from "./payment-element/payment-element.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PaymentElementComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'payment-element';
}
