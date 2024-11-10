const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');

// Initialize the app
const app = express();
app.use(bodyParser.json());
app.set('view engine', 'ejs'); // Set EJS as the template engine

// Serve static files for the client (for service worker and other static files)
app.use(express.static('public'));

// VAPID keys for push notifications
const vapidKeys = {
  publicKey: 'BA4MxFbqv-Tx-bZ9M6s_mNt9LstHI_jFWgC-JMOEANJnujrmqhCBgDpp2fvZE2GeksT9uHdl3Qf08ppYSqkxBMc',
  privateKey: 'gCAJHsCVR3NMibfZLfRGtws2hw9b6TB_T1ZHUS5dz_Y'
};

webpush.setVapidDetails('mailto:example@yourdomain.org', vapidKeys.publicKey, vapidKeys.privateKey);

// In-memory storage for subscriptions (this can be replaced by a database)
let subscriptions = [];

// Serve the index.ejs page
app.get('/', (req, res) => {
  res.render('index'); // Assuming index.ejs is in the 'views' folder
});

// Endpoint to handle subscription (when the user clicks 'Subscribe')
const subscriptions = []; // Array to store unique subscriptions

app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  // Check if the subscription already exists
  const alreadySubscribed = subscriptions.some((sub) => 
    sub.endpoint === subscription.endpoint
  );

  if (alreadySubscribed) {
    // If subscription already exists, respond with a message
    return res.status(200).json({ message: 'Already subscribed!' });
  }

  // Add the subscription to the list if it doesn't exist
  subscriptions.push(subscription);
  console.log('New Subscription Added:', JSON.stringify(subscription, null, 2));

  res.status(201).json({ message: 'Subscription received!' });
});


// Endpoint to send notifications (this will be called from the backend)
app.post('/send-notification', (req, res) => {
  const notificationPayload = JSON.stringify({ message: "Backend-triggered notification!" });

  // Send notifications to all stored subscriptions
  const promises = subscriptions.map(sub => {
    return webpush.sendNotification(sub, notificationPayload).catch(error => {
      console.error('Error sending notification:', error);
    });
  });

  Promise.all(promises)
    .then(() => res.status(200).json({ message: 'Notifications sent!' }))
    .catch(error => {
      console.error('Error sending notifications:', error);
      res.status(500).json({ error: 'Error sending notifications' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
