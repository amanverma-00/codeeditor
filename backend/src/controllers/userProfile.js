const User = require("../models/user");
const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {calculateStreak, getStreakCalendar} = require("../utils/streakUtility");

const getUserProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId)
            .populate({
                path: 'problemSolved',
                select: 'title difficulty tags'
            })
            .select('-password');

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const totalProblems = await Problem.countDocuments();
        const easyProblems = await Problem.countDocuments({ difficulty: 'easy' });
        const mediumProblems = await Problem.countDocuments({ difficulty: 'medium' });
        const hardProblems = await Problem.countDocuments({ difficulty: 'hard' });

        const recentSubmissions = await Submission.find({
            userId: userId,
            status: 'accepted'
        })
        .populate('problemId', 'title difficulty tags')
        .sort({ createdAt: -1 })
        .limit(5);

        const totalSubmissions = await Submission.countDocuments({ userId });
        const acceptedSubmissions = await Submission.countDocuments({ 
            userId, 
            status: 'accepted' 
        });

        const solvedByDifficulty = {
            easy: 0,
            medium: 0,
            hard: 0
        };

        if (user.problemSolved && Array.isArray(user.problemSolved)) {
            user.problemSolved.forEach(problem => {
                if (problem && problem.difficulty) {
                    solvedByDifficulty[problem.difficulty]++;
                }
            });
        }

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        let dailySubmissions = [];
        try {
            dailySubmissions = await Submission.aggregate([
                {
                    $match: {
                        userId: userId,
                        status: 'accepted',
                        createdAt: { $gte: oneYearAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);
        } catch (aggError) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Aggregation error:', aggError);
            }
            dailySubmissions = [];
        }

        const submissionMap = {};
        dailySubmissions.forEach(day => {
            submissionMap[day._id] = day.count;
        });

        const contributionData = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            contributionData.push({
                date: dateString,
                count: submissionMap[dateString] || 0
            });
        }

        let streakInfo, streakCalendar;
        try {
            streakInfo = calculateStreak(user);
            streakCalendar = getStreakCalendar(user, 30);
        } catch (streakError) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Streak calculation error:', streakError);
            }
            streakInfo = { currentStreak: 0, longestStreak: 0, lastSubmissionDate: null };
            streakCalendar = [];
        }

        const profileData = {
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName || '',
                emailId: user.emailId,
                bio: user.bio || '',
                location: user.location || '',
                username: user.username || user.firstName.toLowerCase(),
                linkedinProfile: user.linkedinProfile || '',
                githubProfile: user.githubProfile || '',
                contestRating: user.contestRating || 1200,
                role: user.role
            },
            stats: {
                totalProblems,
                problemsSolved: user.problemSolved?.length || 0,
                solvedByDifficulty,
                totalSubmissions,
                acceptedSubmissions,
                acceptanceRate: totalSubmissions > 0 ? 
                    ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : '0.0',
                problemCounts: {
                    easy: easyProblems,
                    medium: mediumProblems,
                    hard: hardProblems
                },
                streak: {
                    currentStreak: streakInfo.currentStreak,
                    longestStreak: streakInfo.longestStreak,
                    lastSubmissionDate: streakInfo.lastSubmissionDate
                }
            },
            recentSubmissions: recentSubmissions.map(sub => ({
                problemId: sub.problemId?._id || null,
                problemTitle: sub.problemId?.title || 'Unknown Problem',
                difficulty: sub.problemId?.difficulty || 'unknown',
                tags: sub.problemId?.tags || [],
                submittedAt: sub.createdAt,
                language: sub.language
            })),
            contributionData,
            streakCalendar
        };

        res.status(200).json(profileData);

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching user profile:', error);
        }
        res.status(500).json({ 
            error: "Internal server error",
            message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        const { bio, location, username, linkedinProfile, githubProfile } = req.body;

        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (username !== undefined) updateData.username = username;
        if (linkedinProfile !== undefined) updateData.linkedinProfile = linkedinProfile;
        if (githubProfile !== undefined) updateData.githubProfile = githubProfile;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, select: '-password' }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUserStreak = async (req, res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId).select('streakData');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const streakInfo = calculateStreak(user);
        const streakCalendar = getStreakCalendar(user, 30);

        res.status(200).json({
            currentStreak: streakInfo.currentStreak,
            longestStreak: streakInfo.longestStreak,
            lastSubmissionDate: streakInfo.lastSubmissionDate,
            streakCalendar
        });
    } catch (error) {
        console.error('Error fetching user streak:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserStreak
};