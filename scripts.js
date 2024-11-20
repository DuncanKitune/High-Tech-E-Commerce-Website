// nav menu
const mainMenu = document.querySelector('.mainMenu');
const closeMenu = document.querySelector('.closeMenu');
const openMenu = document.querySelector('.openMenu');

openMenu.addEventListener('click',show);
closeMenu.addEventListener('click',close);

function show(){
    mainMenu.style.display = 'flex';
    mainMenu.style.top = '0';
}
function close(){
    mainMenu.style.top = '-100%';
}
// Cart array and total price initialization
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let totalPrice = 0;



// Add to cart function
function addToCart(productId) {
  // Check if product is already in the cart
  const productIndex = cart.findIndex(item => item.id === productId);
  
  if (productIndex !== -1) {
      cart[productIndex].quantity += 1; // Increase quantity if already in cart
  } else {
      // Find the product details from the products array
      const product = products.find(item => item.id === productId);
      
      if (product) {  // Ensure the product exists
          const cartItem = { 
              id: product.id, 
              name: product.name, 
              price: product.price, 
              quantity: 1 
          };
          cart.push(cartItem); // Add new product to the cart
      } else {
          console.error("Product not found");
      }
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  alert("Product added to cart!");
}

// Display cart items
function displayCart() {
    const cartItemsDiv = document.getElementById('cart-items');
    cartItemsDiv.innerHTML = ''; // Clear previous content
    totalPrice = 0;

    cart.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('cart-item');
        productDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Price: $${item.price.toFixed(2)}</p>
            <p>Quantity: <input type="number" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)"></p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItemsDiv.appendChild(productDiv);

        totalPrice += item.price * item.quantity;
    });

    document.getElementById('total-price').innerText = `KES${totalPrice.toFixed(2)}`;
}

// Update quantity in cart
function updateQuantity(productId, newQuantity) {
    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex !== -1) {
        cart[productIndex].quantity = Number(newQuantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// // Proceed to checkout
function checkout() {
    localStorage.setItem('cart', JSON.stringify(cart)); // Save cart for checkout
    window.location.href = "checkout.html"; // Redirect to checkout page
}


// Display order summary at checkout
function displayOrderSummary() {
    const orderSummaryDiv = document.getElementById('order-summary');
    orderSummaryDiv.innerHTML = ''; // Clear previous content
    totalPrice = 0;

    cart.forEach(item => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('order-item');
        productDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Price: $${item.price.toFixed(2)}</p>
            <p>Quantity: ${item.quantity}</p>
        `;
        orderSummaryDiv.appendChild(productDiv);

        totalPrice += item.price * item.quantity;
    });

    document.getElementById('total-checkout-price').innerText = `$${totalPrice.toFixed(2)}`;
    }

    // Confirm order and send to email
    // Function to confirm and submit order
    function initializeOrderSummary() {
        const orderSummary = document.getElementById('order-summary');
        orderSummary.innerHTML = ''; // Clear previous entries

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.textContent = `${item.name} - Quantity: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            orderSummary.appendChild(itemDiv);
        });
        calculateTotal();
    }

    // Calculate and display total price
    function calculateTotal() {
        let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('total-checkout-price').innerText = `$${total.toFixed(2)}`;
    }

    // Function to confirm and submit the order
    function confirmOrder() {
        // Generate order details string
        let orderDetails = cart.map(item => `${item.name} - Qty: ${item.quantity} - $${item.price}`).join(', ');
        document.getElementById('order-details').value = orderDetails;

        // Confirm and submit
        if (cart.length > 0) {
            const checkoutForm = document.getElementById('checkout-form');
            checkoutForm.submit();

            // Clear cart after order confirmation
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));

            alert('Order confirmed!');
            window.location.href = "index.html"; // Redirect to home
        } else {
            alert("Your cart is empty.");
        }
    }

    // Initialize summary and total on page load
    window.onload = initializeOrderSummary;

// javascript for stripe payment
// Load Stripe and initialize it with your public key
// Load environment variables
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const request = require('request');

const app = express();
app.use(bodyParser.json());

// Stripe Payment - Debit/Credit Card
app.post('/stripe-payment', async (req, res) => {
  const { paymentMethodId, amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents (convert to smallest currency unit)
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Immediately confirm the payment
    });

    res.send({ success: true, paymentIntent });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Mpesa Payment - Safaricom Daraja API
app.post('/mpesa-payment', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  // Generate Mpesa token
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');

  request({
    url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    }
  }, (error, response, body) => {
    if (error) return res.status(500).send({ error: 'Failed to authenticate Mpesa' });
    
    const accessToken = JSON.parse(body).access_token;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    const mpesaPaymentRequest = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber, // Customer's phone number
      PartyB: process.env.MPESA_SHORTCODE, // Your business shortcode
      PhoneNumber: phoneNumber, // Same as PartyA
      CallBackURL: process.env.CALLBACK_URL, // Your callback URL
      AccountReference: 'Order12345', // Reference number for your transaction
      TransactionDesc: 'Payment for Order'
    };

    request({
      url: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mpesaPaymentRequest),
    }, (error, response, body) => {
      if (error) {
        res.status(500).send({ error: 'Mpesa payment request failed' });
      } else {
        res.send({ success: true, response: JSON.parse(body) });
      }
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// old stripe
// const stripe = stripe('your-public-key-here');
const elements = stripe.elements();
const cardElement = elements.create('card');

// Mount the card element to the form
cardElement.mount('#card-element');

// Handle form submission
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Create a payment method using the card information
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
  });

  if (error) {
    // Show error in #card-errors
    document.getElementById('card-errors').textContent = error.message;
  } else {
    // Send paymentMethod.id to your server for processing
    processPayment(paymentMethod.id);
  }
});

async function processPayment(paymentMethodId) {
  // Use Fetch API to send paymentMethodId to your backend for payment processing
  const response = await fetch('/process-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentMethodId }),
  });

  const result = await response.json();
  if (result.error) {
    // Show error in payment processing
    document.getElementById('card-errors').textContent = result.error;
  } else {
    // Payment successful
    alert('Payment successful!');
  }
}

async function payWithMpesa() {
    // Send a request to your backend to initiate an Mpesa payment
    const response = await fetch('/mpesa-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: '2547XXXXXXXX', amount: 1000 })
    });

    const result = await response.json();
    if (result.success) {
        alert('Mpesa Payment initiated. Please check your phone.');
    } else {
        alert('Error: ' + result.error);
    }
}
// Get back to the top the button
let backToTopBtn = document.getElementById("backToTopBtn");

// When the user scrolls down 2 times from the top of the document, show the button
let scrollCount = 0;
window.onscroll = function() {
    scrollCount++;
    if (scrollCount >= 6) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

// When the user clicks on the button, scroll to the top of the document
backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Track sales
app.post('/buy-product', async (req, res) => {
    const { productId, quantityPurchased } = req.body;
  
    try {
      const product = await Product.findById(productId);
      if (!product || product.quantity < quantityPurchased) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
  
      product.quantity -= quantityPurchased;
      product.salesCount += quantityPurchased;
      await product.save();
  
      res.json({ message: 'Purchase successful', product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
//   generate sales report
app.get('/sales-report', async (req, res) => {
    try {
      const report = await Product.find({}, 'name salesCount quantity');
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


//   add product in sqlite3
// const express = require('express');
const db = require('./database');
// const app = express();

app.use(express.json());

app.post('/add-product', (req, res) => {
    const { name, price, category, quantity, description } = req.body;

    const sql = `INSERT INTO products (name, price, category, quantity, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, price, category, quantity, description], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Product added successfully', productId: this.lastID });
    });
});

// edit product in sqlite3
app.patch('/edit-product/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, category, quantity, description } = req.body;

    const sql = `UPDATE products SET 
                 name = COALESCE(?, name), 
                 price = COALESCE(?, price), 
                 category = COALESCE(?, category), 
                 quantity = COALESCE(?, quantity), 
                 description = COALESCE(?, description) 
                 WHERE id = ?`;

    db.run(sql, [name, price, category, quantity, description, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product updated successfully' });
    });
});

// delete product in sqliteq3
app.delete('/delete-product/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM products WHERE id = ?`;
    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Product deleted successfully' });
    });
});


// //   add new product mongodb
// const express = require('express');
// const mongoose = require('mongoose');
// // const app = express();
// app.use(express.json());

// const Product = mongoose.model('Product', new mongoose.Schema({
//     name: String,
//     price: Number,
//     category: String,
//     quantity: Number,   // Stock level
//     description: String,
// }));

// app.post('/add-product', async (req, res) => {
//     const { name, price, category, quantity, description } = req.body;

//     try {
//         const newProduct = new Product({ name, price, category, quantity, description });
//         await newProduct.save();
//         res.status(201).json({ message: 'Product added successfully', product: newProduct });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// //   edit product
// app.patch('/edit-product/:id', async (req, res) => {
//     const { id } = req.params;
//     const updates = req.body;

//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
//         if (!updatedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.json({ message: 'Product updated successfully', product: updatedProduct });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // delete product
// app.delete('/delete-product/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const deletedProduct = await Product.findByIdAndDelete(id);
//         if (!deletedProduct) {
//             return res.status(404).json({ message: 'Product not found' });
//         }
//         res.json({ message: 'Product deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
