// Required libraries are imported: Firebase Functions for the cloud function, 
// Firebase Admin to interact with Firebase services, and SendGrid's mail client for email sending capabilities.
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sendGridMail = require('@sendgrid/mail');

// Initializes the Firebase app and SendGrid with configuration settings.
// Specifically, the SendGrid API key is set from an environment variable, enhancing security by avoiding hard-coded values.
admin.initializeApp();
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY); // Use environment variable for the API Key

// This export defines a Cloud Function that triggers when a new document is created in the 'deals' collection.
exports.sendDealEmail = functions.firestore
  .document('deals/{dealId}')
  .onCreate(async (snap, context) => {
    // Extracts the deal information from the created document.
    const deal = snap.data();

    // Queries the 'subscribers' collection for users interested in deals for the given locations.
    const subscribersQuerySnapshot = await admin.firestore()
      .collection('subscribers')
      .where('watch_regions', 'array-contains-any', deal.location)
      .get();

    // If there are no subscribers interested in the deal's regions, logs a message and exits the function.
    if (subscribersQuerySnapshot.empty) {
      console.log('No subscribers for these regions.');
      return;
    }

    // Maps over the subscribers query snapshot to prepare email messages for each subscriber.
    // These emails include details of the new deal, tailored to the subscriber's interests.
    const emailsPromises = subscribersQuerySnapshot.docs.map(doc => {
      const subscriber = doc.data();
      const msg = {
        to: subscriber.email_address, // The subscriber's email address
        from: 'shaidesa@iu.edu', // Your verified sender email address
        subject: `shaidesa: ${deal.headline}`, // Personalized email subject line including the deal headline
        text: `Hi! New travel deal alert: ${deal.headline}`, // Plain text email body
        html: `<strong>Hi!</strong> New travel deal alert: ${deal.headline}` // HTML email body for richer formatting
      };
      return sendGridMail.send(msg); // Sends the email using SendGrid
    });

    // Attempts to send all the prepared emails concurrently. If successful, logs a confirmation message.
    try {
      await Promise.all(emailsPromises);
      console.log('Emails sent successfully!');
    } catch (error) {
      // If an error occurs during email sending, logs the error and throws an HTTPS error to indicate failure.
      console.error('Error sending emails:', error);
      throw new functions.https.HttpsError('internal', 'Unable to send emails.', error);
    }
  });
