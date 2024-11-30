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
    mainMenu.style.top = '-110%';
}

// Get the button
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

    // Function to display products dynamically
    function displayProducts() {
        const productContainer = document.getElementById('products');
        productContainer.innerHTML = ''; // Clear container

        products.forEach(product => {
            product.variants.forEach(variant => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';

                productCard.innerHTML = `
                    <img src="${variant.images[0]}" alt="${product.name}" class="product-image">
                    <h3>${product.name}</h3>
                    <p>Size: ${variant.size}</p>
                    <p>Color: ${variant.color}</p>
                    <p>Price: KES ${variant.price.toFixed(2)}</p>
                    <p>${variant.time}</p>
                    <button onclick="addToCart(${product.id}, ${variant.variantId})">Add to Cart</button>
                `;

                productContainer.appendChild(productCard);
            });
        });
    }

    // Add to cart
    function addToCart(productId, variantId) {
        const product = products.find(p => p.id === productId);
        const variant = product.variants.find(v => v.variantId === variantId);

        const cartItem = cart.find(item => item.variantId === variantId);
        if (cartItem) {
            cartItem.quantity += 1; // Increase quantity if already in the cart
        } else {
            cart.push({
                productId,
                variantId,
                name: product.name,
                size: variant.size,
                color: variant.color,
                price: variant.price,
                quantity: 1
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${product.name} (Variant ${variantId}) added to cart!`);
    }

    // Display cart items on the cart page
    function displayCart() {
        const cartContainer = document.getElementById('cart-items');
        cartContainer.innerHTML = '';

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cart.forEach((item, index) => {
            const cartRow = document.createElement('div');
            cartRow.className = 'cart-row';

            cartRow.innerHTML = `
                <p>${item.name} (${item.size}, ${item.color})</p>
                <p>Price: KES ${item.price.toFixed(2)}</p>
                <p>Quantity: 
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    ${item.quantity}
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </p>
                <p>Total: KES ${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart(${index})">Remove</button>
            `;

            cartContainer.appendChild(cartRow);
        });

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        document.getElementById('cart-total').innerText = `Total: KES ${total.toFixed(2)}`;
    }

    // Update quantity in cart
    function updateQuantity(index, change) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1); // Remove item if quantity is zero
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }

    // Remove item from cart
    function removeFromCart(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
    }

    // Checkout and order tracking
    function checkout() {
        if (cart.length === 0) {
            alert('Your cart is empty. Add items to proceed.');
            return;
        }

        const order = {
            id: Date.now(),
            items: [...cart],
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            status: 'Processing'
        };

        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.removeItem('cart');
        alert(`Order placed successfully! Your Order ID is ${order.id}`);
        window.location.href = './order_tracking.html';
    }

    // Display orders
    function displayOrders() {
        const ordersContainer = document.getElementById('orders');
        const orders = JSON.parse(localStorage.getItem('orders')) || [];

        ordersContainer.innerHTML = '';
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p>No orders found.</p>';
            return;
        }

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';

            orderCard.innerHTML = `
                <p>Order ID: ${order.id}</p>
                <p>Status: ${order.status}</p>
                <p>Total: KES ${order.total.toFixed(2)}</p>
                <ul>
                    ${order.items.map(item => `<li>${item.name} (${item.quantity}x)</li>`).join('')}
                </ul>
            `;

            ordersContainer.appendChild(orderCard);
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        displayProducts();
    });



// // Proceed to checkout
// function checkout() {
//     localStorage.setItem('cart', JSON.stringify(cart)); // Save cart for checkout
//     window.location.href = "checkout.html"; // Redirect to checkout page
// }


// // Display order summary at checkout
// function displayOrderSummary() {
//     const orderSummaryDiv = document.getElementById('order-summary');
//     orderSummaryDiv.innerHTML = ''; // Clear previous content
//     totalPrice = 0;

//     cart.forEach(item => {
//         const productDiv = document.createElement('div');
//         productDiv.classList.add('order-item');
//         productDiv.innerHTML = `
//             <h3>${item.name}</h3>
//             <p>Price: $${item.price.toFixed(2)}</p>
//             <p>Quantity: ${item.quantity}</p>
//         `;
//         orderSummaryDiv.appendChild(productDiv);

//         totalPrice += item.price * item.quantity;
//     });

//     document.getElementById('total-checkout-price').innerText = `$${totalPrice.toFixed(2)}`;
//     }

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
            window.location.href = "profile.html"; // Redirect to home
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
