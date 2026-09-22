const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");
const toast = document.getElementById("toast");


function showToast(message) {
    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 2200);
}


/* MOBILE MENU */

menuButton.addEventListener("click", function () {
    mainNav.classList.toggle("open");

    menuButton.setAttribute(
        "aria-expanded",
        mainNav.classList.contains("open").toString()
    );
});


document.querySelectorAll(".main-nav a").forEach(function (link) {

    link.addEventListener("click", function () {
        mainNav.classList.remove("open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    });

});


/* USER DATA */

function createDefaultUser() {
    return {
        fullName: "Learner",
        firstName: "Learner",
        email: "",
        streak: 0,
        xp: 0,
        lessonsCompleted: 0,

        weeklyActivity: [
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ],

        completedLessons: []
    };
}


function getUser() {
    const savedUser =
        localStorage.getItem("codexpertUser");

    if (!savedUser) {
        return createDefaultUser();
    }

    try {
        const saved =
            JSON.parse(savedUser);

        const user =
            createDefaultUser();

        user.fullName =
            saved.fullName ||
            user.fullName;

        user.firstName =
            saved.firstName ||
            user.fullName.split(/\s+/)[0] ||
            "Learner";

        user.email =
            saved.email || "";

        user.streak =
            Math.max(
                Number(saved.streak) || 0,
                0
            );

        user.xp =
            Math.max(
                Number(saved.xp) || 0,
                0
            );

        user.lessonsCompleted =
            Math.max(
                Number(saved.lessonsCompleted) || 0,
                0
            );

        if (
            Array.isArray(saved.weeklyActivity) &&
            saved.weeklyActivity.length === 7
        ) {
            user.weeklyActivity =
                saved.weeklyActivity.map(Boolean);
        }

        if (Array.isArray(saved.completedLessons)) {
            user.completedLessons =
                saved.completedLessons;
        }

        return user;

    } catch (error) {
        return createDefaultUser();
    }
}


function saveUser() {
    localStorage.setItem(
        "codexpertUser",
        JSON.stringify(user)
    );
}


let user = getUser();


/* DEMO LESSONS */

const lessons = [
    {
        id: 1,
        name: "Getting Started",
        xp: 100
    },

    {
        id: 2,
        name: "Variables & Data Types",
        xp: 120
    },

    {
        id: 3,
        name: "Control Flow: if/else",
        xp: 150
    },

    {
        id: 4,
        name: "Loops: for & while",
        xp: 180
    }
];


/* ELEMENTS */

const welcomeName =
    document.getElementById("welcomeName");

const welcomeMessage =
    document.getElementById("welcomeMessage");

const profileInitial =
    document.getElementById("profileInitial");

const topStreak =
    document.getElementById("topStreak");

const topXp =
    document.getElementById("topXp");

const streakValue =
    document.getElementById("streakValue");

const xpValue =
    document.getElementById("xpValue");

const levelValue =
    document.getElementById("levelValue");

const lessonsValue =
    document.getElementById("lessonsValue");

const levelHeading =
    document.getElementById("levelHeading");

const levelXpText =
    document.getElementById("levelXpText");

const levelPercentage =
    document.getElementById("levelPercentage");

const levelProgress =
    document.getElementById("levelProgress");

const levelMessage =
    document.getElementById("levelMessage");

const weekMessage =
    document.getElementById("weekMessage");

const rewardProgress =
    document.getElementById("rewardProgress");

const rewardText =
    document.getElementById("rewardText");

const lessonButton =
    document.getElementById("lessonButton");

const lessonMessage =
    document.getElementById("lessonMessage");

const pathProgress =
    document.getElementById("pathProgress");

const activityContent =
    document.getElementById("activityContent");


/* MAIN UPDATE */

function updateDashboard() {

    welcomeName.textContent =
        user.firstName + ".";

    profileInitial.textContent =
        user.firstName
            .charAt(0)
            .toUpperCase();

    topStreak.textContent =
        user.streak;

    topXp.textContent =
        user.xp.toLocaleString();

    streakValue.textContent =
        user.streak;

    xpValue.textContent =
        user.xp.toLocaleString();

    lessonsValue.textContent =
        user.lessonsCompleted;


    if (user.streak === 0) {

        welcomeMessage.textContent =
            "Start learning today and begin building your streak.";

    } else {

        welcomeMessage.textContent =
            "Day " +
            user.streak +
            " of your streak. Keep it alive today.";

    }


    updateLevel();
    updateWeek();
    updateLessons();
    updateReward();
    updateBadges();
    updateActivity();
}


/* LEVEL */

function updateLevel() {

    const xpPerLevel = 1000;

    const level =
        Math.min(
            Math.floor(user.xp / xpPerLevel) + 1,
            10
        );

    levelValue.textContent =
        level;


    if (level === 10) {

        levelHeading.textContent =
            "Level 10";

        levelXpText.textContent =
            user.xp.toLocaleString() +
            " XP";

        levelPercentage.textContent =
            "100%";

        levelProgress.style.width =
            "100%";

        levelMessage.textContent =
            "You have reached the highest current level.";

        return;
    }


    const currentLevelStart =
        (level - 1) * xpPerLevel;

    const nextLevelTarget =
        level * xpPerLevel;

    const xpInsideLevel =
        user.xp - currentLevelStart;

    const progress =
        Math.min(
            Math.round(
                (xpInsideLevel / xpPerLevel) * 100
            ),
            100
        );


    levelHeading.textContent =
        "Level " +
        level +
        " → Level " +
        (level + 1);

    levelXpText.textContent =
        user.xp.toLocaleString() +
        " / " +
        nextLevelTarget.toLocaleString() +
        " XP";

    levelPercentage.textContent =
        progress + "%";

    levelProgress.style.width =
        progress + "%";

    levelMessage.textContent =
        (
            nextLevelTarget -
            user.xp
        ).toLocaleString() +
        " XP until Level " +
        (level + 1) +
        ".";
}


/* WEEK */

function updateWeek() {

    const dayCards =
        document.querySelectorAll(".day");

    let completedDays = 0;


    dayCards.forEach(function (day, index) {

        const dayBox =
            day.querySelector("span");


        if (user.weeklyActivity[index]) {

            day.classList.add("completed");

            dayBox.textContent = "✓";

            completedDays++;

        } else {

            day.classList.remove("completed");

            dayBox.textContent = "";
        }

    });


    if (completedDays === 0) {

        weekMessage.textContent =
            "Complete your first lesson to begin tracking your week.";

    } else if (completedDays === 7) {

        weekMessage.textContent =
            "You've coded every day this week.";

    } else {

        weekMessage.textContent =
            "You've coded " +
            completedDays +
            " out of 7 days this week.";

    }
}


/* LESSON DISPLAY */

function updateLessons() {

    const completedCount =
        user.completedLessons.length;

    pathProgress.textContent =
        completedCount +
        " / " +
        lessons.length;


    lessons.forEach(function (lesson, index) {

        const lessonElement =
            document.getElementById(
                "lesson" + lesson.id
            );

        const status =
            lessonElement.querySelector(
                ".lesson-status"
            );

        const description =
            lessonElement.querySelector(
                ".lesson-info p"
            );


        lessonElement.classList.remove(
            "completed",
            "current",
            "locked"
        );


        if (
            user.completedLessons.includes(
                lesson.id
            )
        ) {

            lessonElement.classList.add(
                "completed"
            );

            status.textContent = "✓";

            description.textContent =
                "Completed";

        } else if (index === completedCount) {

            lessonElement.classList.add(
                "current"
            );

            status.textContent = "";

            description.textContent =
                "Ready to continue";

        } else {

            lessonElement.classList.add(
                "locked"
            );

            status.textContent = "";

            description.textContent =
                "Locked";
        }

    });


    if (completedCount >= lessons.length) {

        lessonButton.textContent =
            "Path Completed";

        lessonButton.disabled = true;

        lessonMessage.textContent =
            "You completed the current demo learning path.";

        return;
    }


    lessonButton.disabled = false;

    const nextLesson =
        lessons[completedCount];


    if (completedCount === 0) {

        lessonButton.textContent =
            "Start First Lesson →";

    } else {

        lessonButton.textContent =
            "Continue: " +
            nextLesson.name +
            " →";
    }
}


/* COMPLETE LESSON */

lessonButton.addEventListener("click", function () {

    const completedCount =
        user.completedLessons.length;


    if (completedCount >= lessons.length) {
        return;
    }


    const lesson =
        lessons[completedCount];


    user.completedLessons.push(
        lesson.id
    );

    user.lessonsCompleted =
        user.completedLessons.length;

    user.xp += lesson.xp;


    const today =
        new Date().getDay();

    const mondayIndex =
        today === 0
            ? 6
            : today - 1;


    if (!user.weeklyActivity[mondayIndex]) {

        user.weeklyActivity[mondayIndex] =
            true;

        if (user.streak === 0) {
            user.streak = 1;
        }
    }


    saveUser();

    updateDashboard();


    lessonMessage.textContent =
        lesson.name +
        " completed. +" +
        lesson.xp +
        " XP earned.";


    showToast(
        "Lesson completed · +" +
        lesson.xp +
        " XP"
    );
});


/* REWARD */

function updateReward() {

    const percentage =
        Math.min(
            user.streak,
            100
        );


    rewardProgress.style.width =
        percentage + "%";


    rewardText.textContent =
        user.streak +
        "/100 days · " +
        Math.max(
            100 - user.streak,
            0
        ) +
        " days to go";
}


/* BADGES */

function updateBadges() {

    document
        .querySelectorAll("[data-streak]")
        .forEach(function (badge) {

            const required =
                Number(
                    badge.dataset.streak
                );


            if (user.streak >= required) {

                badge.classList.remove(
                    "locked"
                );

                badge.classList.add(
                    "unlocked"
                );

            } else {

                badge.classList.remove(
                    "unlocked"
                );

                badge.classList.add(
                    "locked"
                );
            }

        });
}


/* ACTIVITY */

function getActivityHTML() {

    if (user.completedLessons.length === 0) {

        return `
            <div class="empty-state">

                <strong>
                    No activity yet
                </strong>

                <p>
                    Your activity will appear here
                    as you complete lessons.
                </p>

            </div>
        `;
    }


    let html = "";


    user.completedLessons
        .slice()
        .reverse()
        .forEach(function (lessonId) {

            const lesson =
                lessons.find(function (item) {
                    return item.id === lessonId;
                });


            html += `
                <div class="activity-entry">

                    <strong>
                        ${user.firstName} completed
                        ${lesson.name}
                    </strong>

                    <p>
                        +${lesson.xp} XP earned
                    </p>

                </div>
            `;

        });


    return html;
}


/* RANKS */

function getRanksHTML() {

    return `
        <div class="rank-entry">

            <span class="rank-number">1</span>

            <span class="rank-name">
                alex_dev
            </span>

            <span class="rank-xp">
                14,200 XP
            </span>

        </div>


        <div class="rank-entry">

            <span class="rank-number">2</span>

            <span class="rank-name">
                sarah_codes
            </span>

            <span class="rank-xp">
                11,850 XP
            </span>

        </div>


        <div class="rank-entry">

            <span class="rank-number">-</span>

            <span class="rank-name">
                ${user.firstName}
            </span>

            <span class="rank-xp">
                ${user.xp.toLocaleString()} XP
            </span>

        </div>
    `;
}


function updateActivity() {

    const activeTab =
        document.querySelector(
            ".tab-button.active"
        );


    if (
        activeTab &&
        activeTab.dataset.tab === "ranks"
    ) {

        activityContent.innerHTML =
            getRanksHTML();

    } else {

        activityContent.innerHTML =
            getActivityHTML();
    }
}


document
    .querySelectorAll(".tab-button")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(
                        ".tab-button"
                    )
                    .forEach(
                        function (tab) {
                            tab.classList.remove(
                                "active"
                            );
                        }
                    );


                button.classList.add(
                    "active"
                );


                updateActivity();
            }
        );

    });


/* QUICK CARDS */

document
    .getElementById("reels")
    .addEventListener(
        "click",
        function () {

            showToast(
                "Reels will connect to the Reels module."
            );
        }
    );


document
    .getElementById("help")
    .addEventListener(
        "click",
        function () {

            showToast(
                "Help Board will connect to the Help Board module."
            );
        }
    );


document
    .getElementById("community")
    .addEventListener(
        "click",
        function () {

            showToast(
                "Community will connect to the Community module."
            );
        }
    );


/* LOAD */

updateDashboard();