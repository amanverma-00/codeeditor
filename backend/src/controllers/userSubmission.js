const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");

// Constants for validation
const MAX_CODE_LENGTH = 50000; // 50KB
const SUPPORTED_LANGUAGES = ['javascript', 'c++', 'java'];

// Judge0 status codes
const JUDGE0_STATUS = {
    IN_QUEUE: 1,
    PROCESSING: 2,
    ACCEPTED: 3,
    WRONG_ANSWER: 4,
    TIME_LIMIT_EXCEEDED: 5,
    COMPILATION_ERROR: 6,
    RUNTIME_ERROR_SIGSEGV: 7,
    RUNTIME_ERROR_SIGXFSZ: 8,
    RUNTIME_ERROR_SIGFPE: 9,
    RUNTIME_ERROR_SIGABRT: 10,
    RUNTIME_ERROR_NZEC: 11,
    RUNTIME_ERROR_OTHER: 12,
    INTERNAL_ERROR: 13,
    EXEC_FORMAT_ERROR: 14
};

const submitCode = async (req,res)=>{
    try{
       const userId = req.result._id;
       const problemId = req.params.id;
       let {code, language} = req.body;

       // Input validation
       if(!userId || !code || !problemId || !language) {
           return res.status(400).json({ message: "Missing required fields" });
       }

       // Validate ObjectId format
       if(!problemId.match(/^[0-9a-fA-F]{24}$/)) {
           return res.status(400).json({ message: "Invalid problem ID" });
       }

       // Validate code length
       if(code.length > MAX_CODE_LENGTH) {
           return res.status(400).json({ message: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters` });
       }

       // Normalize language
       if(language === 'cpp') language = 'c++';

       // Validate language
       if(!SUPPORTED_LANGUAGES.includes(language)) {
           return res.status(400).json({ message: "Unsupported language", supported: SUPPORTED_LANGUAGES });
       }
      
       // Fetch the problem from database
       const problem = await Problem.findById(problemId);
       
       if (!problem) {
           return res.status(404).json({ message: "Problem not found" });
       }

       if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
           return res.status(400).json({ message: "No test cases available for this problem" });
       }

       // Create submission record
       const submittedResult = await Submission.create({
           userId,
           problemId,
           code,
           language,
           status: 'pending',
           testCasesTotal: problem.hiddenTestCases.length
       });

       // Submit to Judge0
       const languageId = getLanguageById(language);
       
       if (!languageId) {
           submittedResult.status = 'error';
           submittedResult.errorMessage = 'Language not supported by judge';
           await submittedResult.save();
           return res.status(400).json({ message: "Language configuration error" });
       }

       const submissions = problem.hiddenTestCases.map((testcase) => ({
           source_code: code,
           language_id: languageId,
           stdin: testcase.input,
           expected_output: testcase.output
       }));

       let submitResult, testResult;
       
       try {
           submitResult = await submitBatch(submissions);
           const resultToken = submitResult.map((value) => value.token);
           testResult = await submitToken(resultToken);
       } catch (judgeError) {
           console.error('Judge0 error:', judgeError);
           submittedResult.status = 'error';
           submittedResult.errorMessage = 'Failed to execute code on judge server';
           await submittedResult.save();
           return res.status(503).json({ message: "Code execution service unavailable" });
       }

       // Process test results
       let testCasesPassed = 0;
       let totalRuntime = 0;
       let totalMemory = 0;
       let status = 'accepted';
       let errorMessage = null;

       for(const test of testResult) {
           if(test.status_id === JUDGE0_STATUS.ACCEPTED) {
               testCasesPassed++;
               totalRuntime += parseFloat(test.time) || 0;
               totalMemory += parseInt(test.memory) || 0;
           } else {
               // Determine error type
               if(test.status_id === JUDGE0_STATUS.COMPILATION_ERROR) {
                   status = 'error';
                   errorMessage = test.compile_output || test.stderr || 'Compilation failed';
               } else if(test.status_id === JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV || 
                        test.status_id === JUDGE0_STATUS.RUNTIME_ERROR_SIGXFSZ ||
                        test.status_id === JUDGE0_STATUS.RUNTIME_ERROR_SIGFPE ||
                        test.status_id === JUDGE0_STATUS.RUNTIME_ERROR_SIGABRT ||
                        test.status_id === JUDGE0_STATUS.RUNTIME_ERROR_NZEC ||
                        test.status_id === JUDGE0_STATUS.RUNTIME_ERROR_OTHER) {
                   status = 'error';
                   errorMessage = test.stderr || 'Runtime error';
               } else if(test.status_id === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED) {
                   status = 'error';
                   errorMessage = 'Time limit exceeded';
               } else {
                   status = 'wrong';
                   errorMessage = test.stderr || 'Wrong answer';
               }
               break; // Stop on first failure
           }
       }

       // Calculate averages
       const testCaseCount = testResult.length;
       const avgRuntime = testCaseCount > 0 ? totalRuntime / testCaseCount : 0;
       const avgMemory = testCaseCount > 0 ? totalMemory / testCaseCount : 0;

       // Update submission in database
       submittedResult.status = status;
       submittedResult.testCasesPassed = testCasesPassed;
       submittedResult.errorMessage = errorMessage;
       submittedResult.runtime = avgRuntime;
       submittedResult.memory = avgMemory;
       await submittedResult.save();

       // Only add to problemSolved if ALL test cases passed
       if(status === 'accepted' && !req.result.problemSolved.includes(problemId)) {
           req.result.problemSolved.push(problemId);
           await req.result.save();
       }

       const accepted = (status === 'accepted');
       
       res.status(201).json({
           accepted,
           totalTestCases: submittedResult.testCasesTotal,
           passedTestCases: testCasesPassed,
           runtime: parseFloat(avgRuntime.toFixed(3)),
           memory: Math.round(avgMemory),
           status,
           errorMessage: accepted ? null : errorMessage
       });
       
    } catch(err) {
        console.error('Submit code error:', err);
        res.status(500).json({ 
            message: "Failed to submit code",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}


const runCode = async(req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;
        let {code, language} = req.body;

        // Input validation
        if(!userId || !code || !problemId || !language) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate ObjectId format
        if(!problemId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid problem ID" });
        }

        // Validate code length
        if(code.length > MAX_CODE_LENGTH) {
            return res.status(400).json({ message: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters` });
        }

        // Normalize language
        if(language === 'cpp') language = 'c++';

        // Validate language
        if(!SUPPORTED_LANGUAGES.includes(language)) {
            return res.status(400).json({ message: "Unsupported language", supported: SUPPORTED_LANGUAGES });
        }

        // Fetch the problem from database
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (!problem.visibleTestCases || problem.visibleTestCases.length === 0) {
            return res.status(400).json({ message: "No test cases found for this problem" });
        }

        // Submit to Judge0
        const languageId = getLanguageById(language);

        if (!languageId) {
            return res.status(400).json({ message: "Language not supported by judge" });
        }

        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        let submitResult, testResult;

        try {
            submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            testResult = await submitToken(resultToken);
        } catch (judgeError) {
            console.error('Judge0 error:', judgeError);
            return res.status(503).json({ message: "Code execution service unavailable" });
        }

        // Process test results
        let testCasesPassed = 0;
        let totalRuntime = 0;
        let totalMemory = 0;
        let success = true;
        let errorMessage = null;

        const processedResults = testResult.map((test, index) => {
            const passed = test.status_id === JUDGE0_STATUS.ACCEPTED;
            
            if(passed) {
                testCasesPassed++;
                totalRuntime += parseFloat(test.time) || 0;
                totalMemory += parseInt(test.memory) || 0;
            } else {
                success = false;
                if(!errorMessage) {
                    if(test.status_id === JUDGE0_STATUS.COMPILATION_ERROR) {
                        errorMessage = test.compile_output || test.stderr || 'Compilation failed';
                    } else if(test.status_id === JUDGE0_STATUS.TIME_LIMIT_EXCEEDED) {
                        errorMessage = 'Time limit exceeded';
                    } else if(test.status_id >= JUDGE0_STATUS.RUNTIME_ERROR_SIGSEGV && 
                             test.status_id <= JUDGE0_STATUS.RUNTIME_ERROR_OTHER) {
                        errorMessage = test.stderr || 'Runtime error';
                    } else {
                        errorMessage = 'Wrong answer';
                    }
                }
            }

            return {
                testCase: index + 1,
                input: problem.visibleTestCases[index].input,
                expectedOutput: problem.visibleTestCases[index].output,
                actualOutput: test.stdout || '',
                passed,
                runtime: parseFloat(test.time) || 0,
                memory: parseInt(test.memory) || 0,
                error: passed ? null : (test.stderr || test.compile_output || 'Wrong answer')
            };
        });

        const testCaseCount = testResult.length;
        const avgRuntime = testCaseCount > 0 ? totalRuntime / testCaseCount : 0;
        const avgMemory = testCaseCount > 0 ? totalMemory / testCaseCount : 0;

        res.status(200).json({
            success,
            testCasesPassed,
            totalTestCases: testCaseCount,
            testCases: processedResults,
            runtime: parseFloat(avgRuntime.toFixed(3)),
            memory: Math.round(avgMemory),
            errorMessage: success ? null : errorMessage
        });
      
    } catch(err) {
        console.error('Run code error:', err);
        res.status(500).json({ 
            message: "Failed to run code",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

module.exports = {submitCode, runCode};

