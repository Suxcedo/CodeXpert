const supabase = require("../config/supabase");

// Validate a positive integer ID.
function getValidId(value) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Compare answers without being affected by letter casing or spaces.
function normalizeAnswer(value) {
    if (typeof value !== "string" && typeof value !== "number") {
        return "";
    }

    return String(value).trim().toLowerCase();
}

// Check that the learner is enrolled in the quiz's learning path.
async function checkQuizAccess(quiz, userId) {
    if (!quiz.lesson_id) {
        return {
            allowed: false,
            status: 400,
            message: "This quiz is not linked to a lesson."
        };
    }

    const { data: lesson, error: lessonError } = await supabase
        .from("lesson")
        .select("lesson_id, module_id, status")
        .eq("lesson_id", quiz.lesson_id)
        .maybeSingle();

    if (lessonError) throw lessonError;

    if (
        !lesson ||
        String(lesson.status).toLowerCase() !== "published"
    ) {
        return {
            allowed: false,
            status: 404,
            message: "The lesson for this quiz is not available."
        };
    }

    const { data: module, error: moduleError } = await supabase
        .from("module")
        .select("module_id, path_id")
        .eq("module_id", lesson.module_id)
        .maybeSingle();

    if (moduleError) throw moduleError;

    if (!module) {
        return {
            allowed: false,
            status: 404,
            message: "The learning path for this quiz was not found."
        };
    }

    const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollment")
        .select("enrollment_id, status")
        .eq("user_id", userId)
        .eq("path_id", module.path_id)
        .maybeSingle();

    if (enrollmentError) throw enrollmentError;

    if (
        !enrollment ||
        String(enrollment.status).toLowerCase() !== "active"
    ) {
        return {
            allowed: false,
            status: 403,
            message: "Enroll in this learning path before accessing the quiz."
        };
    }

    return {
        allowed: true,
        pathId: module.path_id
    };
}

// Award XP through the database function.
async function awardXp({
    userId,
    amount,
    rewardKey,
    reason,
    lessonId = null,
    quizAttemptId = null,
    questionAttemptId = null,
    pathId = null
}) {
    if (amount <= 0) {
        return {
            awarded: false,
            amount: 0,
            overall_xp: null,
            path_xp: null
        };
    }

    const { data, error } = await supabase.rpc("award_xp", {
        p_user_id: userId,
        p_amount: amount,
        p_reward_key: rewardKey,
        p_reason: reason,
        p_lesson_id: lessonId,
        p_quiz_attempt_id: quizAttemptId,
        p_question_attempt_id: questionAttemptId,
        p_path_id: pathId
    });

    if (error) {
        console.error("Award XP error:", error);
        throw error;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result) {
        throw new Error("The XP function returned no result.");
    }

    return result;
}

// Load a published quiz without exposing its answer key.
async function getQuiz(req, res) {
    try {
        const quizId = getValidId(req.params.quizId);

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "A valid quiz ID is required."
            });
        }

        const { data: quiz, error: quizError } = await supabase
            .from("quiz")
            .select(`
                quiz_id,
                lesson_id,
                module_id,
                quiz_number,
                title,
                instructions,
                quiz_type,
                pass_mark,
                status
            `)
            .eq("quiz_id", quizId)
            .maybeSingle();

        if (quizError) {
            console.error("Fetch quiz error:", quizError);
            return res.status(500).json({
                success: false,
                message: "Unable to load the quiz."
            });
        }

        if (!quiz || String(quiz.status).toLowerCase() !== "published") {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or not available yet."
            });
        }

        const access = await checkQuizAccess(quiz, req.user.id);

        if (!access.allowed) {
            return res.status(access.status).json({
                success: false,
                message: access.message
            });
        }

        const { data: questions, error: questionsError } = await supabase
            .from("question")
            .select(`
                question_id,
                display_order,
                question_type,
                prompt,
                options,
                xp_reward,
                is_required
            `)
            .eq("quiz_id", quizId)
            .order("display_order", { ascending: true });

        if (questionsError) {
            console.error("Fetch quiz questions error:", questionsError);
            return res.status(500).json({
                success: false,
                message: "Unable to load the quiz questions."
            });
        }

        return res.status(200).json({
            success: true,
            quiz,
            questions: questions || []
        });
    } catch (error) {
        console.error("Load quiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while loading the quiz."
        });
    }
}

// Submit, grade and reward a quiz.
async function submitQuiz(req, res) {
    try {
        const quizId = getValidId(req.params.quizId);
        const answers = req.body.answers;
        const userId = req.user.id;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "A valid quiz ID is required."
            });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Submit at least one answer."
            });
        }

        // Validate the submitted answer structure.
        const submittedIds = [];

        for (const item of answers) {
            const questionId = getValidId(item?.question_id);

            if (!questionId || submittedIds.includes(questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Answers contain an invalid or repeated question ID."
                });
            }

            submittedIds.push(questionId);
        }

        // Load the quiz and its reward settings.
        const { data: quiz, error: quizError } = await supabase
            .from("quiz")
            .select(`
                quiz_id,
                lesson_id,
                module_id,
                title,
                quiz_type,
                pass_mark,
                xp_per_correct,
                perfect_bonus_xp,
                status
            `)
            .eq("quiz_id", quizId)
            .maybeSingle();

        if (quizError) throw quizError;

        if (!quiz || String(quiz.status).toLowerCase() !== "published") {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or not available."
            });
        }

        const access = await checkQuizAccess(quiz, userId);

        if (!access.allowed) {
            return res.status(access.status).json({
                success: false,
                message: access.message
            });
        }

        // Load answer keys only on the backend.
        const { data: questions, error: questionsError } = await supabase
            .from("question")
            .select(`
                question_id,
                question_type,
                prompt,
                evaluation,
                explanation,
                xp_reward,
                is_required
            `)
            .eq("quiz_id", quizId)
            .order("display_order", { ascending: true });

        if (questionsError) throw questionsError;

        if (!questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "This quiz has no questions yet."
            });
        }

        // Do not accept questions belonging to another quiz.
        const questionIds = questions.map(question =>
            Number(question.question_id)
        );

        if (submittedIds.some(id => !questionIds.includes(id))) {
            return res.status(400).json({
                success: false,
                message: "One or more submitted questions do not belong to this quiz."
            });
        }

        // Require an answer for every question before grading the quiz.
        const submittedQuestionIds = new Set(
            answers.map(answer => Number(answer.question_id))
        );

        const missingQuestions = questions.filter(
            question => !submittedQuestionIds.has(
                Number(question.question_id)
            )
        );

        if (missingQuestions.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Please answer every question before submitting the quiz."
            });
        }

        // Reject empty answers, even if a request bypasses frontend validation.
        const hasEmptyAnswer = answers.some(item =>
            item.answer === null ||
            item.answer === undefined ||
            String(item.answer).trim() === ""
        );

        if (hasEmptyAnswer) {
            return res.status(400).json({
                success: false,
                message: "Please answer every question before submitting the quiz."
            });
        }

        const unsupportedQuestion = questions.find(
            question => !["multiple_choice", "true_false"].includes(
                String(question.question_type).toLowerCase()
            )
        );

        if (unsupportedQuestion) {
            return res.status(400).json({
                success: false,
                message: "This quiz contains a question type that submission does not support yet."
            });
        }

        const answerMap = new Map(
            answers.map(item => [
                Number(item.question_id),
                item.answer
            ])
        );

        // Grade every question on the server.
        const gradedAnswers = questions.map(question => {
            const submittedAnswer = answerMap.has(
                Number(question.question_id)
            )
                ? answerMap.get(Number(question.question_id))
                : null;

            const correctAnswer =
                question.evaluation?.correct_answer;

            const isCorrect =
                submittedAnswer !== null &&
                submittedAnswer !== undefined &&
                normalizeAnswer(submittedAnswer) !== "" &&
                correctAnswer !== undefined &&
                normalizeAnswer(submittedAnswer) ===
                    normalizeAnswer(correctAnswer);

            // Use a question-specific reward when configured.
            // Otherwise, use the quiz's per-correct-question reward.
            const questionReward = Number(question.xp_reward || 0);
            const quizReward = Number(quiz.xp_per_correct || 0);

            const rewardAmount = questionReward > 0
                ? questionReward
                : quizReward;

            return {
                question_id: Number(question.question_id),
                submitted_answer: submittedAnswer ?? null,
                is_correct: isCorrect,
                explanation: question.explanation || "",
                reward_amount: isCorrect ? rewardAmount : 0,
                is_required: question.is_required
            };
        });

        const totalQuestions = questions.length;
        const correctAnswers = gradedAnswers.filter(
            answer => answer.is_correct
        ).length;

        const score = Number(
            ((correctAnswers / totalQuestions) * 100).toFixed(2)
        );

        const passed = score >= Number(quiz.pass_mark || 0);
        const isPerfect = correctAnswers === totalQuestions;

        // Calculate the next attempt number.
        const { data: previousAttempts, error: attemptsError } =
            await supabase
                .from("quiz_attempt")
                .select("attempt_number")
                .eq("user_id", userId)
                .eq("quiz_id", quizId)
                .order("attempt_number", { ascending: false })
                .limit(1);

        if (attemptsError) throw attemptsError;

        const attemptNumber =
            previousAttempts && previousAttempts.length > 0
                ? Number(previousAttempts[0].attempt_number) + 1
                : 1;

        // Save the quiz attempt.
        const { data: savedAttempt, error: saveAttemptError } =
            await supabase
                .from("quiz_attempt")
                .insert({
                    user_id: userId,
                    quiz_id: quizId,
                    attempt_number: attemptNumber,
                    score,
                    total_questions: totalQuestions,
                    correct_answers: correctAnswers,
                    passed,
                    is_perfect: isPerfect,
                    submitted_at: new Date().toISOString()
                })
                .select("quiz_attempt_id, attempt_number")
                .single();

        if (saveAttemptError) throw saveAttemptError;

        // Save each answer before attempting to award XP.
        const questionAttemptRows = gradedAnswers.map(answer => ({
            quiz_attempt_id: savedAttempt.quiz_attempt_id,
            quiz_id: quizId,
            question_id: answer.question_id,
            submitted_answer: answer.submitted_answer,
            is_correct: answer.is_correct,
            xp_awarded: 0
        }));

        const { data: savedQuestionAttempts, error: saveAnswersError } =
            await supabase
                .from("question_attempt")
                .insert(questionAttemptRows)
                .select("question_attempt_id, question_id");

        if (saveAnswersError) {
            console.error("Save question attempts error:", saveAnswersError);

            // Remove the incomplete attempt if saving its answers fails.
            await supabase
                .from("quiz_attempt")
                .delete()
                .eq("quiz_attempt_id", savedAttempt.quiz_attempt_id)
                .eq("user_id", userId);

            throw saveAnswersError;
        }

        const questionAttemptMap = new Map(
            (savedQuestionAttempts || []).map(item => [
                Number(item.question_id),
                item.question_attempt_id
            ])
        );

        let xpAwarded = 0;
        let perfectBonusAwarded = 0;

        // Award XP for correct answers. The reward key prevents duplicates
        // across different attempts at the same question.
        for (const answer of gradedAnswers) {
            if (!answer.is_correct || answer.reward_amount <= 0) {
                continue;
            }

            const questionAttemptId = questionAttemptMap.get(
                answer.question_id
            );

            if (!questionAttemptId) {
                throw new Error(
                    `Question attempt not found for question ${answer.question_id}.`
                );
            }

            const reward = await awardXp({
                userId,
                amount: answer.reward_amount,
                rewardKey: `question:${answer.question_id}`,
                reason: `Correct answer to question ${answer.question_id}`,
                lessonId: quiz.lesson_id,
                quizAttemptId: savedAttempt.quiz_attempt_id,
                questionAttemptId,
                pathId: access.pathId
            });

            const actuallyAwarded = reward.awarded
                ? Number(reward.amount || 0)
                : 0;

            // Record XP awarded during this particular attempt.
            const { error: updateQuestionError } = await supabase
                .from("question_attempt")
                .update({ xp_awarded: actuallyAwarded })
                .eq("question_attempt_id", questionAttemptId)
                .eq("quiz_attempt_id", savedAttempt.quiz_attempt_id);

            if (updateQuestionError) {
                throw updateQuestionError;
            }

            xpAwarded += actuallyAwarded;
        }

        // Award the perfect-quiz bonus only when every question is correct.
        if (isPerfect && Number(quiz.perfect_bonus_xp || 0) > 0) {
            const bonus = await awardXp({
                userId,
                amount: Number(quiz.perfect_bonus_xp),
                rewardKey: `quiz-perfect:${quizId}`,
                reason: `Perfect score on quiz ${quizId}`,
                lessonId: quiz.lesson_id,
                quizAttemptId: savedAttempt.quiz_attempt_id,
                pathId: access.pathId
            });

            if (bonus.awarded) {
                perfectBonusAwarded = Number(bonus.amount || 0);
                xpAwarded += perfectBonusAwarded;
            }
        }

        // Read the latest XP totals for the response.
        const { data: profile, error: profileError } = await supabase
            .from("user_profile")
            .select("overall_xp")
            .eq("user_id", userId)
            .single();

        if (profileError) throw profileError;

        const { data: enrollment, error: enrollmentError } = await supabase
            .from("enrollment")
            .select("path_xp")
            .eq("user_id", userId)
            .eq("path_id", access.pathId)
            .single();

        if (enrollmentError) throw enrollmentError;

        return res.status(200).json({
            success: true,
            message: "Quiz submitted successfully.",
            result: {
                quiz_attempt_id: savedAttempt.quiz_attempt_id,
                attempt_number: savedAttempt.attempt_number,
                score,
                total_questions: totalQuestions,
                correct_answers: correctAnswers,
                passed,
                is_perfect: isPerfect,
                xp_awarded: xpAwarded,
                perfect_bonus_awarded: perfectBonusAwarded,
                overall_xp: Number(profile.overall_xp || 0),
                path_xp: Number(enrollment.path_xp || 0),
                answers: gradedAnswers.map(answer => ({
                    question_id: answer.question_id,
                    submitted_answer: answer.submitted_answer,
                    is_correct: answer.is_correct,
                    explanation: answer.explanation
                }))
            }
        });
    } catch (error) {
        console.error("Submit quiz error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while submitting the quiz."
        });
    }
}




async function getLatestQuizAttempt(req, res) {
    try {
        const quizId = getValidId(req.params.quizId);
        const userId = req.user.id;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "A valid quiz ID is required."
            });
        }

        // Confirm that the quiz exists and is published.
        const { data: quiz, error: quizError } = await supabase
            .from("quiz")
            .select("quiz_id, lesson_id, status")
            .eq("quiz_id", quizId)
            .maybeSingle();

        if (quizError) throw quizError;

        if (
            !quiz ||
            String(quiz.status).toLowerCase() !== "published"
        ) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or not available."
            });
        }

        // Confirm that this learner can access the quiz.
        const access = await checkQuizAccess(quiz, userId);

        if (!access.allowed) {
            return res.status(access.status).json({
                success: false,
                message: access.message
            });
        }

        // Retrieve the learner's latest attempt.
        const { data: attempt, error: attemptError } = await supabase
            .from("quiz_attempt")
            .select(`
                quiz_attempt_id,
                attempt_number,
                score,
                total_questions,
                correct_answers,
                passed,
                is_perfect,
                submitted_at
            `)
            .eq("quiz_id", quizId)
            .eq("user_id", userId)
            .order("attempt_number", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (attemptError) throw attemptError;

        // No previous attempt means the learner can take the quiz.
        if (!attempt) {
            return res.status(200).json({
                success: true,
                attempt: null
            });
        }

        // Retrieve the answers saved for that specific attempt.
        const { data: savedAnswers, error: answersError } =
            await supabase
                .from("question_attempt")
                .select(`
                    question_id,
                    submitted_answer,
                    is_correct,
                    xp_awarded
                `)
                .eq("quiz_attempt_id", attempt.quiz_attempt_id);

        if (answersError) throw answersError;

        const answers = savedAnswers || [];

        // Retrieve explanations for the saved questions.
        const questionIds = [
            ...new Set(answers.map(answer => answer.question_id))
        ];

        let questionsById = new Map();

        if (questionIds.length > 0) {
            const { data: questions, error: questionsError } =
                await supabase
                    .from("question")
                    .select("question_id, explanation")
                    .in("question_id", questionIds);

            if (questionsError) throw questionsError;

            questionsById = new Map(
                (questions || []).map(question => [
                    Number(question.question_id),
                    question
                ])
            );
        }

        // Return the structure expected by the existing lesson JavaScript.
        const result = {
            ...attempt,
            answers: answers.map(answer => ({
                question_id: Number(answer.question_id),
                submitted_answer: answer.submitted_answer,
                is_correct: answer.is_correct,
                explanation:
                    questionsById.get(Number(answer.question_id))
                        ?.explanation || ""
            }))
        };

        return res.status(200).json({
            success: true,
            attempt: result
        });
    } catch (error) {
        console.error("Get latest quiz attempt error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load the latest quiz attempt."
        });
    }
}


module.exports = {
    getQuiz,
    submitQuiz,
    getLatestQuizAttempt
};