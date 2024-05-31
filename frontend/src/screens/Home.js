import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { auth, db } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import "./home.css";

const instance = axios.create({
  baseURL: "http://localhost:5001",
  timeout: 1000000,
  headers: { "X-Custom-Header": "foobar" },
});

const Home = () => {
  const { testId } = useParams();
  const [error, setError] = useState("");
  const [dbFlashcards, setDbFlashcards] = useState(null);
  const [missingTopics, setMissingTopics] = useState("");
  const [selectedFile1, setSelectedFile1] = useState(null);
  const [selectedFile2, setSelectedFile2] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileSelected1, setFileSelected1] = useState(false);
  const [fileSelected2, setFileSelected2] = useState(false);
  const [showQuizButton, setShowQuizButton] = useState(false);
  const [showFlashcardsButton, setShowFlashcardsButton] = useState(false);
  const [showQuizButton1, setShowQuizButton1] = useState(false);
  const [showFlashcardsButton1, setShowFlashcardsButton1] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [username, setUsername] = useState(null);
  const [user, setUser] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (testId) {
      setSelectedTestId(testId);
    }
  }, [testId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsername(user.email);
        setUser(user);
  
        // Fetch all tests for the user
        const userId = user.uid;
        const response = await instance.get(`/api/tests/${userId}`);
        setTests(response.data.tests);
  
        // Check the isUploaded status for the selected test
        if (selectedTestId) {
          const testRef = doc(db, `users/${userId}/tests`, selectedTestId);
          const testDoc = await getDoc(testRef);
          if (testDoc.exists()) {
            const uploadedStatus = testDoc.data().isUploaded;
            setIsUploaded(uploadedStatus);
  
            // Automatically set showQuizButton and showFlashcardsButton to true if isUploaded is true
            if (uploadedStatus) {
              setShowQuizButton1(true);
              setShowFlashcardsButton1(true);
            }
          }
        }
      } else {
        setUsername(null);
        setUser(null);
        setFlashcards(null);
        setTests([]);
      }
    });
  
    return () => unsubscribe();
  }, [selectedTestId]);
  

  const handleCreateTest = async () => {
    try {
      const response = await instance.post("/api/createtest", { uid: user.uid });
      const newTest = { id: response.data.testId, missingTopics: [], flashcards: [] };
      setTests([...tests, newTest]);
    } catch (e) {
      console.error(e);
      setError("Failed to create a new test.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMissingTopics("");

    if (!selectedFile1 || !selectedFile2) {
      setError("Please upload both documents!");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pdf1", selectedFile1);
      formData.append("pdf2", selectedFile2);
      formData.append("uid", user.uid);
      formData.append("testId", selectedTestId);

      const response = await instance.post("/api/comparepdfs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        setError(response.data.error);
        setShowQuizButton(false);
        setShowFlashcardsButton(false);
      } else {
        setError("");
        setShowQuizButton(true);
        setShowFlashcardsButton(true);
      }
    } catch (e) {
      console.error(e);
      setError("Something went wrong");
      setShowQuizButton(false);
      setShowFlashcardsButton(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange1 = (event) => {
    const file = event.target.files[0];
    setSelectedFile1(file);
    setFileSelected1(true);
  };

  const handleFileChange2 = (event) => {
    const file = event.target.files[0];
    setSelectedFile2(file);
    setFileSelected2(true);
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setError("");
    setMissingTopics("");
  
    try {
      const formData = new FormData();
      formData.append("pdf1", selectedFile1);
      formData.append("pdf2", selectedFile2);
  
      const response = await instance.post("/api/generatequiz", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setError("");
        navigate('/quiz', { state: { quiz: response.data.quiz, userId: user.uid, testId: selectedTestId } });
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (flashcards) {
      navigate("/flashcards", { state: { flashcards } });
    } else {
      setIsGeneratingFlashcards(true);
      setError("");
      setMissingTopics("");

      try {
        const formData = new FormData();
        formData.append("pdf1", selectedFile1);
        formData.append("pdf2", selectedFile2);
        formData.append("uid", user.uid);
        formData.append("testId", selectedTestId);

        const response = await instance.post("/api/generateflashcards", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.error) {
          setError(response.data.error);
        } else {
          setError("");
          setFlashcards(response.data.flashcards);
          navigate("/flashcards", { state: { flashcards: response.data.flashcards } });
        }
      } catch (error) {
        console.error(error);
        setError("Failed to generate flashcards. Please try again later.");
      } finally {
        setIsGeneratingFlashcards(false);
      }
    }
  };

const fetchMissingTopics = async (testId) => {
  try {
    const userId = user.uid;
    const testRef = doc(db, `users/${userId}/tests`, testId);
    const testDoc = await getDoc(testRef);

    if (testDoc.exists()) {
      const missingTopics = testDoc.data().missingTopics;
      return missingTopics;
    } else {
      console.error("Test document not found");
      return [];
    }
  } catch (error) {
    console.error("Error fetching missing topics:", error);
    return [];
  }
};

const handleGenerateQuizAgain = async () => {
  setIsGeneratingQuiz(true);
  setError("");

  try {
    const missingTopics = await fetchMissingTopics(selectedTestId);

    const response = await instance.post("/api/generatequizfrommissingtopics", { missingTopics }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.error) {
      setError(response.data.error);
    } else {
      setError("");
      navigate('/quiz', { state: { quiz: response.data.quiz, userId: user.uid, testId: selectedTestId } });
    } 
  } catch (error) {
    console.error(error);
    setError("Something went wrong");
  } finally {
    setIsGeneratingQuiz(false);
  }
};

const handleReviewFlashcards = async () => {
  setIsGeneratingFlashcards(true);
  setError("");

  try {
    const missingTopics = await fetchMissingTopics(selectedTestId);

    const response = await instance.post("/api/generateflashcardsfromtopics", { missingTopics }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.error) {
      setError(response.data.error);
    } else {
      setError("");
      setFlashcards(response.data.flashcards);
      navigate("/flashcards", { state: { flashcards: response.data.flashcards } });
    }
  } catch (error) {
    console.error(error);
    setError("Failed to generate flashcards. Please try again later.");
  } finally {
    setIsGeneratingFlashcards(false);
  }
};

  

  return (
    <div>
      <header className="header">
        <div className="header-left">
          <h1>PDF Comparison Tool</h1>
        </div>
        <div className="header-right">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              <FaUserCircle size={30} />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.ItemText>
                {username ? `Logged in as: ${username}` : "Not logged in"}
              </Dropdown.ItemText>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
      <div className="container">
        <div className="hero d-flex align-items-center justify-content-center text-center flex-column p-3">
          <p className="lead">Compare Teacher's Resources with Student's Notes!</p>
          {!isUploaded ? (
            <form className="w-100" onSubmit={handleSubmit}>
              <div className="input-container">
                <label htmlFor="fileInput1" className="file-label">
                  Teacher's Resource
                  <div className={`file-input-wrapper ${fileSelected1 ? 'file-selected' : ''}`}>
                    <input
                      id="fileInput1"
                      name="pdf1"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange1}
                      className="file-input"
                    />
                    <span className="file-input-button">Select file</span>
                  </div>
                </label>
              </div>
              <div className="input-container">
                <label htmlFor="fileInput2" className="file-label">
                  Student's Notes
                  <div className={`file-input-wrapper ${fileSelected2 ? 'file-selected' : ''}`}>
                    <input
                      id="fileInput2"
                      name="pdf2"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange2}
                      className="file-input"
                    />
                    <span className="file-input-button">Select file</span>
                  </div>
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-primary custom-button mt-3"
                disabled={isLoading}
              >
                {isLoading ? "Analyzing PDFs..." : "Compare Documents"}
              </button>
            </form>
          ) : (
            <div className="mt-3 button-container">
              {showQuizButton && (
                <button className="quiz-button" onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}>
                  {isGeneratingQuiz ? "Generating Quiz..." : "Generate Quiz"}
                </button>
              )}
              {showQuizButton1 && (
                <button className="quiz-button" onClick={handleGenerateQuizAgain} disabled={isGeneratingQuiz}>
                  {isGeneratingQuiz ? "Generating Quiz..." : "Quiz Again"}
                </button>
              )}
              {showFlashcardsButton && (
                <button className="flashcard-button" onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards}>
                  {isGeneratingFlashcards ? "Generating Flashcards..." : "Generate Flashcards"}
                </button>
              )}
              {showFlashcardsButton1 && (
                <button className="flashcard-button" onClick={handleReviewFlashcards} disabled={isGeneratingFlashcards}>
                  {isGeneratingFlashcards ? "Generating Flashcards..." : "Review Flashcards"}
                </button>
              )}
            </div>
          )}
        </div>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {missingTopics && (
          <div className="alert alert-warning mt-3">
            <h4>Missing Topics</h4>
            <ul>
              {missingTopics.split(',').map((topic, index) => (
                <li key={index}>{topic.trim()}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

};

export default Home;
