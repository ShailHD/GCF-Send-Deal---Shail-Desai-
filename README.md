# GCF: Email Deal to Subscriber

This is a Google Cloud Function triggered by a new document in the `deals` collection in your default Firestore database. It will query the database to find all subscribers who are watching the region in the provided deal and will email the deal to them.

## Deployment Command
**Ensure you have an active Google Cloud Project**