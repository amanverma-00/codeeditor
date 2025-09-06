const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Problem model
const Problem = require('./src/models/problem');

// Connect to MongoDB
const connectDB = require('./src/config/db');

// Function to read all JSON files from a directory recursively
const readProblemFiles = (dirPath) => {
  let problems = [];
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively read subdirectories
      problems = problems.concat(readProblemFiles(fullPath));
    } else if (path.extname(item) === '.json') {
      // Read JSON file
      try {
        const problemData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        // Validate and clean hiddenTestCases
        if (problemData.hiddenTestCases && Array.isArray(problemData.hiddenTestCases)) {
          problemData.hiddenTestCases = problemData.hiddenTestCases.filter(testCase => {
            return testCase.input && testCase.output && testCase.output.trim() !== '';
          });
        }
        
        // Validate and clean visibleTestCases
        if (problemData.visibleTestCases && Array.isArray(problemData.visibleTestCases)) {
          problemData.visibleTestCases = problemData.visibleTestCases.filter(testCase => {
            return testCase.input && testCase.output && testCase.output.trim() !== '';
          });
        }
        
        problems.push({
          ...problemData,
          // Add a placeholder problemCreator since it's required
          problemCreator: '000000000000000000000000'
        });
      } catch (err) {
        console.error(`Error reading ${fullPath}:`, err.message);
      }
    }
  }
  
  return problems;
};

// Function to load problems into database
const loadProblems = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Read all problem files
    const problemsDir = path.join(__dirname, 'problems');
    const problems = readProblemFiles(problemsDir);
    
    console.log(`Found ${problems.length} problem files`);

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    // Insert problems into database
    if (problems.length > 0) {
      const result = await Problem.insertMany(problems);
      console.log(`Successfully loaded ${result.length} problems into the database`);
    } else {
      console.log('No problems found to load');
    }

    console.log('Problem loading completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error loading problems:', err);
    process.exit(1);
  }
};

// Run the loading function
loadProblems();