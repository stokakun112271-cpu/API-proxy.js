# RENZ MANGA — Vercel deployment

## File structure
- `index.html`: website UI and login flows
- `configfirebase.js`: Firebase web configuration, shared Auth and Firestore instances
- `api/proxy.js`: Vercel Function for MangaDex requests
- `vercel.json`: Vercel function configuration

## Before deploying
1. Open `configfirebase.js`. Replace `API_KEY_LU`, `PROJECT_ID`, `SENDER_ID`, and `APP_ID` placeholders with the web config from Firebase Console > Project settings > Your apps.
2. In Firebase Authentication, enable the sign-in providers used by the page (Google, GitHub, and Email/Password). For GitHub, configure the OAuth callback URL shown by Firebase.
3. Add the deployed Vercel domain in Firebase Authentication > Settings > Authorized domains.
4. Set up Firestore rules so each signed-in user can access only their own `users/{uid}` data.

## Deploy
1. Extract this ZIP and upload the files to a GitHub repository, preserving the `api` folder.
2. Import the repository into Vercel. Choose Framework Preset `Other`; leave build command blank for this static HTML project.
3. Deploy. Commits to the connected repository trigger redeployment.

## Notes
- The Firebase config values in this ZIP are placeholders. Login and cloud history will not work until replaced with your real Firebase web config.
- Firebase Web API keys are used by browser apps and are not server secrets; never put service-account private keys in this file. Protect data with Firebase Security Rules.
- MangaDex requests use `/api/proxy`. Favorites are stored in this browser's localStorage. MangaDex chapter query currently asks for English translations.
