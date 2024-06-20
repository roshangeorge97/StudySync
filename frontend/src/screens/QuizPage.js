import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./QuizPage.css";

const QuizPage = () => {
  const location = useLocation();
  const { quiz, userId, testId } = location.state;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Submitting quiz, this may take a while...");

  useEffect(() => {
    let interval;
    if (isLoading) {
      const messages = [
        "Submitting quiz, this may around 5 minutes...",
        "Uploading your answers into the database...",
        "Almost there..."
      ];
      let index = 0;
      interval = setInterval(() => {
        setLoadingMessage(messages[index]);
        index = (index + 1) % messages.length;
      }, 5000); // Change message every 2 seconds
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnswerButtonClick = (isCorrect, subtopic) => {
    const updatedResults = [
      ...results,
      {
        question: quiz[currentQuestionIndex].question,
        subtopic: subtopic || "Unknown",
        correct: isCorrect,
      },
    ];
    setResults(updatedResults);
    if (isCorrect) {
      setScore(score + 1);
    }
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < quiz.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://studysync-odhf.onrender.com/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          testId,
          results,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Thanks for taking the quiz!");
      } else {
        alert("There was an issue submitting your results. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quiz-container">
      {isLoading ? (
        <div className="loader">{loadingMessage}</div>
      ) : showScore ? (
        <>
          <p className="score-section">
            You scored {score} out of {quiz.length}
          </p>
          <button onClick={handleSubmit} className="submit-button" disabled={isLoading}>
            Submit
          </button>
        </>
      ) : (
        <div className="question-section">
          <p className="question-count">
            Question {currentQuestionIndex + 1}/{quiz.length}
          </p>
          <p className="question-text">{quiz[currentQuestionIndex].question}</p>
          <div className="answer-section">
            {quiz[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  handleAnswerButtonClick(option.isCorrect, quiz[currentQuestionIndex].subtopic)
                }
                className="quiz-button"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
