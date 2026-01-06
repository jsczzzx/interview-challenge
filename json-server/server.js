const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser); 

server.post('/api/v1/tokenize', (req, res) => {
  const { cardNumber, securityCode } = req.body;

  if (!cardNumber || !securityCode || cardNumber.length < 16) {
    return res.status(400).json({
      error: 'Invalid card data.',
      message: 'Card Number and Security Code are required for tokenization.'
    });
  }


  const mockToken = 'tok_' + Math.random().toString(36).substring(2, 15);

  res.status(200).json({
    token: mockToken,
    message: 'Payment information successfully tokenized.'
  });
});


server.post('/api/v1/pay', (req, res) => {
  const { token, postalCode, amount } = req.body;

  if (!token || !token.startsWith('tok_')) {
    return res.status(400).json({
      success: false,
      message: 'Payment failed: Invalid or missing token.'
    });
  }

  const isSuccess = (token.length % 2 === 0);

  if (isSuccess) {
    res.status(200).json({
      success: true,
      transactionId: 'txn_' + Date.now(),
      message: 'Payment successful! Thank you.'
    });
  } else {
    res.status(400).json({
      success: false,
      errorCode: 'P001',
      message: 'Payment failed due to simulated processing error.'
    });
  }
});


server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Tokenization Endpoint: POST http://localhost:${PORT}/api/v1/tokenize`);
  console.log(`Payment Endpoint: POST http://localhost:${PORT}/api/v1/pay`);
});