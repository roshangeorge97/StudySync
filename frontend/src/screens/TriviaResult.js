import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './TriviaResult.css';

const TriviaResult = () => {
  const { state } = useLocation();
  const { score } = state || {};
  const navigate = useNavigate();

  return (
    <div className="result-container">
      <div className="result-card">
        <h1>Trivia Result</h1>
        <h2>Your Score: {score}</h2>
        <Button variant="primary" onClick={() => navigate("/my-tests")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default TriviaResult;