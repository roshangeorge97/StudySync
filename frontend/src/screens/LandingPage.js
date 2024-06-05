import React from 'react';
import { useNavigate } from "react-router-dom";
import './LandingPage.css';
import student from '../images/student.webp';
import Header from './header';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/signin');
  };

  return (
    <div className="landing-page">
      <Header />
      <main className="main-content">
        <div className="left-content">
          <h1>StudySync</h1>
          <p>StudySync uses AI to identify gaps between your knowledge and exam portions, then provides a personalized learning path with flashcards and quizzes to help you unlock your brain's potential.</p>
          <button className="get-started-button" onClick={handleGetStartedClick}>Get Started</button>
        </div>
        <div className="right-content">
          <img src={student} alt="Student with books" />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
