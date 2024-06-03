import React from 'react';
import { useNavigate, useParams } from "react-router-dom"; // Import useHistory
import './LandingPage.css';
import student from '../images/student.webp';
import logo from '../images/logo.png';

const LandingPage = () => {
  const navigate = useNavigate();  // Initialize useHistory

  const handleGetStartedClick = () => {
    navigate('/signin'); // Navigate to /signup
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo"><img src={logo}></img></div>
        <nav className="nav">
          <a href="/signin">Sign In</a>
          <a href="#">GitHub</a>
          <button className="register-button">Register Now</button>
        </nav>
      </header>
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
