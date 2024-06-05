import React from 'react';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './header.css';
import logo from '../images/logo.png';

const Header = () => {
  const navigate = useNavigate();  // Initialize useNavigate

  const goToSign = () => {
    navigate('/signin'); // Navigate to /signin
  };

  return (
    <header className="header">
      <div className="logo"><img src={logo} alt="Logo" /></div>
      <nav className="nav">
        <a href="/signin">Sign In</a>
        <a href="https://github.com/roshangeorge97/StudySync">GitHub</a>
        <button onClick={goToSign} className="register-button">Register Now</button>
      </nav>
    </header>
  );
};

export default Header;
