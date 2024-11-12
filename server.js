// video player
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (like videos) in the "videos" folder
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Endpoint to get all video file names in the "videos" folder
app.get('/video-list', (req, res) => {
    const videoDir = path.join(__dirname, 'videos');
    fs.readdir(videoDir, (err, files) => {
        if (err) {
            res.status(500).send("Error reading video directory");
            return;
        }
        const videoFiles = files
            .filter(file => file.endsWith('.mp4'))
            .map((file, index) => ({
                src: `/videos/${file}`,
                title: `Video ${index + 1}`
            }));
        res.json(videoFiles);
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${3000}`));


// stripe payment
const express = require('express');
const stripe = require('stripe')('your-secret-key-here');
app.use(express.json());

app.post('/process-payment', async (req, res) => {
  const { paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000, // Amount in smallest currency unit, e.g., 5000 for $50
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    res.send({ success: true });
  } catch (error) {
    res.send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// mpesa payment
const express = require('express');
const request = require('request');

app.use(express.json());

// Safaricom API credentials
const consumerKey = 'your-consumer-key';
const consumerSecret = 'your-consumer-secret';
const shortcode = 'your-shortcode'; // Your business shortcode
const passkey = 'your-passkey'; // Mpesa passkey for Lipa Na Mpesa

// Generate Safaricom API token
async function getAccessToken() {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    return new Promise((resolve, reject) => {
        request({
            url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
            }
        }, (error, response, body) => {
            if (error) reject(error);
            resolve(JSON.parse(body).access_token);
        });
    });
}

// Mpesa Payment
app.post('/mpesa-payment', async (req, res) => {
    const { phoneNumber, amount } = req.body;
    const accessToken = await getAccessToken();

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const paymentRequest = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: 'https://yourcallbackurl.com/callback', // Your callback URL to receive payment confirmation
        AccountReference: 'Order12345', // Reference for the payment
        TransactionDesc: 'Payment for Order'
    };

    request({
        url: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
    }, (error, response, body) => {
        if (error) {
            res.send({ error: 'Mpesa payment request failed' });
        } else {
            res.send({ success: true });
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
