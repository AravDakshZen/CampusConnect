import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase";

const AuthContext = createContext();

export const useAuth = () =>
  useContext(AuthContext);

export const AuthProvider = ({
  children,
}) => {

  const [currentUser, setCurrentUser] =
    useState(null);

  const [userProfile, setUserProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          setCurrentUser(user);

          if (user) {

            try {

              const docRef =
                doc(
                  db,
                  "users",
                  user.uid
                );

              const docSnap =
                await getDoc(docRef);

              if (docSnap.exists()) {

                setUserProfile(
                  docSnap.data()
                );

              }

            } catch (error) {

              console.log(error);

            }

          } else {

            setUserProfile(null);

          }

          setLoading(false);

        }
      );

    return unsubscribe;

  }, []);

  const value = {

    currentUser,
    userProfile,
    setUserProfile,

    isAdmin:
      userProfile?.role === "admin",

  };

  return (

    <AuthContext.Provider value={value}>

      {!loading && children}

    </AuthContext.Provider>

  );

};