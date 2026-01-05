import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-element',
  imports: [ReactiveFormsModule],
  templateUrl: './payment-element.component.html',
  styleUrl: './payment-element.component.scss'
})
export class PaymentElementComponent {

  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder){}

  ngOnInit() {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required]],
      expirationDate: ['', [Validators.required]],
      securityCode: ['', Validators.required],
      postalCode: ['', Validators.required]
    })
  }

}
