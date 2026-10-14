import { getApps, getApp, initializeApp } from "firebase/app";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import {
  getFirestore
} from "firebase/firestore";

import {
  getStorage
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUkXoEhuxGFvjrjtyLWBBflEEryu7aDPU",
  authDomain: "campus-connect-5eaa2.firebaseapp.com",
  projectId: "campus-connect-5eaa2",
  storageBucket: "campus-connect-5eaa2.firebasestorage.app",
  messagingSenderId: "807632386204",
  appId: "1:807632386204:web:c7e9e0e44b8286fa731559"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const logoutUser = () =>
  signOut(auth);

export const onAuthChange = (callback) =>
  onAuthStateChanged(auth, callback);

export default app;