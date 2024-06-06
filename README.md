<div align="center">

<img src="/Screenshots/studysync_logo.png" alt="Logo">

<h3 align="center">StudySync</h3>

[![Status](https://img.shields.io/badge/status-active-success.svg)]() 
[![GitHub Issues](https://img.shields.io/github/issues/your-username/studysync.svg)](https://github.com/your-username/studysync/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/your-username/studysync.svg)](https://github.com/your-username/studysync/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

---
</div>

<p align="center">
StudySync is an innovative AI-driven solution designed to help students ensure their study materials comprehensively cover their curriculum. By identifying gaps in their notes and providing targeted recommendations, StudySync helps students optimize their study time and ensures they are well-prepared for exams.
<br>
</p>

## 📝 Table of Contents
- [About](#about)
- [Getting Started](#getting_started)
- [Built Using](#built_using)

## 🧐 About <a name = "about"></a>

### Features
- Upload notes in various formats: documents, PDFs, PowerPoint presentations, or photos of handwritten notes.
- AI-powered text extraction and topic identification using GPT-4 API.
- Gap analysis comparing identified topics with the curriculum.
- Personalized quizzes to help students focus on uncovered topics.
- Dynamic flashcards updated based on quiz performance.


## 🏁 Getting Started <a name = "getting_started"></a>
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

To run this project, you need to have the following installed on your system:
- Node.js
- OpenAI API key

### Installing

1. Clone the repository to your local machine:
   ```
   git clone https://github.com/roshangeorge97/StudySync
   ```

2. Navigate to the project directory:
   ```
   cd studysync
   ```

3. Edit the .env file to enter your OpenAI API key.

4. Navigate to the backend directory:
   ```
   cd backend
   ```
   
5. Install the required dependencies and start the backend:
   ```
   npm install
   npm run start
   ```

6. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

7. Install the required dependencies and start the frontend:
   ```
   npm install
   npm run start
   ```


## ⚡ Screenshots

[![Upload Notes](/Screenshots/upload_notes.png)]()
[![Homepage](/Screenshots/homepage.png)]()
[![Personalized Quiz](/Screenshots/personalized_quiz.png)]()
[![Flashcards](/Screenshots/flashcards.png)]()


## ⛏️ Built Using <a name = "built_using"></a>
- GPT-4 API: for NLP and AI-driven text analysis
- React: JavaScript library used for building user interfaces
- TailwindCSS: for styling the frontend
- Node.js: JavaScript runtime for the backend
- Express.js: web application framework for Node.js
- Firebase: for backend services

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
