const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");

const createProblem = async (req,res)=>{
   
    const {title,description,difficulty,tags,
        visibleTestCases,hiddenTestCases,startCode,
        referenceSolution, problemCreator
    } = req.body;


    try{

      console.log('🔍 Backend received data:');
      console.log('  - referenceSolution:', typeof referenceSolution, Array.isArray(referenceSolution), referenceSolution?.length);
      console.log('  - visibleTestCases:', typeof visibleTestCases, Array.isArray(visibleTestCases), visibleTestCases?.length);
      console.log('  - hiddenTestCases:', typeof hiddenTestCases, Array.isArray(hiddenTestCases), hiddenTestCases?.length);
      console.log('  - startCode:', typeof startCode, Array.isArray(startCode), startCode?.length);

      if (!referenceSolution || !Array.isArray(referenceSolution)) {
        return res.status(400).send("Reference solution is required and must be an array");
      }

      if (!visibleTestCases || !Array.isArray(visibleTestCases)) {
        return res.status(400).send("Visible test cases are required and must be an array");
      }

      for(const {language,completeCode} of referenceSolution){
         
        const languageId = getLanguageById(language);

        const submissions = visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));


        const submitResult = await submitBatch(submissions);

        if (!submitResult || !Array.isArray(submitResult)) {
          return res.status(400).send("Failed to submit batch - invalid response from judge");
        }

        const resultToken = submitResult.map((value)=> value.token);
        
       const testResult = await submitToken(resultToken);

       console.log('🧪 Test Results:', JSON.stringify(testResult, null, 2));

       for(const test of testResult){
        console.log(`📊 Test Status: ${test.status_id}, Expected: 3 (Accepted)`);
        if(test.status_id != 3){
          console.error('❌ Reference solution validation failed:', {
            status_id: test.status_id,
            status_description: test.status?.description || 'Unknown',
            stdout: test.stdout,
            stderr: test.stderr,
            expected_output: test.expected_output,
            language: language
          });

          return res.status(400).send(`Reference solution validation failed. Please check:
1. Test case input format (use actual stdin input, not descriptions)
2. Reference solutions produce correct output for test cases
3. Input format: "${test.stdin}" not "arr = [1,3,5,7,9] key = 5"
See TEST_CASE_FORMAT_GUIDE.md for details.`);
        }
       }

      }

    const userProblem =  await Problem.create({
        ...req.body,
        problemCreator: req.result._id
      });

      res.status(201).send("Problem Saved Successfully");
    }
    catch(err){
        res.status(400).send("Error: "+err);
    }
}

const updateProblem = async (req,res)=>{
    
  const {id} = req.params;
  const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,
    referenceSolution, problemCreator
   } = req.body;

  try{

     if(!id){
      return res.status(400).send("Missing ID Field");
     }

    const DsaProblem =  await Problem.findById(id);
    if(!DsaProblem)
    {
      return res.status(404).send("ID is not persent in server");
    }
      
    for(const {language,completeCode} of referenceSolution){
         

      // source_code:
      // language_id:
      // stdin: 
      // expectedOutput:

      const languageId = getLanguageById(language);
        
      // I am creating Batch submission
      const submissions = visibleTestCases.map((testcase)=>({
          source_code:completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output
      }));


      const submitResult = await submitBatch(submissions);
      // console.log(submitResult);

      const resultToken = submitResult.map((value)=> value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
      
     const testResult = await submitToken(resultToken);

    //  console.log(testResult);

     for(const test of testResult){
      if(test.status_id!=3){
       return res.status(400).send("Error Occured");
      }
     }

    }


  const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
   
  res.status(200).send(newProblem);
  }
  catch(err){
      res.status(500).send("Error: "+err);
  }
}

const deleteProblem = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

   const deletedProblem = await Problem.findByIdAndDelete(id);

   if(!deletedProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send("Successfully Deleted");
  }
  catch(err){
     
    res.status(500).send("Error: "+err);
  }
}


const getProblemById = async(req,res)=>{

  const {id} = req.params;
    try{
       
      if(!id)
        return res.status(400).send("ID is Missing");
  
      const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');
     
      // video ka jo bhi url wagera le aao
  
     if(!getProblem)
      return res.status(404).send("Problem is Missing");
  
     const videos = await SolutionVideo.findOne({problemId:id});
  
     if(videos){   
      
     const responseData = {
      ...getProblem.toObject(),
      secureUrl:videos.secureUrl,
      thumbnailUrl : videos.thumbnailUrl,
      duration : videos.duration,
     } 
    
     return res.status(200).send(responseData);
     }
      
     res.status(200).send(getProblem);
  
    }
    catch(err){
      res.status(500).send("Error: "+err);
    }
}

const getAllProblem = async(_,res)=>{

   try{
       
      const getProblem = await Problem.find({}).select('_id title difficulty tags');
  
     if(getProblem.length==0)
      return res.status(404).send("Problem is Missing");
  
  
     res.status(200).send(getProblem);
    }
    catch(err){
      res.status(500).send("Error: "+err);
    }
}


const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}

const submittedProblem = async(req,res)=>{

  try{
     
    const userId = req.result._id;
    const problemId = req.params.pid;

   const ans = await Submission.find({userId,problemId});
  
  if(ans.length==0)
    res.status(200).send("No Submission is persent");

  res.status(200).send(ans);

  }
  catch(err){
     res.status(500).send("Internal Server Error");
  }
}



module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem};


