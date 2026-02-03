# Secure Payment Element (Angular + iframe)

This project demonstrates a secure payment element architecture using **Angular Element** inside an **iframe**, a **mock backend (json-server)**, and **design-token based theming via postMessage**.

The goal is to simulate how modern payment systems (e.g. Stripe Elements, Adyen Drop-in) isolate sensitive card data while still allowing host applications to control styling and handle payment flow.

This is intentionally not built as a traditional Angular SPA. The payment UI is treated as an isolated, embeddable component.

<img width="1140" height="1096" alt="image" src="https://github.com/user-attachments/assets/bd46d835-88aa-42c2-b589-d1b9e18ea52f" />
<img width="1132" height="1120" alt="image" src="https://github.com/user-attachments/assets/e22d3495-331c-402c-89e2-022511cda497" />


---

## Project Structure

```
.
├── json-server/          # Mock backend (tokenize + pay)
├── payment-element/      # Angular element (iframe content)
├── pe-default.html       # Host demo page (default theme)
├── pe-dark.html          # Host demo page (dark theme)
└── README.md
```

---

## Architecture Overview

The project is split into three clearly separated parts:

### 1. payment-element (Angular – Angular Element + iframe content)

Responsibilities:
- Render payment form UI
- Handle input formatting (card number, expiry, CVC, postal code)
- Validate user input
- Normalize card data
- Send out validation status/errors and payment data
- Generate Web Component Build

The Angular element can implement real time validation and customization, it never handles payment processing directly.


---

### 2. iframe page (index.html)

Responsibilities:
- Load the payment element via iframe
- Isolate sensitive data
- Receive data sent by payment element
- Call `/api/v1/pay` to confirm payment
- Forward data to client 

This layer directly talk to the backend and isolate the payment data.

---

### 3. client page (pe-default.html / pe-dark.html)

Responsibilities:
- Load the iframe element
- Send submit order request and theme tokens to iframe via `postMessage`
- Display payment result, handle errors

The host page never sees raw card data.


---

### 4. json-server (mock backend)

Endpoints:

- `POST /api/v1/pay`  
  Simulates payment processing, return random results.

This backend is only for demo purposes. No real payment logic exists.

---

## Data Flow

<img width="1856" height="992" alt="image" src="https://github.com/user-attachments/assets/442cda3f-887a-4337-b748-d366763d7a97" />


At no point does raw card data leave the iframe context.

---

## Theming Model

The host controls styling by sending CSS variables:

```js
paymentFrame.contentWindow.postMessage({
  type: 'setTheme',
  variables: {
    '--pe-color-bg': '#020617',
    '--pe-color-text': '#e5e7eb',
    '--pe-color-border': '#1e293b',
    '--pe-color-primary': '#38bdf8'
  }
}, '*');
```

Inside iframe element, styles are defined using these tokens:

```js
Object.entries(event.data.variables || {}).forEach(([k, v]) => {
  document.documentElement.style.setProperty(k, v);
});
```

This allows:
- Dark / light theme switching
- Brand customization
- Zero coupling between host and iframe styles

---

## How to Run

### 1. Start mock backend

```bash
cd json-server
npm install
node index.js
```

Server will run on:

```
http://localhost:3000
```

---

### 2. Build Angular payment element

```bash
cd payment-element
npm install
ng build
```

Build files main.js and polyfills.js will be generated in /dist:

---

### 3. Start host server and open demo pages

The host pages **must be served via HTTP**. Do **not** open them using `file://`.

From the project root:

```bash
npx http-server .
```

Then open in browser:

```
http://localhost:8080/pe-default.html
http://localhost:8080/pe-dark.html
```

Note: Using `file://` will break iframe isolation and `postMessage` behavior.


---

