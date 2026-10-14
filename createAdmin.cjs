const admin = require('firebase-admin');
const serviceAccount = require('/Users/mohammedabdulkalam/Downloads/campus-connect-5eaa2-firebase-adminsdk-fbsvc-fbc48bf2d0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createAdmin = async () => {
  const email = "admin@campusconnect.edu";
  const password = "AdminPassword123!"; // You can change this
  const displayName = "Campus Connect Admin";

  try {
    // 1. Check if user already exists
    let userRecord;
    try {
        userRecord = await admin.auth().getUserByEmail(email);
        console.log(`User already exists with UID: ${userRecord.uid}`);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            // 2. Create the user
            console.log("Creating new admin user...");
            userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: displayName,
                emailVerified: true
            });
            console.log(`Successfully created new user with UID: ${userRecord.uid}`);
        } else {
            throw e;
        }
    }

    // 3. Set custom claims to make this user an admin
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`Successfully set admin privileges for ${email}.`);
    
    // 4. (Optional) Add them to a Firestore 'users' collection so they show up in the app correctly
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
        email: email,
        displayName: displayName,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`Added admin to Firestore 'users' collection.`);
    console.log("\n=============================================");
    console.log("✅ Admin account setup complete!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("=============================================\n");
    
    process.exit(0);

  } catch (error) {
    console.error("Error creating new user:", error);
    process.exit(1);
  }
};

createAdmin();
