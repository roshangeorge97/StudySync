import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase-config"; // Import your firebase configuration
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "react-bootstrap";

const TestDetails = () => {
  const [test, setTest] = useState(null);
  const [user, setUser] = useState(null);
  const { testId } = useParams(); // Get the test ID from the URL
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchTestDetails(user.uid, testId);
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [navigate, testId]);

  const fetchTestDetails = async (userId, testId) => {
    const testDocRef = doc(db, "users", userId, "tests", testId);
    const testDoc = await getDoc(testDocRef);
    if (testDoc.exists()) {
      setTest(testDoc.data());
    } else {
      console.log("No such document!");
    }
  };

  if (!test) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Test Details</h1>
      <p>Test ID: {testId}</p>
      {/* Display more details about the test here */}
      <Button onClick={() => navigate("/")}>Back to My Tests</Button>
    </div>
  );
};

export default TestDetails;
