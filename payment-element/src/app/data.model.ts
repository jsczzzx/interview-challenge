// export interface CardFormValue {
//     cardNumber: string;
//     expirationDate: Date;
//     securityCode: string;
//     postalCode: string;
// }

export interface NormalizedCardData {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    securityCode: string;
    postalCode: string;
}