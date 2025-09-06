const mongoose = require('mongoose');
const User = require('./src/models/user');
require('dotenv').config();

const initializeUserStreaks = async () => {
    try {
        
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log('Connected to MongoDB');

        const usersToUpdate = await User.find({
            $or: [
                { streakData: { $exists: false } },
                { streakData: null }
            ]
        });

        console.log(`Found ${usersToUpdate.length} users to initialize`);

        for (const user of usersToUpdate) {
            user.streakData = {
                currentStreak: 0,
                longestStreak: 0,
                lastSubmissionDate: null,
                streakDates: []
            };

            if (!user.profileStats) {
                user.profileStats = {
                    easyProblems: 0,
                    mediumProblems: 0,
                    hardProblems: 0,
                    totalSubmissions: 0,
                    acceptedSubmissions: 0
                };
            }

            await user.save();
            console.log(`Initialized streak data for user: ${user.firstName} ${user.lastName}`);
        }

        console.log('Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

initializeUserStreaks();