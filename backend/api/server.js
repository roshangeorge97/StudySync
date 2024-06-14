const express = require("express");
var cors = require("cors");
const app = express();
const OpenAI = require("openai");
const { EventEmitter } = require("events");
const multer = require("multer");
const path = require("path");
const { PDFExtract } = require("pdf.js-extract");
const { encode } = require("gpt-3-encoder");
const { db } = require("./firebase-config");
const { getFirestore, doc, updateDoc, collection, addDoc, getDocs, getDoc } = require('firebase/firestore');

app.use(cors());
app.use(express.json());
app.use(cors({
  origin: ['https://study-sync-frontend.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
require('dotenv').config();

// Use the OpenAI API key from the environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const completionEmitter = new EventEmitter();

const dest = path.join(__dirname, "pdfsummary");
const upload = multer({ dest });
const type = upload.fields([{ name: "pdf1" }, { name: "pdf2" }]);

const calculateTokens = (text) => encode(text).length;

const summarizeChunk = async (chunk, maxWords) => {
  let condition = "";
  if (maxWords) {
    condition = `in about ${maxWords} words`;
  }

  const message = {
    role: "user",
    content: `Please summarize the following text ${condition}:\n"""${chunk}"""\n\nSummary:`,
  };

  const request = {
    model: "gpt-3.5-turbo",
    messages: [message],
    max_tokens: 4000,
  };

  try {
    const response = await openai.chat.completions.create(request);
    return response.choices[0].message.content;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(error.status); // e.g. 401
      console.error(error.message); // e.g. The authentication token you passed was invalid...
      console.error(error.code); // e.g. 'invalid_api_key'
      console.error(error.type); // e.g. 'invalid_request_error'
    } else {
      console.log(error);
    }
    throw new Error(error);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



async function generateFlashcards(text1, text2) {
  const prompt = ` Generate flashcards based on the provided texts. The output should be a JSON array where each flashcard is an object with "subtopic" and "details".

Text1: ${text1}

Text2: ${text2}

Example output format: [   {     "subtopic": "Subtopic 1",     "details": [       "Detail 1",       "Detail 2",       "Detail 3"     ]   },   {     "subtopic": "Subtopic 2",     "details": [       "Detail 1",       "Detail 2",       "Detail 3"     ]   } ]

Now generate the flashcards: `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content;
    console.log("OpenAI response content:", generatedText);

    try {
      const flashcards = JSON.parse(generatedText);
      return flashcards;
    } catch (jsonError) {
      console.error("Invalid JSON response:", generatedText);
      throw new Error("Invalid JSON format");
    }
  } catch (apiError) {
    console.error("OpenAI API error:", apiError);
    throw new Error("Error generating flashcards.");
  }
}


async function generateFlashcards1(text1) {
  const prompt = ` Generate flashcards based on the provided texts. The output should be a JSON array where each flashcard is an object with "subtopic" and "details".

Text1: ${text1}

Example output format: [   {     "subtopic": "Subtopic 1",     "details": [       "Detail 1",       "Detail 2",       "Detail 3"     ]   },   {     "subtopic": "Subtopic 2",     "details": [       "Detail 1",       "Detail 2",       "Detail 3"     ]   } ]

Now generate the flashcards follonwing the format I have provided: `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
    });

    const generatedText = response.choices[0].message.content;
    console.log("OpenAI response content:", generatedText);

    try {
      const flashcards = JSON.parse(generatedText);
      return flashcards;
    } catch (jsonError) {
      console.error("Invalid JSON response:", generatedText);
      throw new Error("Invalid JSON format");
    }
  } catch (apiError) {
    console.error("OpenAI API error:", apiError);
    throw new Error("Error generating flashcards.");
  }
}

const getMissingTopics = async (text1, text2) => {
  const message = {
    role: "user",
    content: `Analyze the differences between the two texts. Identify and list the topics present in the first text but missing in the second text:\n\nText 1:\n"""${text1}"""\n\nText 2:\n"""${text2}"""\n\nMissing Topics:`,
  };

  const request = {
    model: "gpt-3.5-turbo",
    messages: [message],
    max_tokens: 1000,
  };

  try {
    const response = await openai.chat.completions.create(request);
    return response.choices[0].message.content;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(error.status);
      console.error(error.message);
      console.error(error.code);
      console.error(error.type);
    } else {
      console.log(error);
    }
    throw new Error(error);
  }
};

const generateQuiz = async (text1, text2) => {
  const message = {
    role: "user",
    content: `Generate a 10-question quiz based on the following two texts. Each question should have 4 options with one correct answer. The quiz should focus on topics present in the second text (Text 2) but missing or insufficiently covered in the first text (Text 1). Format the response as a JSON array where each object has a 'question', an 'options' array with 'text' and 'isCorrect' fields:\n\nText 1:\n"""${text1}"""\n\nText 2:\n"""${text2}"""\n\nQuiz:`,
  };

  const request = {
    model: "gpt-3.5-turbo",
    messages: [message],
    max_tokens: 3000,
  };

  try {
    const response = await openai.chat.completions.create(request);
    const quiz = JSON.parse(response.choices[0].message.content);
    return quiz;
  } catch (error) {
    console.error(error);
    throw new Error('Error generating quiz.');
  }
};

app.get("/", (req, res) => {
  res.json("Hello World!");
});

// Create a new test // Update the /api/createtest endpoint to include the isUploaded field
app.post("/api/createtest", async (req, res) => {
  try {
    const userId = req.body.uid;
    const userRef = doc(db, `users/${userId}`);
    const testsCollectionRef = collection(userRef, 'tests');
    const newTestDoc = await addDoc(testsCollectionRef, {
      createdAt: new Date(),
      missingTopics: [],
      flashcards: [],
      isUploaded: false,
    });

    res.json({ testId: newTestDoc.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while creating the test." });
  }
});

// Get all tests for a user
app.get("/api/tests/:uid", async (req, res) => {
  try {
    const userId = req.params.uid;
    const userRef = doc(db, `users/${userId}`);
    const testsCollectionRef = collection(userRef, 'tests');
    const testsSnapshot = await getDocs(testsCollectionRef);

    const tests = testsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ tests });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while fetching the tests." });
  }
});

app.post("/api/comparepdfs", type, async (req, res) => {
  try {
    const userId = req.body.uid;
    const testId = req.body.testId;
    const pdfFile1 = req.files.pdf1[0];
    const pdfFile2 = req.files.pdf2[0];

    const pdfExtract = new PDFExtract();
    const extractOptions = {
      firstPage: 1,
      lastPage: undefined,
      password: "",
      verbosity: -1,
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    };
    const data1 = await pdfExtract.extract(pdfFile1.path, extractOptions);
    const data2 = await pdfExtract.extract(pdfFile2.path, extractOptions);
    const pdfText1 = data1.pages.map((page) => page.content.map((item) => item.str).join(" ")).join(" ");
    const pdfText2 = data2.pages.map((page) => page.content.map((item) => item.str).join(" ")).join(" ");

    const missingTopics = await getMissingTopics(pdfText1, pdfText2);

    const userRef = doc(db, `users/${userId}`);
    const testRef = doc(userRef, `tests/${testId}`);
    await updateDoc(testRef, {
      missingTopics: missingTopics.split(',').map(topic => topic.trim()),
      isUploaded: true, // Set isUploaded to true after successful comparison
    });

    res.json({ missingTopics });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

app.post("/api/generatequiz", type, async (req, res) => {
  try {
    const pdfFile1 = req.files.pdf1[0];
    const pdfFile2 = req.files.pdf2[0];

    const pdfExtract = new PDFExtract();
    const extractOptions = {
      firstPage: 1,
      lastPage: undefined,
      password: "",
      verbosity: -1,
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    };

    const data1 = await pdfExtract.extract(pdfFile1.path, extractOptions);
    const data2 = await pdfExtract.extract(pdfFile2.path, extractOptions);

    const pdfText1 = data1.pages.map((page) => page.content.map((item) => item.str).join(" ")).join(" ");
    const pdfText2 = data2.pages.map((page) => page.content.map((item) => item.str).join(" ")).join(" ");

    if (pdfText1.length === 0 || pdfText2.length === 0) {
      res.status(400).json({ error: "Text could not be extracted from one or both PDFs" });
      return;
    }

    const quiz = await generateQuiz(pdfText1, pdfText2);
    res.json({ quiz });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while generating the quiz." });
  }
});

app.post('/api/generateflashcards', upload.fields([{ name: 'pdf1' }, { name: 'pdf2' }]), async (req, res) => {
  try {
    const userId = req.body.uid;
    const testId = req.body.testId;
    const pdfFile1 = req.files.pdf1[0];
    const pdfFile2 = req.files.pdf2[0];

    const pdfExtract = new PDFExtract();
    const extractOptions = {
      firstPage: 1,
      lastPage: undefined,
      password: "",
      verbosity: -1,
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    };

    const data1 = await pdfExtract.extract(pdfFile1.path, extractOptions);
    const data2 = await pdfExtract.extract(pdfFile2.path, extractOptions);

    const pdfText1 = data1.pages.map((page) => page.content.map((item) => item.str).join(" ")).join(" ");
const pdfText2 = data2.pages.map((page) => page.content.map((item) => item.str).join(" ")).join(" ");

if (pdfText1.length === 0 || pdfText2.length === 0) {
  return res.status(400).json({ error: 'Text could not be extracted from one or both PDFs' });
}

const flashcards = await generateFlashcards(pdfText1, pdfText2);

const userRef = doc(db, `users/${userId}`);
const testRef = doc(userRef, `tests/${testId}`);
await updateDoc(testRef, { flashcards });

res.json({ flashcards });
} catch (error) {
  console.error("Error in /api/generateflashcards:", error);
  res.status(500).json({ error: 'Internal Server Error', details: error.message });
}
});

// Get missing topics for a specific test
app.get("/api/missingtopics/:uid/:testId", async (req, res) => {
try {
  const userId = req.params.uid;
  const testId = req.params.testId;

  const userRef = doc(db, `users/${userId}`);
  const testRef = doc(userRef, `tests/${testId}`);
  const testDoc = await getDoc(testRef);

  if (testDoc.exists()) {
    const missingTopics = testDoc.data().missingTopics;
    res.json({ missingTopics });
  } else {
    res.status(404).json({ error: "Test document not found" });
  }
} catch (e) {
  console.error(e);
  res.status(500).json({ error: "An error occurred while fetching the missing topics." });
}
});

// Generate quiz based on missing topics
app.post("/api/generatequizfrommissingtopics", async (req, res) => {
try {
  const { missingTopics } = req.body;

  if (!missingTopics || missingTopics.length === 0) {
    return res.status(400).json({ error: "Missing topics not provided" });
  }

  const topicsText = missingTopics.join("\n\n");
  const quiz = await generateQuiz(topicsText, topicsText);
  res.json({ quiz });
} catch (e) {
  console.error(e);
  res.status(500).json({ error: "An error occurred while generating the quiz." });
}
});

// Generate flashcards based on missing topics
app.post("/api/generateflashcardsfromtopics", async (req, res) => {
try {
  const { missingTopics } = req.body;

  if (!missingTopics || missingTopics.length === 0) {
    return res.status(400).json({ error: "Missing topics not provided" });
  }

  const topicsText = missingTopics.join("\n\n");
  const flashcards = await generateFlashcards1(topicsText);
  res.json({ flashcards });
} catch (e) {
  console.error(e);
  res.status(500).json({ error: "An error occurred while generating the flashcards." });
}
});

app.post('/api/getsubtopic', async (req, res) => {
  const { question } = req.body;

  const prompt = `Determine the subtopic for the following question:\n\nQuestion: ${question}\n\nSubtopic:`;

  const request = {
    model: "gpt-3.5-turbo",
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 3000,
  };

  try {
    const response = await openai.chat.completions.create(request);
    const subtopic = response.choices[0].message.content.trim();
    res.json({ subtopic });
  } catch (error) {
    console.error("Error getting subtopic:", error);
    res.status(500).json({ error: "Error getting subtopic" });
  }
});

app.post("/results", async (req, res) => {
  try {
    const { userId, testId, results } = req.body;

    const userRef = doc(db, `users/${userId}`);
    const testRef = doc(userRef, `tests/${testId}`);
    const testDoc = await getDoc(testRef);

    if (!testDoc.exists()) {
      return res.status(404).json({ error: "Test document not found" });
    }

    let missingTopics = testDoc.data().missingTopics || [];

    // Function to find closely related topics using OpenAI API
    const findRelatedTopics = async (topic, topicsList) => {
      const message = {
        role: "user",
        content: `Find closely related topics to "${topic}" in the following list: [${topicsList.join(', ')}]`,
      };

      const request = {
        model: "gpt-3.5-turbo",
        messages: [message],
        max_tokens: 1000,
      };

      try {
        const response = await openai.chat.completions.create(request);
        const relatedTopics = response.choices[0].message.content.split(',').map(t => t.trim());
        return relatedTopics;
      } catch (error) {
        console.error("Error finding related topics:", error);
        return [];
      }
    };

    for (const result of results) {
      let subtopic = result.subtopic;

      // Fetch the subtopic if it's not provided or is unknown
      if (!subtopic || subtopic === "Unknown") {
        const response = await fetch('http://localhost:5001/api/getsubtopic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: result.question }),
        });
        const data = await response.json();
        subtopic = data.subtopic;
      }

      if (result.correct) {
        // Find closely related topics in missingTopics and remove them
        const relatedTopics = await findRelatedTopics(subtopic, missingTopics);
        missingTopics = missingTopics.filter(topic => !relatedTopics.includes(topic));
        console.log("removing: ", missingTopics);
      } else {
        // Add the subtopic to missingTopics if not already present
        if (!missingTopics.includes(subtopic)) {
          missingTopics.push(subtopic);
          console.log("pushing: ", missingTopics);
        }
      }
    }

    // Ensure missingTopics is a valid array of strings
    missingTopics = missingTopics
      .filter(topic => topic && typeof topic === 'string')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);

    // Update the test document with the new missingTopics
    await updateDoc(testRef, { missingTopics });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while processing the results." });
  }
});


const PORT = 5001;
app.listen(PORT, console.log(`Server started on port ${PORT}`));