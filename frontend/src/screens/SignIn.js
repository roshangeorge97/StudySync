import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase-config";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button, Form } from "react-bootstrap";
import Header from "./header";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/my-tests"); // Navigate to My Tests page
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/my-tests"); // Navigate to My Tests page
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <Header/>
      <Form className="auth-form" onSubmit={handleSignIn}>
        <h2>Sign In</h2>
        {error && <div className="error">{error}</div>}
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="success" type="submit" className="mt-3">
          Sign In
        </Button>
        <Button variant="success" onClick={handleGoogleSignIn} className="mt-3">
          Sign in with Google
        </Button>
        <p className="mt-3">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </Form>
    </div>
  );
};

export default SignIn;
