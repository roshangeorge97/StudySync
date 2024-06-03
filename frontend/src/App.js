import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./screens/Home";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import QuizPage from "./screens/QuizPage";
import Flashcards from "./screens/Flashcards";
import MyTests from "./screens/MyTests";
import "./styles/bootstrap-custom.scss";
import TestDetails from "./screens/TestDetails";
import LandingPage from "./screens/LandingPage";

const App = () => {
  return (
    <Router>
      <Routes>
         <Route path="/home/:testId" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/test/:testId" element={<TestDetails />} />
        <Route path="/my-tests" element={<MyTests />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
