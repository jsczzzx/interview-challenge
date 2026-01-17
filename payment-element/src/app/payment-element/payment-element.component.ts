import { Component, EventEmitter, Output, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NormalizedCardData } from '../data.model';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'payment-element',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './payment-element.component.html',
  styleUrl: './payment-element.component.scss',
  // Using Emulated is fine; ShadowDom is better if you want absolute style isolation
  encapsulation: ViewEncapsulation.Emulated 
})
export class PaymentElementComponent implements OnInit {

  // Replaces window.parent.postMessage
  @Output() paymentToken = new EventEmitter<string>();
  
  // Replaces window.parent.postMessage for errors
  @Output() validationError = new EventEmitter<string>();

  // Replaces window.addEventListener('message')
  @Input() set variables(theme: Record<string, string>) {
    if (theme) {
      this.applyTheme(theme);
    }
  }

  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder, private tokenService: TokenService){}

  ngOnInit() {
    this.initForm();
  }

  private applyTheme(theme: Record<string, string>) {
    // We apply variables to documentElement so they are available to :host
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  private initForm() {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(19)]],
      expirationDate: ['', [Validators.required, Validators.minLength(7), this.expirationDateValidator()]],
      securityCode: ['', [Validators.required, Validators.minLength(3)]],
      postalCode: ['', [Validators.required, Validators.minLength(5)]]
    });

    // --- Formatting Logic ---
    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(val => {
      if (val) {
        const digitsOnly = val.replace(/\D/g, '');
        const formatted = digitsOnly.match(/.{1,4}/g)?.join(' ') || '';
        if (formatted !== val) {
          this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    this.paymentForm.get('expirationDate')?.valueChanges.subscribe(val => {
      if (val) {
        const digitsOnly = val.replace(/\D/g, '');
        const formatted = digitsOnly.match(/.{1,2}/g)?.join(' / ') || '';
        if (formatted !== val) {
          this.paymentForm.get('expirationDate')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    // Apply numeric filters to Security and Postal codes
    ['securityCode', 'postalCode'].forEach(controlName => {
      this.paymentForm.get(controlName)?.valueChanges.subscribe(val => {
        if (val) {
          const digitOnly = val.replace(/\D/g, '');
          if (digitOnly !== val) {
            this.paymentForm.get(controlName)?.setValue(digitOnly, { emitEvent: false });
          }
        }      
      });
    });
  }

  expirationDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let val = control.value;
      if (!val || val.length !== 7) return null;
      let mm = parseInt(val.substring(0, 2));
      let yy = parseInt(val.substring(5, 7));
      if (mm < 1 || mm > 12) return { invalidMonth : true };
      
      let currentDate = new Date();
      let currentYear = currentDate.getFullYear() % 100;
      let currentMonth = currentDate.getMonth() + 1;

      if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        return { expired: true };
      }
      return null;
    }
  }

  submit() {
    if (this.paymentForm.invalid) return;

    const cardData = this.paymentForm.value;
    const normalizedCardData: NormalizedCardData = {
      cardNumber: cardData.cardNumber.replace(/\D/g, ''),
      expiryMonth: cardData.expirationDate.substring(0, 2),
      expiryYear: cardData.expirationDate.substring(5, 7),
      securityCode: cardData.securityCode,
      postalCode: cardData.postalCode
    };

    this.tokenService.getToken(normalizedCardData).subscribe({
      next: (res) => {
        // Emit standard Angular event
        this.paymentToken.emit(res.token);
      },
      error: (err) => {
        // Emit error event
        this.validationError.emit(err.error?.message || 'Tokenization failed');
      }
    });
  }
}