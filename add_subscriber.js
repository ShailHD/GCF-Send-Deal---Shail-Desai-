const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

async function addSubscriber() {
  await db.collection('subscribers').add({
    email_address: 'shaidesa@iu.edu',
    watch_regions: ['Europe'] // 
  });
  console.log('Added a new subscriber.');
}

addSubscriber().catch(console.error);
