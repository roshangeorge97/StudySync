import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config";
import { useNavigate } from "react-router-dom";

const SignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      navigate("/signin");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
};

export default SignOut;
