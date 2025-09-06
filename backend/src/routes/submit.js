const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const {submitCode,runCode,debugProblem} = require("../controllers/userSubmission");

submitRouter.post("/submit/:id", userMiddleware, submitCode);
submitRouter.post("/run/:id",userMiddleware,runCode);
submitRouter.get("/debug/:id", debugProblem);

module.exports = submitRouter;