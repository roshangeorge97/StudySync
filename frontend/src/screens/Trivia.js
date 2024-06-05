import React, { useState, useEffect } from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import './Trivia.css';
import Header from './Header1';

const Trivia = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCSV = async () => {
      const fourOptionsResponse = await fetch('\\DSA_DATASET_UPDATED.csv');
      const fourOptionsText = await fourOptionsResponse.text();

      const threeOptionsResponse = await fetch('\\test.csv');
      const threeOptionsText = await threeOptionsResponse.text();

      const fourOptionsData = Papa.parse(fourOptionsText, { header: true }).data;
      const threeOptionsData = Papa.parse(threeOptionsText, { header: true }).data;

      const formattedFourOptionsData = fourOptionsData.map(row => ({
        question: row.Question,
        options: [row.Option1, row.Option2, row.Option3, row.Option4],
        answer: row.Answer
      }));

      const formattedThreeOptionsData = threeOptionsData.map(row => ({
        question: row.question,
        options: [row.distractor3, row.distractor1, row.distractor2],
        answer: row.correct_answer
      }));

      setQuestions([...formattedFourOptionsData, ...formattedThreeOptionsData]);
    };

    fetchCSV();
  }, []);
 
  const getRandomQuestions = (numQuestions) => {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
  };

  const triviaQuestions = getRandomQuestions(10);

  const handleAnswer = (option) => {
    const currentQuestion = triviaQuestions[currentQuestionIndex];
    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: option,
    });
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < triviaQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else if (triviaQuestions.length === 10) {
      navigate("/trivia-result", { state: { score } });
    }
  };

  return (
    <div className="trivia-container">
      <Header />
      {triviaQuestions.length < 10 ? (
        <div className="error-container">
          <h2>Not enough questions available.</h2>
          <Button onClick={() => navigate("/my-tests")}>Go to Home</Button>
        </div>
      ) : currentQuestionIndex < triviaQuestions.length ? (
        <div className="question-container">
          <h2>{triviaQuestions[currentQuestionIndex].question}</h2>
          <ListGroup>
            {triviaQuestions[currentQuestionIndex].options.map((option, index) => (
              <ListGroup.Item key={index} onClick={() => handleAnswer(option)} className="trivia-option">
                {option}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      ) : (
        <div className="result-container">
          <h2>Your Score: {score}</h2>
          <Button onClick={() => navigate("/my-tests")}>Go to Home</Button>
        </div>
      )}
    </div>
  );
};

export default Trivia;
