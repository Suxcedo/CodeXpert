DO $$
DECLARE
    v_lesson_id BIGINT := 24;
    v_quiz_id BIGINT;
BEGIN
    -- Confirm that the existing Java lesson belongs to Module 1.
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = v_lesson_id
          AND module_id = 11
          AND lesson_number = 1
          AND title = 'What Is Java?'
    ) THEN
        RAISE EXCEPTION 'Java Module 1 Lesson 1 was not found.';
    END IF;

    -- Prevent duplicate content insertion.
    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = v_lesson_id
    ) OR EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION
            'Lesson 1 already contains sections or a quiz. No changes were made.';
    END IF;


    -- Create the Knowledge Check quiz.
    INSERT INTO public.quiz (
        lesson_id,
        module_id,
        quiz_number,
        title,
        instructions,
        quiz_type,
        pass_mark,
        xp_per_correct,
        perfect_bonus_xp,
        status
    )
    VALUES (
        v_lesson_id,
        NULL,
        1,
        'Lesson 1.1 Knowledge Check',
        'Answer all five questions about Java, its history, its original developers and its common applications.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: Introduction.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to Java',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Java is a high-level, object-oriented programming language used to develop different types of software applications. It was originally developed by Sun Microsystems and released in 1995. Java is now maintained by Oracle.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Java allows programmers to write instructions that computers can execute. It is widely used because it is reliable, secure and can run on different operating systems.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Java is one of the programming languages used to build software across different industries. From mobile applications to large business systems, Java provides developers with tools to create reliable applications.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Did You Know?',
                    'text', 'Java was first released in 1995 and has continued to evolve into one of the widely used programming languages in software development.'
                )
            )
        )
    );


    -- SECTION 2: Common uses of Java.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        2,
        'heading',
        'What Is Java Used For?',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Java is used to develop different types of software applications. Some common examples include:'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Desktop applications.',
                        'Web applications.',
                        'Android applications.',
                        'Banking systems.',
                        'Business management software.',
                        'Enterprise applications.'
                    )
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'These examples demonstrate how Java can be applied to different software development requirements, from applications used by individuals to complex systems used by organisations.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'Java is not limited to one type of application. It can be used in different areas of software development.'
                )
            )
        )
    );


    -- SECTION 3: Java and beginners.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        3,
        'heading',
        'Why Learn Java?',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Java is also popular among beginners because it introduces important programming concepts that are used in many other programming languages.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'As learners progress through Java, they will become familiar with concepts such as:'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Variables: Used to store information in a program.',
                        'Methods: Used to organise instructions into reusable blocks of code.',
                        'Classes: Used as blueprints for creating objects.',
                        'Objects: Represent instances of classes that contain data and behaviour.'
                    )
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'These concepts form an important foundation for understanding how software applications are designed, organised and developed.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'Learning Java is not only about writing code. It also helps you understand fundamental programming concepts that are useful throughout software development.'
                )
            )
        )
    );


    -- SECTION 4: Key terms.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        4,
        'heading',
        'Important Java Terminology',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Before moving forward, it is important to understand three basic terms used throughout programming.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '1. Programming Language'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A programming language is a language used to give instructions to a computer. Programmers use programming languages such as Java to create software applications.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '2. Source Code'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Source code refers to instructions written by a programmer using a programming language. In Java, source code is normally written in files with the .java extension.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '3. Application'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An application is a software program designed to perform a particular task. Examples include banking applications, mobile applications and desktop programs.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Key Takeaway',
                    'text', 'A programmer writes source code using a programming language to develop applications that perform specific tasks.'
                )
            )
        )
    );


    -- SECTION 5: Lesson summary.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        5,
        'summary',
        'Lesson Summary',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Java is a high-level, object-oriented programming language used to develop different types of software applications. It was originally developed by Sun Microsystems and released in 1995. Oracle currently maintains Java.'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'title', 'Important points to remember',
                    'items',
                    jsonb_build_array(
                        'Java is a high-level, object-oriented programming language.',
                        'Java was originally developed by Sun Microsystems.',
                        'Java was released in 1995.',
                        'Java is currently maintained by Oracle.',
                        'Java is used for desktop, web and Android applications.',
                        'Java is also used in banking and enterprise systems.',
                        'Java introduces important concepts such as variables, methods, classes and objects.',
                        'Source code contains instructions written by a programmer.',
                        'An application is software designed to perform a particular task.'
                    )
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Check Your Understanding'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Can you explain what Java is?',
                        'Who originally developed Java?',
                        'In which year was Java released?',
                        'Which company currently maintains Java?',
                        'Can you identify different types of applications developed using Java?',
                        'Can you explain the meaning of programming language, source code and application?'
                    )
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'You are ready for the next lesson when...',
                    'text', 'You can explain what Java is, identify its original developers, state when it was released, describe where it is used and explain the basic programming terminology introduced in this lesson.'
                )
            )
        )
    );


    -- SECTION 6: Knowledge Check.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content,
        quiz_id
    )
    VALUES (
        v_lesson_id,
        6,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of Java, its history, its original developers, its current maintenance and its common applications.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1.
    INSERT INTO public.question (
        quiz_id,
        display_order,
        question_type,
        prompt,
        options,
        evaluation,
        explanation,
        xp_reward,
        is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'What is Java?',
        '[
            {"label":"A","text":"An operating system"},
            {"label":"B","text":"A programming language"},
            {"label":"C","text":"A database"},
            {"label":"D","text":"A web browser"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'Java is a high-level, object-oriented programming language used to develop different types of software applications.',
        3,
        TRUE
    );


    -- QUESTION 2.
    INSERT INTO public.question (
        quiz_id,
        display_order,
        question_type,
        prompt,
        options,
        evaluation,
        explanation,
        xp_reward,
        is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'Who originally developed Java?',
        '[
            {"label":"A","text":"Microsoft"},
            {"label":"B","text":"Google"},
            {"label":"C","text":"Sun Microsystems"},
            {"label":"D","text":"Apple"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'Java was originally developed by Sun Microsystems and released in 1995.',
        3,
        TRUE
    );


    -- QUESTION 3.
    INSERT INTO public.question (
        quiz_id,
        display_order,
        question_type,
        prompt,
        options,
        evaluation,
        explanation,
        xp_reward,
        is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'In which year was Java released?',
        '[
            {"label":"A","text":"1990"},
            {"label":"B","text":"1995"},
            {"label":"C","text":"2000"},
            {"label":"D","text":"2010"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'Java was officially released in 1995.',
        3,
        TRUE
    );


    -- QUESTION 4.
    INSERT INTO public.question (
        quiz_id,
        display_order,
        question_type,
        prompt,
        options,
        evaluation,
        explanation,
        xp_reward,
        is_required
    )
    VALUES (
        v_quiz_id,
        4,
        'multiple_choice',
        'Which company currently maintains Java?',
        '[
            {"label":"A","text":"Oracle"},
            {"label":"B","text":"Samsung"},
            {"label":"C","text":"Meta"},
            {"label":"D","text":"IBM"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'Java is currently maintained by Oracle, following its acquisition of Sun Microsystems.',
        3,
        TRUE
    );


    -- QUESTION 5.
    INSERT INTO public.question (
        quiz_id,
        display_order,
        question_type,
        prompt,
        options,
        evaluation,
        explanation,
        xp_reward,
        is_required
    )
    VALUES (
        v_quiz_id,
        5,
        'multiple_choice',
        'Which of the following is Java commonly used for?',
        '[
            {"label":"A","text":"Android applications"},
            {"label":"B","text":"Washing clothes"},
            {"label":"C","text":"Hardware manufacturing"},
            {"label":"D","text":"Printing documents only"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'Java has traditionally been used in Android application development and remains supported alongside Kotlin.',
        3,
        TRUE
    );


    -- Publish the quiz.
    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;


    RAISE NOTICE
        'Java Lesson 1 completed successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id,
        v_quiz_id;

END $$;


SELECT
    l.lesson_id,
    l.title,
    l.status AS lesson_status,
    ls.display_order,
    ls.section_title,
    ls.section_type,
    q.quiz_id,
    q.title AS quiz_title,
    q.status AS quiz_status,
    (
        SELECT COUNT(*)
        FROM public.question qu
        WHERE qu.quiz_id = q.quiz_id
    ) AS question_count
FROM public.lesson l
LEFT JOIN public.lesson_section ls
    ON ls.lesson_id = l.lesson_id
LEFT JOIN public.quiz q
    ON q.lesson_id = l.lesson_id
WHERE l.lesson_id = 24
ORDER BY ls.display_order;



SELECT *
FROM learning_path
ORDER BY path_id;