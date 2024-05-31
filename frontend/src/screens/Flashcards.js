import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Flashcards.css";

const Flashcards = () => {
  const location = useLocation();
  const { flashcards } = location.state;
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);

  // Ensure flashcards is an array
  if (!Array.isArray(flashcards)) {
    return <div>Error: Invalid flashcards format</div>;
  }

  const handleFlashcardClick = (index) => {
    setSelectedFlashcard(flashcards[index]);
  };

  const handleClosePopup = () => {
    setSelectedFlashcard(null);
  };

  return (
    <div className="flashcards-container">
      {flashcards.map((flashcard, index) => (
        <div
          key={index}
          className="flashcard-box"
          onClick={() => handleFlashcardClick(index)}
        >
          {flashcard.subtopic}
        </div>
      ))}

      {selectedFlashcard && (
        <div className="popup">
          <div className="popup-content">
            <h2>{selectedFlashcard.subtopic}</h2>
            <ul>
              {selectedFlashcard.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
            <button onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
