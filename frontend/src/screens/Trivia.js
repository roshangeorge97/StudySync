import React, { useState } from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Trivia.css';

const questions = [
  {
    question: "Which of the following is/are the levels of implementation of data structures?",
    options: ["Abstract level", "Application level", "Implementation level", "All of the above"],
    answer: "All of the above"
  },
  {
    question: "A binary search tree whose left subtree and right subtree differ in height by at most 1 unit is called?",
    options: ["AVL tree", "Red-black tree", "Lemma tree", "None of the above"],
    answer: "AVL tree"
  },
  {
    question: "What is the time complexity of inserting an element at the end of an array?",
    options: ["O(1)", "O(nlogn)", "O(log n)", "O(n)"],
    answer: "O(1)"
  },
  {
    question: "Which data structure is best suited for implementing a recursive algorithm?",
    options: ["Stack", "Queue", "Array", "Linked List"],
    answer: "Stack"
  },
  {
    question: "In a binary search tree, which traversal visits the nodes in ascending order?",
    options: ["Preorder", "Inorder", "Postorder", "Levelorder"],
    answer: "Inorder"
  },
  {
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Merge Sort", "Selection sort", "Insertion Sort", "Bubble sort"],
    answer: "Merge Sort"
  },
  {
    question: "What is the worst-case time complexity of quicksort?",
    options: ["O(n)", "O(nlogn)", "O(n^2)", "O(log n)"],
    answer: "O(n^2)"
  },
  {
    question: "Which data structure is used in Depth First Search (DFS) algorithm?",
    options: ["Queue", "Stack", "Heap", "Linked List"],
    answer: "Stack"
  },
  {
    question: "What is the purpose of a hash table in data structures?",
    options: ["To store data in a sorted manner", "To implement priority queues", "To provide constant-time access to elements", "To sort elements efficiently"],
    answer: "To provide constant-time access to elements"
  },
  {
    question: "Which data structure is used to implement a LIFO behavior?",
    options: ["Queue", "Stack", "Heap", "Tree"],
    answer: "Stack"
  }
];

const getRandomQuestions = (numQuestions) => {
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQuestions);
};

const Trivia = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const navigate = useNavigate();

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
      <h1>Fun Trivia</h1>
      {triviaQuestions.length < 10 ? (
        <div className="error-container">
          <h2>Not enough questions available.</h2>
          <Button onClick={() => navigate("/home")}>Go to Home</Button>
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
        <div className="score-container">
          <h2>You have completed the trivia!</h2>
          <Button onClick={() => navigate("/home")}>Go to Home</Button>
        </div>
      )}
    </div>
  );
};

export default Trivia;