const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const {updateStreak} = require("../utils/streakUtility");

const submitCode = async (req,res)=>{

    console.log('=== SUBMIT CODE DEBUG ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('User from middleware:', req.result ? 'Present' : 'Missing');
    console.log('Params:', req.params);
    console.log('========================');
    
    try{
      
       const userId = req.result._id;
       const problemId = req.params.id;

       if (!req.body || typeof req.body !== 'object') {
         console.log('Request body is invalid:', req.body);
         return res.status(400).json({
           error: "Invalid request body",
           message: "Request body must be a valid JSON object"
         });
       }
       
       const { code, language } = req.body;
       let processedLanguage = language;

       if(!userId || !code || !problemId || !processedLanguage) {
         console.log('Missing fields:', { 
           userId: !!userId, 
           code: !!code, 
           problemId: !!problemId, 
           language: !!language 
         });
         return res.status(400).json({
           error: "Missing required fields",
           required: ["code", "language"],
           received: { 
             code: !!code, 
             language: !!processedLanguage,
             bodyReceived: !!req.body
           }
         });
       }

      if(processedLanguage === 'cpp' || processedLanguage === 'C++') {
        processedLanguage = 'c++';
      } else if(processedLanguage === 'javascript' || processedLanguage === 'JavaScript') {
        processedLanguage = 'javascript';
      } else if(processedLanguage === 'java' || processedLanguage === 'Java') {
        processedLanguage = 'java';
      }
      
      console.log('Processing language:', processedLanguage);

       const problem =  await Problem.findById(problemId);

    const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language: processedLanguage,
          status:'pending',
          testCasesTotal:problem.hiddenTestCases.length
     });

    const languageId = getLanguageById(processedLanguage);
   
    const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions);
    
    const resultToken = submitResult.map((value)=> value.token);

    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for(const test of testResult){
        console.log('=== DEBUG TEST RESULT ===');
        console.log('Status ID:', test.status_id);
        console.log('Status:', test.status?.description);
        console.log('stdout (raw):', JSON.stringify(test.stdout));
        console.log('stderr:', test.stderr);
        console.log('expected_output:', test.expected_output);
        console.log('Judge0 comparison result: status_id =', test.status_id);
        console.log('=========================');

        if(test.status_id == 3){
           
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          
          if(test.status_id == 4){
            status = 'wrong'  
            errorMessage = `Wrong Answer: Expected '${test.expected_output}' but got '${test.stdout?.trim() || 'null'}'`
          }
          else if(test.status_id == 5){
            status = 'error'
            errorMessage = 'Time Limit Exceeded'
          }
          else if(test.status_id == 6){
            status = 'error'
            errorMessage = test.compile_output || 'Compilation Error'
          }
          else{
            status = 'error'
            errorMessage = test.stderr || test.stdout || `Execution failed with status ${test.status_id}`
          }
        }
    }

    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;
    submittedResult.testCasesTotal = problem.hiddenTestCases.length;

    await submittedResult.save();

    const user = req.result;

    if(status === 'accepted' && !user.problemSolved.includes(problemId)){
      user.problemSolved.push(problemId);

      if(!user.profileStats) {
        user.profileStats = {
          easyProblems: 0,
          mediumProblems: 0,
          hardProblems: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0
        };
      }

      if(problem.difficulty === 'easy') {
        user.profileStats.easyProblems += 1;
      } else if(problem.difficulty === 'medium') {
        user.profileStats.mediumProblems += 1;
      } else if(problem.difficulty === 'hard') {
        user.profileStats.hardProblems += 1;
      }
    }

    if(!user.profileStats) {
      user.profileStats = {
        easyProblems: 0,
        mediumProblems: 0,
        hardProblems: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0
      };
    }
    
    user.profileStats.totalSubmissions += 1;
    if(status === 'accepted') {
      user.profileStats.acceptedSubmissions += 1;

      await updateStreak(user);
    }
    
    await user.save();
    
    const accepted = (status == 'accepted')
    res.status(201).json({
      accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });
       
    }
    catch(err){
      console.error('Submit Code Error:', err);
      res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
}

const runCode = async(req,res)=>{

     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      if (!req.body || typeof req.body !== 'object') {
        console.log('Run Code - Request body is invalid:', req.body);
        return res.status(400).json({
          error: "Invalid request body",
          message: "Request body must be a valid JSON object"
        });
      }
      
      const { code, language } = req.body;
      let processedLanguage = language;

     if(!userId||!code||!problemId||!processedLanguage) {
       console.log('Run Code - Missing fields:', { userId: !!userId, code: !!code, problemId: !!problemId, language: !!language });
       return res.status(400).json({
         error: "Some fields missing",
         required: ["code", "language"],
         received: { code: !!code, language: !!language }
       });
     }

      const problem =  await Problem.findById(problemId);
      
      if (!problem) {
        console.log('Problem not found:', problemId);
        return res.status(404).json({
          error: "Problem not found",
          message: "The specified problem does not exist"
        });
      }

      if(processedLanguage === 'cpp' || processedLanguage === 'C++') {
        processedLanguage = 'c++';
      } else if(processedLanguage === 'javascript' || processedLanguage === 'JavaScript') {
        processedLanguage = 'javascript';
      } else if(processedLanguage === 'java' || processedLanguage === 'Java') {
        processedLanguage = 'java';
      }
        
      console.log('Run Code - Processing language:', processedLanguage);

   const languageId = getLanguageById(processedLanguage);
   
   if (!languageId) {
     console.log('Invalid language ID for:', processedLanguage);
     return res.status(400).json({
       error: "Invalid language",
       message: `Language '${processedLanguage}' is not supported`,
       supportedLanguages: ['c++', 'java', 'javascript']
     });
   }
   
   if (!problem.visibleTestCases || !Array.isArray(problem.visibleTestCases) || problem.visibleTestCases.length === 0) {
     console.log('No visible test cases found for problem:', problemId);
     return res.status(400).json({
       error: "No test cases available",
       message: "This problem has no visible test cases to run"
     });
   }
   
   console.log('Run Code - Test cases count:', problem.visibleTestCases.length);
   console.log('Run Code - Language ID:', languageId);

   const submissions = problem.visibleTestCases.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));

   console.log('Run Code - Submitting to Judge0:', submissions.length, 'submissions');
   
   const submitResult = await submitBatch(submissions);
   
   if (!submitResult) {
     console.log('Judge0 submitBatch returned null/undefined');
     return res.status(500).json({
       error: "Judge0 API Error",
       message: "Failed to submit code to execution service"
     });
   }
   
   console.log('Run Code - Submit result received:', submitResult);
   
   const resultToken = submitResult.map((value)=> value.token);
   
   if (!resultToken || resultToken.length === 0) {
     console.log('No tokens received from Judge0');
     return res.status(500).json({
       error: "Judge0 API Error", 
       message: "No execution tokens received"
     });
   }
   
   console.log('Run Code - Tokens:', resultToken);

   const testResult = await submitToken(resultToken);
   
   if (!testResult || !Array.isArray(testResult)) {
     console.log('Invalid test result from Judge0:', testResult);
     return res.status(500).json({
       error: "Judge0 API Error",
       message: "Failed to get execution results"
     });
   }
   
   console.log('Run Code - Test result received:', testResult.length, 'results');

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for(const test of testResult){
        console.log('=== RUN CODE DEBUG ===');
        console.log('Status ID:', test.status_id);
        console.log('Status:', test.status?.description);
        console.log('stdout:', JSON.stringify(test.stdout));
        console.log('stderr:', test.stderr);
        console.log('======================');
        
        if(test.status_id==3){
           
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          
          status = false
          if(test.status_id==4){
            errorMessage = `Wrong Answer: Expected output doesn't match`
          }
          else if(test.status_id==5){
            errorMessage = 'Time Limit Exceeded'
          }
          else if(test.status_id==6){
            errorMessage = test.compile_output || 'Compilation Error'
          }
          else{
            errorMessage = test.stderr || test.stdout || `Execution failed with status ${test.status_id}`
          }
        }
    }

   res.status(201).json({
    success:status,
    testCases: testResult,
    runtime,
    memory
   });
      
   }
   catch(err){
     console.error('Run Code Error:', err);
     res.status(500).json({
       error: "Internal Server Error",
       message: err.message,
       details: process.env.NODE_ENV === 'development' ? err.stack : undefined
     });
   }
}

const debugProblem = async(req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    return res.status(200).json({
      problemId: problem._id,
      title: problem.title,
      startCodeLanguages: problem.startCode ? problem.startCode.map(sc => ({
        language: sc.language,
        hasInitialCode: !!sc.initialCode,
        codeLength: sc.initialCode ? sc.initialCode.length : 0
      })) : [],
      visibleTestCasesCount: problem.visibleTestCases ? problem.visibleTestCases.length : 0,
      hiddenTestCasesCount: problem.hiddenTestCases ? problem.hiddenTestCases.length : 0
    });
    
  } catch (error) {
    console.error('Debug Problem Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {submitCode,runCode,debugProblem};