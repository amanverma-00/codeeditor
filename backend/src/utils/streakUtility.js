const calculateStreak = (user) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!user.streakData || !user.streakData.lastSubmissionDate) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastSubmissionDate: null
        };
    }

    const lastSubmission = new Date(user.streakData.lastSubmissionDate);
    lastSubmission.setHours(0, 0, 0, 0);
    
    const daysDifference = Math.floor((today - lastSubmission) / (1000 * 60 * 60 * 24));

    if (daysDifference <= 1) {
        return {
            currentStreak: user.streakData.currentStreak || 0,
            longestStreak: user.streakData.longestStreak || 0,
            lastSubmissionDate: user.streakData.lastSubmissionDate
        };
    }

    return {
        currentStreak: 0,
        longestStreak: user.streakData.longestStreak || 0,
        lastSubmissionDate: user.streakData.lastSubmissionDate
    };
};

const updateStreak = async (user) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.streakData) {
        user.streakData = {
            currentStreak: 1,
            longestStreak: 1,
            lastSubmissionDate: today,
            streakDates: [today]
        };
        return user.streakData;
    }

    const lastSubmission = user.streakData.lastSubmissionDate ? 
        new Date(user.streakData.lastSubmissionDate) : null;
    
    if (lastSubmission) {
        lastSubmission.setHours(0, 0, 0, 0);
    }

    const todayString = today.toISOString().split('T')[0];
    const lastSubmissionString = lastSubmission ? lastSubmission.toISOString().split('T')[0] : null;

    // Check if already solved a problem today
    if (lastSubmissionString === todayString) {
        // Already solved today, don't increment streak
        return user.streakData;
    }

    const daysDifference = lastSubmission ? 
        Math.floor((today - lastSubmission) / (1000 * 60 * 60 * 24)) : null;

    // First problem ever or solved yesterday (consecutive day)
    if (!lastSubmission || daysDifference === 1) {
        user.streakData.currentStreak = (user.streakData.currentStreak || 0) + 1;
    } 
    // Streak broken (more than 1 day gap)
    else if (daysDifference > 1) {
        user.streakData.currentStreak = 1;
    }

    // Update longest streak if current is higher
    if (user.streakData.currentStreak > (user.streakData.longestStreak || 0)) {
        user.streakData.longestStreak = user.streakData.currentStreak;
    }

    // Update last submission date
    user.streakData.lastSubmissionDate = today;

    // Add to streak dates if not already present
    if (!user.streakData.streakDates) {
        user.streakData.streakDates = [];
    }
    
    if (!user.streakData.streakDates.some(date => 
        new Date(date).toISOString().split('T')[0] === todayString
    )) {
        user.streakData.streakDates.push(today);
    }

    return user.streakData;
};

const getStreakCalendar = (user, days = 30) => {
    const calendar = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dateString = date.toISOString().split('T')[0];
        const hasSubmission = user.streakData?.streakDates?.some(streakDate => 
            new Date(streakDate).toISOString().split('T')[0] === dateString
        ) || false;
        
        calendar.push({
            date: dateString,
            hasSubmission,
            dayOfWeek: date.getDay(),
            dayOfMonth: date.getDate()
        });
    }
    
    return calendar;
};

module.exports = {
    calculateStreak,
    updateStreak,
    getStreakCalendar
};