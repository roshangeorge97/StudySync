import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, getDocs } from "firebase/firestore";
import { Button, ListGroup, Popover, Overlay } from "react-bootstrap";
import "./mytests.css";
import Header from "./Header1";

const MyTests = () => {
  const [tests, setTests] = useState([]);
  const [user, setUser] = useState(null);
  const [newTestName, setNewTestName] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchTests(user.uid);
      } else {
        navigate("/signin");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchTests = async (userId) => {
    const testsRef = collection(db, "users", userId, "tests");
    const q = query(testsRef);
    const querySnapshot = await getDocs(q);
    const testsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTests(testsList);
  };

  const handleCreateTest = (event) => {
    setPopoverTarget(event.target);
    setShowPopover(true);
  };

  const handlePopoverSubmit = async () => {
    if (user && newTestName) {
      const testsRef = collection(db, "users", user.uid, "tests");
      const newTest = { name: newTestName, knownTopics: [], topics: [] };
      await addDoc(testsRef, newTest);
      setNewTestName('');
      setShowPopover(false);
      fetchTests(user.uid);
    }
  };

  const handleTestClick = (testId) => {
    navigate(`/home/${testId}`);
  };

  const handleTriviaClick = () => {
    navigate("/trivia");
  };

  return (
    <div className="my-tests-container">
      <Header />
      <h1>My Tests</h1>
      <ListGroup>
        {tests.map((test) => (
          <ListGroup.Item
            key={test.id}
            onClick={() => handleTestClick(test.id)}
            className="test-item"
          >
            {test.name || `Test ID: ${test.id}`}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <div className="button-container">
        <Button ref={popoverTarget} onClick={handleCreateTest} className="mb-3">
          Prepare new test
        </Button>
      </div>
      <div className="divider">---</div>
      <div className="button-container">
        <Button onClick={handleTriviaClick} className="mb-3">
          Fun Trivia🎈
        </Button>
      </div>
      <Overlay
        show={showPopover}
        target={popoverTarget}
        placement="bottom"
        container={popoverTarget}
        containerPadding={20}
        rootClose
        onHide={() => setShowPopover(false)}
      >
        <Popover id="popover-basic">
          <Popover.Header as="h3">
            Enter Test Name
            <button
              type="button"
              className="close"
              onClick={() => setShowPopover(false)}
            >
              &times;
            </button>
          </Popover.Header>
          <Popover.Body>
            <input
              type="text"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              placeholder="Test Name"
            />
            <Button onClick={handlePopoverSubmit}>Submit</Button>
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default MyTests;
