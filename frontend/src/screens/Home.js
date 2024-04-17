import axios from "axios";
import React, { useState } from "react";
import "./home.css";

const instance = axios.create({
  baseURL: "http://localhost:5001",
  timeout: 1000000,
  headers: { "X-Custom-Header": "foobar" },
});

const Home = () => {
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [jresult, setJresult] = useState("");
  const [maxWords, setMaxWords] = useState(200);
  const [selectedFile, setSelectedFile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    if (!maxWords) {
      setError("Please enter a number of words for the summary.");
      setResult("");
      setJresult("");
      return;
    }

    try {
      const formData = new FormData();
      console.log({ selectedFile });
      formData.append("pdf", selectedFile);
      formData.append("maxWords", maxWords);
      console.log({ formData });

      const response = await instance.post("/api/pdfsummary", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      if (response.data.error) {
        setError(response.data.error);
        return;
      }
      setError("");

      setJresult(JSON.stringify(response.data, null, 2));

      if (response.ok) {
        const data = await response.json();
        setResult(data.data.choices[0].text);
        setError("");
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      setResult("");
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="container">
      <div className="hero d-flex align-items-center justify-content-center text-center flex-column p-3">
        <h1 className="display-4">PDF Book Summarizer</h1>
        <p className="lead">Summarize PDF books for Efficient Reading!</p>
        <form className="w-100" onSubmit={handleSubmit}>
          <input
            name="pdf"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <div className="form-group row">
            <div className="col-sm-4 offset-sm-4 mt-3">
              <input
                type="number"
                min="10"
                value={maxWords}
                onChange={(e) => setMaxWords(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary custom-button mt-3"
              disabled={!selectedFile || isLoading}
            >
              {isLoading
                ? "Analyzing PDF..."
                : `Summarize PDF in ${maxWords} words`}
            </button>
          </div>
        </form>
      </div>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {result && <div className="alert alert-success mt-3">{result}</div>}
      {jresult && (
        <pre className="alert alert-info mt-3">
          <code>{jresult}</code>
        </pre>
      )}
    </div>
  );
};

export default Home;
