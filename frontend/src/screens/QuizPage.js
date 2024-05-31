import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./QuizPage.css";

const QuizPage = () => {
  const location = useLocation();
  const { quiz, userId, testId } = location.state;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [results, setResults] = useState([]);

  const handleAnswerButtonClick = (isCorrect, subtopic) => {
    const updatedResults = [
      ...results,
      {
        question: quiz[currentQuestionIndex].question,
        subtopic: subtopic || "Unknown", // Use "Unknown" as a placeholder if subtopic is not available
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
    try {
      const response = await fetch("http://localhost:5001/results", {
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
    }
  };

  return (
    <>
      {showScore ? (
        <>
          <p>
            You scored {score} out of {quiz.length}
          </p>
          <button onClick={handleSubmit} className="submit-button">
            Submit
          </button>
        </>
      ) : (
        <>
          <p>
            Question {currentQuestionIndex + 1}/{quiz.length}
          </p>
          <p>{quiz[currentQuestionIndex].question}</p>
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
        </>
      )}
    </>
  );
};

export default QuizPage;
