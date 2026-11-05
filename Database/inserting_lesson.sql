
BEGIN;

INSERT INTO public.lesson_section (
    lesson_id,
    display_order,
    section_type,
    section_title,
    section_content
)
SELECT
    1,
    v.display_order,
    v.section_type,
    v.section_title,
    v.section_content::jsonb
FROM (
    VALUES
    (
        1,
        'introduction',
        'Welcome to Web Development',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "Welcome to your first CodeXperts lesson! Before learning how to write code, it is important to understand what websites are and how they work."
                },
                {
                    "type": "paragraph",
                    "text": "In this lesson, you will learn what a website is, how people access websites, and the basic terms used in web development."
                },
                {
                    "type": "list",
                    "title": "By the end of this lesson, you should be able to:",
                    "items": [
                        "Explain what a website is.",
                        "Describe how a browser accesses a website.",
                        "Identify common types of websites.",
                        "Explain basic web development terms."
                    ]
                }
            ]
        }'
    ),
    (
        2,
        'heading',
        'What Is a Website?',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "A website is a collection of related web pages and other resources that people can access through a web browser. Websites are usually organised under a domain name, such as example.com."
                },
                {
                    "type": "paragraph",
                    "text": "A web page is a single document displayed in a browser. For example, a home page, an About page and a Contact page can all be part of the same website."
                },
                {
                    "type": "example",
                    "title": "Example",
                    "text": "An online clothing store may have a home page, product pages, a shopping cart and a contact page. Together, these pages form part of one website."
                }
            ]
        }'
    ),
    (
        3,
        'heading',
        'How Does a Website Work?',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "When you enter a website address into your browser, the browser sends a request for the required resource. A web server or another hosting service responds with the requested content or an appropriate error."
                },
                {
                    "type": "list",
                    "title": "A simple example:",
                    "items": [
                        "You open your web browser.",
                        "You enter a website address.",
                        "The browser sends a request over the internet.",
                        "The server responds with the requested page or resource.",
                        "The browser displays the page to you."
                    ]
                },
                {
                    "type": "callout",
                    "title": "Remember",
                    "text": "The browser is the application you use to access websites. The web server is the system that handles requests for website resources."
                }
            ]
        }'
    ),
    (
        4,
        'heading',
        'Common Types of Websites',
        '{
            "blocks": [
                {
                    "type": "list",
                    "items": [
                        "Informational websites: share information about a person, organisation or topic.",
                        "E-commerce websites: allow people to browse and purchase products or services.",
                        "Educational websites: provide learning materials, courses and activities.",
                        "Social networking websites: allow people to connect and share content.",
                        "News websites: publish news, reports and current events."
                    ]
                },
                {
                    "type": "example",
                    "title": "Think about websites you use",
                    "text": "A university website may provide course information, while an online shop may let you buy products. Their purposes differ, but both can be accessed through a browser."
                }
            ]
        }'
    ),
    (
        5,
        'heading',
        'Important Web Development Terms',
        '{
            "blocks": [
                {
                    "type": "list",
                    "items": [
                        "Website: a collection of related web pages and resources.",
                        "Web page: an individual document displayed in a browser.",
                        "Web browser: software used to access and display web content.",
                        "Web server: software or a system that responds to requests for web resources.",
                        "Domain name: a human-readable name used to locate an internet service.",
                        "Web development: the process of building and maintaining websites and web applications."
                    ]
                }
            ]
        }'
    ),
    (
        6,
        'summary',
        'Lesson Summary',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "A website contains related pages and resources. People access websites using browsers, which request resources from servers. Websites can serve different purposes, including education, shopping, communication and sharing information."
                },
                {
                    "type": "list",
                    "title": "Key points",
                    "items": [
                        "A web page is one part of a website.",
                        "Browsers request and display web resources.",
                        "Servers respond to requests.",
                        "Websites are built for different purposes."
                    ]
                }
            ]
        }'
    )
) AS v(
    display_order,
    section_type,
    section_title,
    section_content
)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.lesson_section existing
    WHERE existing.lesson_id = 1
      AND existing.display_order = v.display_order
);

COMMIT;


BEGIN;

UPDATE public.lesson_section AS ls
SET
    section_title = v.section_title,
    section_content = v.section_content::jsonb
FROM (
    VALUES
    (
        1,
        'Welcome to Web Development',
        $json${"blocks":[
            {
                "type":"paragraph",
                "text":"Welcome to your first CodeXperts lesson! Before learning how to write code, it is important to understand what websites are, what they are used for and how people access them."
            },
            {
                "type":"paragraph",
                "text":"Websites are part of everyday life. People use them to study, shop, communicate, read news, watch videos and access services. Web development is the process of creating and maintaining websites and web applications."
            },
            {
                "type":"heading",
                "text":"What you will learn"
            },
            {
                "type":"list",
                "items":[
                    "Explain what a website and a web page are.",
                    "Identify the difference between a website and a web application.",
                    "Describe the basic roles of a browser and a web server.",
                    "Identify common types of websites.",
                    "Understand the basic terms used in web development."
                ]
            },
            {
                "type":"callout",
                "title":"Learning tip",
                "text":"As you study, think about websites you already use. Connecting new ideas to familiar websites makes them easier to understand."
            }
        ]}$json$::jsonb
    ),
    (
        2,
        'What Is a Website?',
        $json${"blocks":[
            {
                "type":"heading",
                "text":"Understanding websites"
            },
            {
                "type":"paragraph",
                "text":"A website is a collection of related web pages and resources that people can access through a web browser. A website may contain text, images, videos, links, forms and other interactive features."
            },
            {
                "type":"paragraph",
                "text":"A web page is an individual document displayed in a browser. A website can contain many pages that are connected through links and navigation menus."
            },
            {
                "type":"example",
                "title":"Example: A university website",
                "text":"A university website may contain a home page, an About Us page, course information, an admissions page and a contact page. Each is a separate web page, but together they form one website."
            },
            {
                "type":"heading",
                "text":"Website versus web application"
            },
            {
                "type":"paragraph",
                "text":"A traditional informational website mainly presents information for visitors to read. A web application allows users to perform tasks and interact with data through a browser. The difference is not always strict because many websites include application features."
            },
            {
                "type":"list",
                "items":[
                    "Informational website: mainly helps visitors find and read information.",
                    "Web application: allows users to perform tasks such as submitting information, managing records or making purchases."
                ]
            },
            {
                "type":"example",
                "title":"Compare the two",
                "text":"A page showing a restaurant's opening hours is mainly informational. An online banking service that lets customers view balances and transfer money is a web application."
            },
            {
                "type":"callout",
                "title":"Remember",
                "text":"A website can include interactive features, and a web application can be part of a larger website. These terms describe common uses rather than completely separate categories."
            }
        ]}$json$::jsonb
    ),
    (
        3,
        'How Does a Website Work?',
        $json${"blocks":[
            {
                "type":"heading",
                "text":"The browser and the server"
            },
            {
                "type":"paragraph",
                "text":"When you open a website, your browser requests the resources needed to display it. Those resources may be provided by a web server or another hosting service. The response may contain a web page, an image, a script or another resource."
            },
            {
                "type":"paragraph",
                "text":"A web browser is software used to access and display web content. Examples include Google Chrome, Mozilla Firefox, Microsoft Edge and Safari."
            },
            {
                "type":"paragraph",
                "text":"A web server is software, usually running on a computer or hosting platform, that receives requests and sends responses. The browser and server communicate over a network using agreed communication rules."
            },
            {
                "type":"heading",
                "text":"The basic process"
            },
            {
                "type":"list",
                "items":[
                    "You enter a website address or select a link.",
                    "The browser identifies the resource it needs to request.",
                    "The browser sends a request over the network.",
                    "The server or hosting service processes the request and sends a response.",
                    "The browser processes the returned resources and displays the page."
                ]
            },
            {
                "type":"example",
                "title":"Example: Opening an online shop",
                "text":"You enter an online shop's address. Your browser requests its home page. The hosting service returns the required page resources, and the browser displays the shop. When you select a product, the browser may send another request to obtain its details."
            },
            {
                "type":"callout",
                "title":"Important",
                "text":"Not every request succeeds. A server may return an error if a page is unavailable, access is denied or another problem occurs. Websites may also use content delivery networks and other services to deliver resources."
            }
        ]}$json$::jsonb
    ),
    (
        4,
        'Common Types of Websites',
        $json${"blocks":[
            {
                "type":"paragraph",
                "text":"Websites are created for different purposes. Understanding their purposes helps developers decide what information and features to include."
            },
            {
                "type":"list",
                "items":[
                    "Informational websites: provide information about a person, organisation, service or topic.",
                    "E-commerce websites: allow customers to browse products or services and make purchases.",
                    "Educational websites: provide lessons, courses, learning materials and activities.",
                    "Social networking websites: allow people to connect, communicate and share content.",
                    "News websites: publish news reports, articles and current events.",
                    "Portfolio websites: display a person's work, projects, skills or experience.",
                    "Entertainment websites: provide videos, music, games or other entertainment."
                ]
            },
            {
                "type":"example",
                "title":"One purpose, different features",
                "text":"An educational website may provide reading material and downloadable notes. An online learning platform may also include accounts, quizzes, progress tracking and rewards."
            },
            {
                "type":"callout",
                "title":"Think like a developer",
                "text":"Before building a website, identify its purpose and its intended users. This helps determine which pages, content and features are needed."
            }
        ]}$json$::jsonb
    ),
    (
        5,
        'Important Web Development Terms',
        $json${"blocks":[
            {
                "type":"list",
                "title":"Key terms",
                "items":[
                    "Website: a collection of related web pages and resources.",
                    "Web page: an individual document displayed in a browser.",
                    "Web browser: software that requests and displays web content.",
                    "Web server: software or a system that handles requests for web resources.",
                    "Domain name: a human-readable name used to locate an internet service.",
                    "Web hosting: a service that makes website resources available over a network.",
                    "Web development: the process of building and maintaining websites and web applications.",
                    "Frontend: the part of a website or application that users interact with.",
                    "Backend: the server-side logic and services that process requests and work with data.",
                    "Full-stack development: work involving both frontend and backend development."
                ]
            },
            {
                "type":"example",
                "title":"Putting the terms together",
                "text":"A learner opens a web browser and visits a learning platform using its domain name. The browser requests the page from the hosting service. The frontend displays the lesson, while the backend may retrieve the learner's progress from a database."
            },
            {
                "type":"heading",
                "text":"Practical activity: Investigate a website"
            },
            {
                "type":"paragraph",
                "text":"Choose a website you use regularly. Open it in a browser and investigate how it is organised. You do not need to write any code for this activity."
            },
            {
                "type":"list",
                "title":"Complete these tasks",
                "items":[
                    "Write down the website's domain name.",
                    "Identify its main purpose.",
                    "List three pages or sections you can access.",
                    "Identify two features users can interact with, if available.",
                    "Explain what the browser does when you open the website.",
                    "Give one example of information or a resource the website provides."
                ]
            },
            {
                "type":"callout",
                "title":"Activity submission",
                "text":"Write your observations in your own words. Do not include passwords, private account information or other sensitive details."
            }
        ]}$json$::jsonb
    ),
    (
        6,
        'Lesson Summary',
        $json${"blocks":[
            {
                "type":"paragraph",
                "text":"A website is a collection of related web pages and resources. People commonly access websites through browsers, which request resources from servers or hosting services. The browser processes the returned resources and displays the content."
            },
            {
                "type":"list",
                "title":"Key points to remember",
                "items":[
                    "A web page is an individual document; a website can contain many related pages.",
                    "Websites can provide information, shopping, education, communication and entertainment.",
                    "Browsers request and display web resources.",
                    "Servers or hosting services respond to requests for resources.",
                    "Web applications let users perform tasks through a browser.",
                    "Understanding a website's purpose helps developers plan its pages and features."
                ]
            },
            {
                "type":"heading",
                "text":"Check your understanding"
            },
            {
                "type":"list",
                "items":[
                    "Can you explain the difference between a website and a web page?",
                    "Can you describe the basic communication between a browser and a server?",
                    "Can you identify different types of websites and their purposes?",
                    "Can you explain the meaning of the key terms introduced in this lesson?"
                ]
            },
            {
                "type":"callout",
                "title":"You are ready for the next lesson when...",
                "text":"You can explain these ideas in your own words and complete the practical website investigation. The quizzes will be planned and added after the lesson content has been finalised."
            }
        ]}$json$::jsonb
    )
) AS v(
    display_order,
    section_title,
    section_content
)
WHERE ls.lesson_id = 1
  AND ls.display_order = v.display_order;

COMMIT;

SELECT
    section_id,
    lesson_id,
    display_order,
    section_title,
    jsonb_array_length(section_content->'blocks') AS block_count
FROM public.lesson_section
WHERE lesson_id = 1
ORDER BY display_order;









BEGIN;

DO $$
DECLARE
    v_quiz_id BIGINT;
BEGIN
    -- Stop if this quiz already exists, to avoid duplicate data.
    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = 1
          AND quiz_number = 1
          AND quiz_type = 'practice'
    ) THEN
        RAISE EXCEPTION
            'A practice quiz numbered 1 already exists for Lesson 1.';
    END IF;

    -- Generate an unused quiz ID.
    SELECT COALESCE(MAX(quiz_id), 0) + 1
    INTO v_quiz_id
    FROM public.quiz;

    -- Create the draft practice quiz.
    INSERT INTO public.quiz (
        quiz_id,
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
        v_quiz_id,
        1,
        NULL,
        1,
        'Lesson 1.1 Knowledge Check',
        'Choose the best answer for each question.',
        'practice',
        50,
        0,
        0,
        'draft'
    );

    -- Question 1
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'Which statement best describes a website?',
        '[
            {"value":"A","label":"A program used only to write code"},
            {"value":"B","label":"A collection of related webpages or web resources"},
            {"value":"C","label":"A physical computer monitor"},
            {"value":"D","label":"A type of keyboard"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'A website is a collection of related webpages or web resources made available on the web.',
        0,
        TRUE
    );

    -- Question 2
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'What is the primary role of a web browser?',
        '[
            {"value":"A","label":"Manufacture hardware"},
            {"value":"B","label":"Replace every web server"},
            {"value":"C","label":"Access and display web content"},
            {"value":"D","label":"Guarantee every website is secure"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'A browser requests web resources and displays the resulting content to the user.',
        0,
        TRUE
    );

    -- Question 3
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'In a typical website request, which system sends the response?',
        '[
            {"value":"A","label":"Web server"},
            {"value":"B","label":"Keyboard"},
            {"value":"C","label":"Browser address bar alone"},
            {"value":"D","label":"Computer speaker"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'The web server processes the request and sends an HTTP response to the client.',
        0,
        TRUE
    );

    -- Add Section 7 without changing Sections 1–6.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content,
        quiz_id
    )
    VALUES (
        1,
        7,
        'text',
        'Common Misconceptions',
        '{
            "blocks": [
                {
                    "type": "heading",
                    "text": "A browser is not a website"
                },
                {
                    "type": "paragraph",
                    "text": "A browser is software used to access and display web content. A website is the collection of webpages and resources being accessed."
                },
                {
                    "type": "heading",
                    "text": "Websites do not always need multiple pages"
                },
                {
                    "type": "paragraph",
                    "text": "A website can consist of a single page. The number of pages does not determine whether it is a website."
                },
                {
                    "type": "heading",
                    "text": "Web development is more than appearance"
                },
                {
                    "type": "paragraph",
                    "text": "Web development can include structure, design, interactions, server-side processing, data storage, accessibility and security."
                },
                {
                    "type": "heading",
                    "text": "Not every website needs a database"
                },
                {
                    "type": "paragraph",
                    "text": "A simple static website can display content without a database. Databases become useful when an application needs to store and manage data."
                }
            ]
        }'::jsonb,
        NULL
    );

    -- Add Section 8 and link it to the quiz.
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content,
        quiz_id
    )
    VALUES (
        1,
        8,
        'quiz',
        'Knowledge Check',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "Check your understanding of websites, browsers and web servers by answering the questions below."
                }
            ]
        }'::jsonb,
        v_quiz_id
    );

    RAISE NOTICE 'Created draft quiz with ID %', v_quiz_id;
END $$;

COMMIT;












CREATE OR REPLACE FUNCTION public.award_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_reward_key TEXT,
    p_reason TEXT,
    p_lesson_id BIGINT DEFAULT NULL,
    p_quiz_attempt_id BIGINT DEFAULT NULL,
    p_question_attempt_id BIGINT DEFAULT NULL,
    p_path_id BIGINT DEFAULT NULL
)
RETURNS TABLE (
    awarded BOOLEAN,
    amount INTEGER,
    overall_xp INTEGER,
    path_xp INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_transaction_id BIGINT;
    v_overall_xp INTEGER;
    v_path_xp INTEGER := 0;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'XP amount must be greater than zero';
    END IF;

    IF p_reward_key IS NULL OR LENGTH(TRIM(p_reward_key)) = 0 THEN
        RAISE EXCEPTION 'Reward key is required';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM user_profile
        WHERE user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    IF p_path_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM enrollment
        WHERE user_id = p_user_id
          AND path_id = p_path_id
    ) THEN
        RAISE EXCEPTION 'Enrollment not found for this learning path';
    END IF;

    INSERT INTO xp_transaction (
        user_id,
        lesson_id,
        quiz_attempt_id,
        question_attempt_id,
        reward_key,
        amount,
        reason
    )
    VALUES (
        p_user_id,
        p_lesson_id,
        p_quiz_attempt_id,
        p_question_attempt_id,
        p_reward_key,
        p_amount,
        p_reason
    )
    ON CONFLICT (user_id, reward_key) DO NOTHING
    RETURNING transaction_id INTO v_transaction_id;

    IF v_transaction_id IS NOT NULL THEN
        UPDATE user_profile
        SET overall_xp = overall_xp + p_amount
        WHERE user_id = p_user_id;

        IF p_path_id IS NOT NULL THEN
            UPDATE enrollment
            SET path_xp = path_xp + p_amount
            WHERE user_id = p_user_id
              AND path_id = p_path_id;
        END IF;

        awarded := TRUE;
        amount := p_amount;
    ELSE
        awarded := FALSE;
        amount := 0;
    END IF;

    SELECT up.overall_xp
    INTO v_overall_xp
    FROM user_profile up
    WHERE up.user_id = p_user_id;

    IF p_path_id IS NOT NULL THEN
        SELECT e.path_xp
        INTO v_path_xp
        FROM enrollment e
        WHERE e.user_id = p_user_id
          AND e.path_id = p_path_id;
    END IF;

    overall_xp := v_overall_xp;
    path_xp := COALESCE(v_path_xp, 0);

    RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.award_xp(
    UUID, INTEGER, TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.award_xp(
    UUID, INTEGER, TEXT, TEXT, BIGINT, BIGINT, BIGINT, BIGINT
) TO service_role;



UPDATE public.quiz
SET
    xp_per_correct = 3,
    perfect_bonus_xp = 5
WHERE quiz_id = 1;








DO $$
DECLARE
    v_user_id UUID := '83d606b8-e1c0-4e7a-a46b-f02b0f3056f5';
    v_quiz_id BIGINT := 1;
    v_attempt_id BIGINT := 1;
    v_lesson_id BIGINT;
    v_path_id BIGINT;
    v_question RECORD;
BEGIN
    -- Get the lesson and learning path connected to this quiz.
    SELECT q.lesson_id, m.path_id
    INTO v_lesson_id, v_path_id
    FROM public.quiz q
    JOIN public.lesson l ON l.lesson_id = q.lesson_id
    JOIN public.module m ON m.module_id = l.module_id
    WHERE q.quiz_id = v_quiz_id;

    IF v_lesson_id IS NULL OR v_path_id IS NULL THEN
        RAISE EXCEPTION 'Could not find the quiz lesson and learning path.';
    END IF;

    -- Award XP for each correctly answered question in the first attempt.
    FOR v_question IN
        SELECT
            qa.question_attempt_id,
            qa.question_id,
            COALESCE(NULLIF(q.xp_reward, 0), qu.xp_per_correct, 0) AS reward
        FROM public.question_attempt qa
        JOIN public.question q
          ON q.question_id = qa.question_id
         AND q.quiz_id = qa.quiz_id
        JOIN public.quiz qu ON qu.quiz_id = qa.quiz_id
        WHERE qa.quiz_attempt_id = v_attempt_id
          AND qa.quiz_id = v_quiz_id
          AND qa.is_correct = TRUE
    LOOP
        IF v_question.reward > 0 THEN
            PERFORM public.award_xp(
                p_user_id := v_user_id,
                p_amount := v_question.reward,
                p_reward_key := 'question:' || v_question.question_id,
                p_reason := 'Correct answer to question ' || v_question.question_id,
                p_lesson_id := v_lesson_id,
                p_quiz_attempt_id := v_attempt_id,
                p_question_attempt_id := v_question.question_attempt_id,
                p_path_id := v_path_id
            );
        END IF;
    END LOOP;

    -- Award the perfect-quiz bonus once.
    IF EXISTS (
        SELECT 1
        FROM public.quiz_attempt
        WHERE quiz_attempt_id = v_attempt_id
          AND user_id = v_user_id
          AND quiz_id = v_quiz_id
          AND is_perfect = TRUE
    ) THEN
        PERFORM public.award_xp(
            p_user_id := v_user_id,
            p_amount := (
                SELECT perfect_bonus_xp
                FROM public.quiz
                WHERE quiz_id = v_quiz_id
            ),
            p_reward_key := 'quiz-perfect:' || v_quiz_id,
            p_reason := 'Perfect score on quiz ' || v_quiz_id,
            p_lesson_id := v_lesson_id,
            p_quiz_attempt_id := v_attempt_id,
            p_question_attempt_id := NULL,
            p_path_id := v_path_id
        );
    END IF;
END $$;






CREATE OR REPLACE FUNCTION public.award_xp(
    p_user_id uuid,
    p_amount integer,
    p_reward_key text,
    p_reason text,
    p_lesson_id bigint DEFAULT NULL,
    p_quiz_attempt_id bigint DEFAULT NULL,
    p_question_attempt_id bigint DEFAULT NULL,
    p_path_id bigint DEFAULT NULL
)
RETURNS TABLE (
    awarded boolean,
    amount integer,
    overall_xp integer,
    path_xp integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_transaction_id BIGINT;
    v_overall_xp INTEGER;
    v_path_xp INTEGER := 0;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'XP amount must be greater than zero';
    END IF;

    IF p_reward_key IS NULL OR LENGTH(TRIM(p_reward_key)) = 0 THEN
        RAISE EXCEPTION 'Reward key is required';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.user_profile up
        WHERE up.user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    IF p_path_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM public.enrollment e
        WHERE e.user_id = p_user_id
          AND e.path_id = p_path_id
    ) THEN
        RAISE EXCEPTION 'Enrollment not found for this learning path';
    END IF;

    INSERT INTO public.xp_transaction (
        user_id,
        lesson_id,
        quiz_attempt_id,
        question_attempt_id,
        reward_key,
        amount,
        reason
    )
    VALUES (
        p_user_id,
        p_lesson_id,
        p_quiz_attempt_id,
        p_question_attempt_id,
        p_reward_key,
        p_amount,
        p_reason
    )
    ON CONFLICT (user_id, reward_key) DO NOTHING
    RETURNING transaction_id INTO v_transaction_id;

    IF v_transaction_id IS NOT NULL THEN
        UPDATE public.user_profile AS up
        SET overall_xp = up.overall_xp + p_amount
        WHERE up.user_id = p_user_id;

        IF p_path_id IS NOT NULL THEN
            UPDATE public.enrollment AS e
            SET path_xp = e.path_xp + p_amount
            WHERE e.user_id = p_user_id
              AND e.path_id = p_path_id;
        END IF;

        awarded := TRUE;
        amount := p_amount;
    ELSE
        awarded := FALSE;
        amount := 0;
    END IF;

    SELECT up.overall_xp
    INTO v_overall_xp
    FROM public.user_profile AS up
    WHERE up.user_id = p_user_id;

    IF p_path_id IS NOT NULL THEN
        SELECT e.path_xp
        INTO v_path_xp
        FROM public.enrollment AS e
        WHERE e.user_id = p_user_id
          AND e.path_id = p_path_id;
    END IF;

    overall_xp := v_overall_xp;
    path_xp := COALESCE(v_path_xp, 0);

    RETURN NEXT;
END;
$function$;








DO $$
DECLARE
    v_user_id UUID :=
        '83d606b8-e1c0-4e7a-a46b-f02b0f3056f5';

    v_lesson_id BIGINT := 1;
    v_path_id BIGINT;
    v_reward RECORD;
BEGIN
    -- Find the learning path containing Lesson 1.
    SELECT m.path_id
    INTO v_path_id
    FROM public.lesson l
    JOIN public.module m
        ON m.module_id = l.module_id
    WHERE l.lesson_id = v_lesson_id;

    IF v_path_id IS NULL THEN
        RAISE EXCEPTION 'Could not find the learning path for Lesson 1.';
    END IF;

    -- Confirm that Lesson 1 is already completed.
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson_progress lp
        WHERE lp.user_id = v_user_id
          AND lp.lesson_id = v_lesson_id
          AND lp.status = 'completed'
    ) THEN
        RAISE EXCEPTION 'Lesson 1 is not marked as completed.';
    END IF;

    -- Ensure all quizzes linked to Lesson 1 have a passing attempt.
    IF EXISTS (
        SELECT 1
        FROM public.lesson_section ls
        WHERE ls.lesson_id = v_lesson_id
          AND ls.quiz_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM public.quiz_attempt qa
              WHERE qa.user_id = v_user_id
                AND qa.quiz_id = ls.quiz_id
                AND qa.passed = TRUE
          )
    ) THEN
        RAISE EXCEPTION
            'A linked quiz has not been passed. No lesson XP awarded.';
    END IF;

    -- Award the lesson XP without duplicating an existing reward.
    SELECT *
    INTO v_reward
    FROM public.award_xp(
        p_user_id := v_user_id,
        p_amount := 10,
        p_reward_key := 'lesson:1',
        p_reason := 'Completed lesson 1',
        p_lesson_id := v_lesson_id,
        p_quiz_attempt_id := NULL,
        p_question_attempt_id := NULL,
        p_path_id := v_path_id
    );

    RAISE NOTICE
        'Awarded: %, Amount: %, Overall XP: %, Path XP: %',
        v_reward.awarded,
        v_reward.amount,
        v_reward.overall_xp,
        v_reward.path_xp;
END $$;

SELECT
    reward_key,
    amount,
    reason
FROM public.xp_transaction
WHERE user_id = '83d606b8-e1c0-4e7a-a46b-f02b0f3056f5'
  AND reward_key = 'lesson:1';































--lessson 2




BEGIN;

DO $lesson2$
DECLARE
    v_quiz_id BIGINT;
    v_max_quiz_id BIGINT;
    v_sequence_name TEXT;
BEGIN
    -- 1. Confirm Lesson 2 exists.
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = 2
    ) THEN
        RAISE EXCEPTION 'Lesson 2 does not exist.';
    END IF;

    -- 2. Stop if Lesson 2 already has sections.
    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = 2
    ) THEN
        RAISE EXCEPTION
            'Lesson 2 already has sections. Stop and inspect existing content.';
    END IF;

    -- 3. Stop if Lesson 2 already has a quiz.
    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = 2
    ) THEN
        RAISE EXCEPTION
            'Lesson 2 already has a quiz. Stop and inspect existing quizzes.';
    END IF;

    -- 4. Synchronise the quiz identity sequence.
    -- This preserves existing quiz rows, including Lesson 1.
    SELECT MAX(quiz_id)
    INTO v_max_quiz_id
    FROM public.quiz;

    v_sequence_name :=
        pg_get_serial_sequence('public.quiz', 'quiz_id');

    IF v_sequence_name IS NOT NULL THEN
        IF v_max_quiz_id IS NULL OR v_max_quiz_id < 1 THEN
            PERFORM setval(v_sequence_name::regclass, 1, false);
        ELSE
            PERFORM setval(
                v_sequence_name::regclass,
                v_max_quiz_id,
                true
            );
        END IF;
    END IF;

    -- 5. Create Lesson 2's quiz.
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
        2,
        NULL,
        1,
        'Lesson 2 Knowledge Check',
        'Answer both questions about informational websites and web applications.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;

    -- 6. Insert sections 1 to 7.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES
    (
        2, 1, 'introduction',
        '1.2.1 Introduction: Websites and Web Applications',
        '{
          "blocks": [
            {
              "type": "paragraph",
              "text": "Websites and web applications are both accessed through web browsers. People sometimes use these terms interchangeably, but they describe different areas of emphasis."
            },
            {
              "type": "paragraph",
              "text": "A traditional informational website mainly presents information for people to read or explore. A web application provides functionality that allows people to complete tasks, enter information, manage records, or interact with a service."
            },
            {
              "type": "paragraph",
              "text": "The distinction is not absolute. Modern websites often include interactive features, and many web applications also contain informational pages. The most useful way to distinguish them is to consider their main purpose and the activities users can perform."
            }
          ]
        }'::jsonb,
        NULL
    ),
    (
        2, 2, 'text',
        '1.2.2 Informational Websites',
        '{
          "blocks": [
            {
              "type": "paragraph",
              "text": "An informational website is mainly designed to present content. Visitors use it to find information, read material, and navigate between pages."
            },
            {
              "type": "list",
              "title": "Examples of informational websites",
              "items": [
                "A restaurant website displaying its menu and opening hours.",
                "A school website presenting its history and contact details.",
                "A news website displaying news articles.",
                "A business website explaining its services."
              ]
            },
            {
              "type": "paragraph",
              "text": "Informational websites can still include navigation menus, links, images, videos, search boxes, and buttons. Having these features does not automatically mean that the entire website is primarily a web application."
            },
            {
              "type": "callout",
              "title": "Remember",
              "text": "Focus on the website main purpose, not simply on whether it contains a clickable element."
            }
          ]
        }'::jsonb,
        NULL
    ),
    (
        2, 3, 'text',
        '1.2.3 Web Applications',
        '{
          "blocks": [
            {
              "type": "paragraph",
              "text": "A web application is software accessed through a web browser that allows users to perform tasks, manipulate information, or interact with a service."
            },
            {
              "type": "list",
              "title": "Examples of web applications",
              "items": [
                "Online banking that lets customers view transactions and make payments.",
                "An online store that lets customers manage a shopping cart and place orders.",
                "An online learning platform that lets learners enrol in courses and track progress.",
                "A booking system that lets users select dates and make appointments."
              ]
            },
            {
              "type": "paragraph",
              "text": "Web applications often communicate with a backend and may use a database to store information. Their architecture depends on what the application needs to do; not every web application has exactly the same structure."
            },
            {
              "type": "example",
              "title": "Example",
              "text": "A learner dashboard that displays enrolled learning paths, records completed lessons, and tracks experience points has application functionality because it works with user-specific information and actions."
            }
          ]
        }'::jsonb,
        NULL
    ),
    (
        2, 4, 'text',
        '1.2.4 Websites versus Web Applications: Comparison',
        '{
          "blocks": [
            {
              "type": "paragraph",
              "text": "The following table describes common patterns. These are general tendencies, not strict rules that apply to every website or web application."
            },
            {
              "type": "list",
              "title": "Main purpose",
              "items": [
                "Informational website: mainly presents information.",
                "Web application: helps users complete tasks or interact with information."
              ]
            },
            {
              "type": "list",
              "title": "Interaction",
              "items": [
                "Informational website: users mainly read content, browse pages, and follow links.",
                "Web application: users may submit data, manage records, and complete workflows."
              ]
            },
            {
              "type": "list",
              "title": "Personalised content",
              "items": [
                "Informational website: personalisation may be limited or unnecessary.",
                "Web application: personalisation is often important because the system responds to the individual user."
              ]
            },
            {
              "type": "list",
              "title": "User accounts",
              "items": [
                "Informational website: accounts are not always needed.",
                "Web application: accounts are common, although some web applications can be used without accounts."
              ]
            },
            {
              "type": "list",
              "title": "Database use",
              "items": [
                "Informational website: a database is not always necessary.",
                "Web application: a database is often used when the application needs to store or retrieve information."
              ]
            },
            {
              "type": "example",
              "title": "Example comparison",
              "text": "A business brochure website that displays a company address is mainly informational. An online learning dashboard that records enrolments and lesson progress provides web application functionality."
            }
          ]
        }'::jsonb,
        NULL
    ),
    (
        2, 5, 'text',
        '1.2.5 Practical Demonstration: A Button with JavaScript',
        '{
          "blocks": [
            {
              "type": "paragraph",
              "text": "This small example demonstrates how a webpage can respond to a user action. It is a simple illustration of interactivity, not a complete web application."
            },
            {
              "type": "example",
              "title": "HTML example",
              "text": "<button onclick=\"alert(''Welcome to CodeXperts!'')\">Start Learning</button>"
            },
            {
              "type": "list",
              "title": "What happens when the button is clicked?",
              "items": [
                "The browser displays a button labelled Start Learning.",
                "The user clicks the button.",
                "The browser runs the JavaScript instruction attached to the click event.",
                "An alert appears displaying Welcome to CodeXperts!"
              ]
            },
            {
              "type": "paragraph",
              "text": "This example demonstrates that a webpage can respond to a user action. However, one interactive button does not automatically make the entire website a full web application. The main purpose and the wider functionality still matter."
            }
          ]
        }'::jsonb,
        NULL
    ),
    (
        2, 6, 'text',
        '1.2.6 Applying the Difference to CodeXperts',
        '{
          "blocks": [
            {
              "type": "paragraph",
              "text": "CodeXperts combines informational content with web application functionality."
            },
            {
              "type": "list",
              "title": "Examples of content-browsing features",
              "items": [
                "Viewing descriptions of programming modules.",
                "Reading lesson explanations and examples.",
                "Browsing information about learning paths."
              ]
            },
            {
              "type": "list",
              "title": "Examples of application features",
              "items": [
                "Creating and using a learner account.",
                "Enrolling in a learning path.",
                "Recording lesson completion and learning progress.",
                "Tracking experience points earned through learning activities."
              ]
            },
            {
              "type": "paragraph",
              "text": "The informational sections help learners understand programming topics. The application features allow the platform to manage user actions and retain information associated with a learner."
            }
          ]
        }'::jsonb,
        NULL
    ),
    (
        2, 7, 'text',
        '1.2.7 Common Misconceptions',
        '{
          "blocks": [
            {
              "type": "list",
              "title": "Mistake 1: Every website needs user accounts",
              "items": [
                "Many informational websites can present their content without requiring visitors to sign in."
              ]
            },
            {
              "type": "list",
              "title": "Mistake 2: Every interactive button makes a website a web application",
              "items": [
                "A button can provide simple interaction on an informational page. Classification depends on the overall purpose and functionality."
              ]
            },
            {
              "type": "list",
              "title": "Mistake 3: Websites and web applications must use completely different technologies",
              "items": [
                "Both can use technologies such as HTML, CSS, and JavaScript. The difference is mainly about purpose and functionality, not a completely separate set of technologies."
              ]
            },
            {
              "type": "callout",
              "title": "Key point",
              "text": "Distinguish an informational website from a web application by considering what the system is mainly designed to help users do."
            }
          ]
        }'::jsonb,
        NULL
    );

    -- 7. Insert section 8 with its quiz_id immediately.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        2, 8, 'quiz',
        '1.2.8 Knowledge Check',
        '{
          "blocks": [
            {
              "type": "paragraph",
              "text": "Answer both multiple-choice questions to check your understanding of the difference between informational websites and web applications. Then complete the written practice questions below."
            },
            {
              "type": "heading",
              "text": "Written practice"
            },
            {
              "type": "list",
              "title": "Answer these questions in your own words",
              "items": [
                "Explain the difference between an informational website and a web application.",
                "Give two examples of informational websites and two examples of web applications.",
                "Identify three CodeXperts features that demonstrate web application functionality.",
                "Explain why the distinction between websites and web applications is not absolute."
              ]
            }
          ]
        }'::jsonb,
        v_quiz_id
    );

    -- 8. Add question 1.
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
        'Which example is the clearest example of a web application?',
        '[
          {"value":"A","label":"A static company page displaying its address"},
          {"value":"B","label":"A system that lets students enrol and track learning progress"},
          {"value":"C","label":"A printed poster showing a company logo"},
          {"value":"D","label":"A desktop wallpaper image"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'A learning system that allows users to enrol and track progress provides functionality for completing tasks and managing user-specific information.',
        0,
        TRUE
    );

    -- 9. Add question 2.
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
        'Must an informational website always have a database?',
        '[
          {"value":"A","label":"Yes. Every website must use a database."},
          {"value":"B","label":"No. An informational website can present content without a database."},
          {"value":"C","label":"Yes. A database is required for every heading and paragraph."},
          {"value":"D","label":"No. A website cannot display information."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'An informational website can use static HTML and other files without a database. A database is useful when the system needs to store or retrieve data, but it is not required for every website.',
        0,
        TRUE
    );

    RAISE NOTICE
        'Lesson 2 content created. New quiz ID: %',
        v_quiz_id;
END
$lesson2$;

COMMIT;




--publishing lesson 2
UPDATE public.lesson
SET status = 'published'
WHERE lesson_id = 2;



BEGIN;

-- Confirm the target lesson exists and is ready for content.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = 3
          AND module_id = 1
          AND lesson_number = 3
          AND slug = 'frontend-backend-full-stack'
    ) THEN
        RAISE EXCEPTION 'Lesson 3 was not found with the expected details.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = 3
    ) THEN
        RAISE EXCEPTION 'Lesson 3 already has sections. Insert cancelled.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = 3
    ) THEN
        RAISE EXCEPTION 'Lesson 3 already has quizzes. Insert cancelled.';
    END IF;
END $$;

-- LESSON 1.3: Frontend, Backend and Full-Stack Development
-- Insert the learning content sections first.

INSERT INTO public.lesson_section
    (lesson_id, display_order, section_type, section_title, section_content, quiz_id)
VALUES

(3, 1, 'introduction',
 'Frontend, Backend and Full-Stack Development',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'A web application is made up of parts that work together. The frontend presents the interface that users interact with, the backend processes requests and applies application rules, and the database stores information that needs to be retained. In this lesson, you will learn what each part does and how they communicate.'
         )
     )
 ), NULL),

(3, 2, 'text',
 'Introduction to the Parts of a Web System',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'A web system commonly includes a frontend, a backend and a database. These parts have different responsibilities, but they work together to provide the user with a complete experience.'
         ),
         jsonb_build_object(
             'type', 'list',
             'title', 'The three main parts',
             'items', jsonb_build_array(
                 'Frontend: displays information and provides controls that users interact with.',
                 'Backend: processes requests, applies rules and coordinates access to data.',
                 'Database: stores and retrieves information that the application needs to keep.'
             )
         ),
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Not every website needs all three parts. A simple static website can display information without a custom backend or database.'
         )
     )
 ), NULL),

(3, 3, 'text',
 'Frontend Development',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Frontend development focuses on the part of a website or web application that users see and interact with. It includes page layouts, navigation, forms, buttons, messages and other interface elements.'
         ),
         jsonb_build_object(
             'type', 'list',
             'title', 'Common frontend technologies',
             'items', jsonb_build_array(
                 'HTML defines the structure and content of a webpage.',
                 'CSS controls presentation, including colours, spacing and layout.',
                 'JavaScript adds behaviour and allows the page to respond to user actions.'
             )
         ),
         jsonb_build_object(
             'type', 'example',
             'title', 'Example: a login form',
             'text', 'A login page displays fields for a username or email and password, along with a sign-in button. The frontend collects the input and sends a request for authentication. The backend must verify the credentials; hiding or disabling a button alone does not provide security.'
         )
     )
 ), NULL),

(3, 4, 'text',
 'Backend Development',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Backend development focuses on processing requests and applying the rules that govern an application. A backend can validate submitted information, check permissions, perform calculations and communicate with a database.'
         ),
         jsonb_build_object(
             'type', 'list',
             'title', 'Common backend responsibilities',
             'items', jsonb_build_array(
                 'Receive and process requests from the frontend.',
                 'Validate input and enforce application rules.',
                 'Check authentication and authorisation where required.',
                 'Read or update information in the database.',
                 'Return an appropriate response to the frontend.'
             )
         ),
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Node.js can be used to build a backend with JavaScript. Other backend technologies include C#, Java and Python. The technology selected depends on the project requirements.'
         ),
         jsonb_build_object(
             'type', 'callout',
             'title', 'Security reminder',
             'text', 'Database passwords, service-role keys and other privileged credentials must not be exposed in browser-side code. Keep them in protected server-side configuration.'
         )
     )
 ), NULL),

(3, 5, 'text',
 'Databases and Persistent Information',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'A database stores information so that it can be retrieved and managed later. Examples include user profiles, learning paths, lesson progress, quiz results and rewards.'
         ),
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'When a learner enrols in a programming course, the application may save the learner ID, the selected learning path, the enrolment date and the enrolment status. The information can then be retrieved when the learner returns.'
         ),
         jsonb_build_object(
             'type', 'example',
             'title', 'Example: persistent enrolment',
             'text', 'A learner selects Python and confirms enrolment. The backend validates the request and saves the enrolment in the database. When the learner opens the dashboard later, the application retrieves the saved enrolment and displays Python as one of the learner’s paths.'
         )
     )
 ), NULL),

(3, 6, 'text',
 'How the Parts Work Together',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'In a typical web application, the frontend sends a request to the backend. The backend checks the request, performs the required processing and may communicate with the database. It then returns a response that the frontend uses to update the interface.'
         ),
         jsonb_build_object(
             'type', 'list',
             'title', 'A typical request-and-response cycle',
             'items', jsonb_build_array(
                 'The user performs an action on the frontend.',
                 'The frontend sends a request to a backend endpoint.',
                 'The backend validates the request and checks permissions.',
                 'The backend reads or updates the database when needed.',
                 'The backend returns a response.',
                 'The frontend displays the result to the user.'
             )
         ),
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Some requests do not need database access. For example, the backend might calculate a value and return it directly. The exact process depends on the task being performed.'
         )
     )
 ), NULL),

(3, 7, 'text',
 'Example: Enrolling in a Learning Path',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Imagine that CodeXperts allows a learner to enrol in a Java learning path. The learner uses the frontend to choose Java and select the enrolment button. The frontend sends the request to the backend, which checks the request and saves the enrolment if it is valid.'
         ),
         jsonb_build_object(
             'type', 'list',
             'title', 'Responsibilities in this example',
             'items', jsonb_build_array(
                 'Frontend: displays the available learning paths and the enrolment button.',
                 'Backend: checks the request and applies the enrolment rules.',
                 'Database: stores the learner’s Java enrolment.',
                 'Frontend: displays a confirmation after receiving the response.'
             )
         ),
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Separating these responsibilities makes the system easier to maintain. It also allows the backend to apply important rules rather than relying only on what the frontend displays.'
         )
     )
 ), NULL),

(3, 8, 'text',
 'Full-Stack Development',
 jsonb_build_object(
     'blocks', jsonb_build_array(
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'Full-stack development involves working across both frontend and backend parts of an application. A full-stack developer may build user interfaces, create backend endpoints, connect to a database and test how the parts work together.'
         ),
         jsonb_build_object(
             'type', 'list',
             'title', 'Comparing development roles',
             'items', jsonb_build_array(
                 'Frontend developer: focuses mainly on the user interface and browser-side behaviour.',
                 'Backend developer: focuses mainly on server-side processing, application rules and data access.',
                 'Full-stack developer: works across frontend and backend responsibilities and their integration.'
             )
         ),
         jsonb_build_object(
             'type', 'paragraph',
             'text', 'These roles can overlap. The names describe areas of focus rather than meaning that developers can never work outside their main area.'
         )
     )
 ), NULL);

-- Create the lesson practice quiz, link its section and insert its questions.
-- The quiz is created as a draft and awards XP through the quiz settings.
-- Individual question XP is zero to avoid duplicate XP awards.

WITH new_quiz AS (
    INSERT INTO public.quiz
        (lesson_id, module_id, quiz_number, title, instructions,
         quiz_type, pass_mark, xp_per_correct, perfect_bonus_xp, status)
    VALUES
        (3, NULL, 1, 'Lesson 1.3 Knowledge Check',
         'Answer every question. Select one answer for each question.',
         'practice', 50, 3, 5, 'draft')
    RETURNING quiz_id
),
quiz_section AS (
    INSERT INTO public.lesson_section
        (lesson_id, display_order, section_type, section_title, section_content, quiz_id)
    SELECT
        3,
        9,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Answer all three questions to check your understanding of frontend, backend and full-stack development.'
                )
            )
        ),
        new_quiz.quiz_id
    FROM new_quiz
    RETURNING section_id
)
INSERT INTO public.question
    (quiz_id, display_order, question_type, prompt, options,
     evaluation, explanation, xp_reward, is_required)
SELECT
    new_quiz.quiz_id,
    question_data.display_order,
    'multiple_choice',
    question_data.prompt,
    question_data.options::jsonb,
    question_data.evaluation::jsonb,
    question_data.explanation,
    0,
    TRUE
FROM new_quiz
CROSS JOIN (
    VALUES
    (
        1,
        'Which part of a web application is mainly responsible for displaying the user interface?',
        '[{"value":"A","label":"Frontend"},{"value":"B","label":"Database"},{"value":"C","label":"Backend"},{"value":"D","label":"Web hosting service"}]',
        '{"correct_answer":"A"}',
        'The frontend displays the interface and provides the controls users interact with.'
    ),
    (
        2,
        'Where should privileged database credentials be kept in a web application?',
        '[{"value":"A","label":"Inside public frontend JavaScript"},{"value":"B","label":"In protected server-side configuration"},{"value":"C","label":"In a visible webpage comment"},{"value":"D","label":"In a public repository file"}]',
        '{"correct_answer":"B"}',
        'Privileged credentials must be protected on the server and must not be exposed to browser users or stored in public source files.'
    ),
    (
        3,
        'What best describes full-stack development?',
        '[{"value":"A","label":"Working only on webpage colours and layout"},{"value":"B","label":"Working across frontend and backend parts of an application"},{"value":"C","label":"Managing only the database server"},{"value":"D","label":"Creating designs without implementing application behaviour"}]',
        '{"correct_answer":"B"}',
        'Full-stack development involves work across frontend and backend responsibilities, including how those parts integrate.'
    )
) AS question_data(display_order, prompt, options, evaluation, explanation);

COMMIT;





















BEGIN;

-- Confirm Lesson 4 exists and has no existing content or quiz.
DO $lesson4$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = 4
          AND module_id = 1
          AND lesson_number = 4
          AND slug = 'browsers-and-web-servers'
    ) THEN
        RAISE EXCEPTION 'Lesson 4 was not found or its details do not match.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = 4
    ) THEN
        RAISE EXCEPTION 'Lesson 4 already has sections. No content was inserted.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = 4
    ) THEN
        RAISE EXCEPTION 'Lesson 4 already has a quiz. No content was inserted.';
    END IF;
END;
$lesson4$;

-- LESSON 1.4: How Browsers and Web Servers Communicate

INSERT INTO public.lesson_section
    (lesson_id, display_order, section_type, section_title, section_content, quiz_id)
VALUES

(4, 1, 'introduction', 'How Browsers and Web Servers Communicate',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'When a person opens a website, the browser and a web server exchange messages. The browser commonly sends a request for a resource or action, and the server returns a response. The browser then processes the response and displays or uses the result.'
    )
 )), NULL),

(4, 2, 'text', 'The Request-and-Response Cycle',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'list',
        'title', 'Five basic steps',
        'items', jsonb_build_array(
            'The user enters an address or selects a link.',
            'The browser sends a request to the relevant server.',
            'The server processes the request.',
            'The server sends a response containing a status and possibly HTML, images, JSON or other data.',
            'The browser processes the response and may request additional resources such as CSS, JavaScript files and images.'
        )
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'A page often requires several requests rather than a single message. The browser may retrieve the main document and then request stylesheets, scripts, images and data separately.'
    )
  )), NULL),

(4, 3, 'text', 'What Is a Request?',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'A request is a message asking a server for a resource or asking it to process an action. A request commonly includes a URL, an HTTP method and headers. Some requests also include a body containing submitted data.'
    ),
    jsonb_build_object(
        'type', 'example',
        'title', 'Simplified request',
        'text', E'GET /admissions HTTP/1.1\nHost: university.example'
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'This illustrative request asks for the /admissions resource. GET is an HTTP method commonly used to retrieve a resource. HTTP methods are introduced further in the next lesson.'
    )
  )), NULL),

(4, 4, 'text', 'What Is a Response?',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'A response is the server’s reply to a request. It normally contains a status line, headers and possibly a response body.'
    ),
    jsonb_build_object(
        'type', 'example',
        'title', 'Simplified response',
        'text', E'HTTP/1.1 200 OK\nContent-Type: text/html\n\nAdmissions information is available here.'
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'This is a simplified teaching example, not a complete HTML document. The status 200 OK indicates that the request succeeded. Other status codes can indicate redirection, a client-side problem or a server-side problem.'
    )
  )), NULL),

(4, 5, 'text', 'Inspecting Requests in Browser Developer Tools',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'list',
        'title', 'Activity',
        'items', jsonb_build_array(
            'Open Chrome, Firefox or Edge.',
            'Visit a website you are permitted to inspect.',
            'Right-click the page and select Inspect, or open Developer Tools using the browser menu.',
            'Open the Network panel and refresh the page.',
            'Inspect the listed resources, such as the document, CSS, JavaScript, images and data requests.'
        )
    ),
    jsonb_build_object(
        'type', 'callout',
        'title', 'Safety',
        'text', 'Inspect sites you are allowed to use. Do not modify or send unauthorised requests to systems you do not own or have permission to test.'
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'Panel names and layouts can vary between browsers. The Network panel helps you see requests and responses made while a page loads.'
    )
  )), NULL),

(4, 6, 'text', 'Common Misconceptions',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'list',
        'title', 'Remember',
        'items', jsonb_build_array(
            'A server does not always send everything in one message; pages commonly load multiple resources.',
            'A successful network request does not guarantee that the application behaves correctly.',
            'The browser is the client displaying and processing content; it is not the web server.'
        )
    )
  )), NULL),

(4, 7, 'text', 'Written Practice',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'list',
        'title', 'Answer in your own words',
        'items', jsonb_build_array(
            'Define a browser request and a server response.',
            'Describe the five basic steps in browser-server communication.',
            'Explain why a webpage may generate multiple requests.',
            'Explain how to use the Network panel to inspect requests.'
        )
    )
  )), NULL);

-- Create the Lesson 4 practice quiz and link it to the lesson page.
WITH q AS (
    INSERT INTO public.quiz
        (lesson_id, module_id, quiz_number, title, instructions,
         quiz_type, pass_mark, xp_per_correct, perfect_bonus_xp, status)
    VALUES
        (4, NULL, 1, 'Lesson 1.4 Knowledge Check',
         'Answer every question. Select one answer for each question.',
         'practice', 50, 0, 0, 'draft')
    RETURNING quiz_id
),
s AS (
    INSERT INTO public.lesson_section
        (lesson_id, display_order, section_type, section_title,
         section_content, quiz_id)
    SELECT
        4,
        8,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Check your understanding of requests, responses and browser tools.'
                )
            )
        ),
        q.quiz_id
    FROM q
    RETURNING section_id
)
INSERT INTO public.question
    (quiz_id, display_order, question_type, prompt, options,
     evaluation, explanation, xp_reward, is_required)
SELECT
    q.quiz_id,
    v.display_order,
    'multiple_choice',
    v.prompt,
    v.options::jsonb,
    v.evaluation::jsonb,
    v.explanation,
    0,
    TRUE
FROM q
CROSS JOIN (
    VALUES
    (
        1,
        'In a typical browser-server exchange, what does the browser send first to ask for a resource?',
        '[{"value":"A","label":"A request"},{"value":"B","label":"A database table"},{"value":"C","label":"A screenshot of the server"},{"value":"D","label":"A completed server response"}]',
        '{"correct_answer":"A"}',
        'The browser sends a request asking the server for a resource or action.'
    ),
    (
        2,
        'What does a web server normally send back after processing a request?',
        '[{"value":"A","label":"A response"},{"value":"B","label":"A keyboard command"},{"value":"C","label":"A physical network cable"},{"value":"D","label":"A browser window"}]',
        '{"correct_answer":"A"}',
        'The server replies with a response containing a status and possibly headers and content.'
    ),
    (
        3,
        'Which Developer Tools panel is useful for inspecting page requests and responses?',
        '[{"value":"A","label":"Calculator"},{"value":"B","label":"Network"},{"value":"C","label":"Wallpaper settings"},{"value":"D","label":"Music player"}]',
        '{"correct_answer":"B"}',
        'The Network panel lists requests made by the page and details about their responses.'
    )
) AS v(display_order, prompt, options, evaluation, explanation);

COMMIT;




BEGIN;

UPDATE public.lesson
SET status = 'published'
WHERE lesson_id = 4
  AND module_id = 1
  AND lesson_number = 4
  AND slug = 'browsers-and-web-servers';

UPDATE public.quiz
SET status = 'published'
WHERE lesson_id = 4
  AND module_id IS NULL
  AND title = 'Lesson 1.4 Knowledge Check'
  AND quiz_number = 1;

COMMIT;









BEGIN;

-- Confirm Lesson 1.5 exists and has not already been populated.
DO $lesson5$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = 5
          AND module_id = 1
          AND lesson_number = 5
          AND title = 'HTTP and HTTPS'
    ) THEN
        RAISE EXCEPTION
            'Lesson 1.5 was not found with the expected lesson ID, module, number and title.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = 5
    ) OR EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = 5
    ) THEN
        RAISE EXCEPTION
            'Lesson 1.5 already contains sections or quizzes. No new content was inserted.';
    END IF;
END;
$lesson5$;

-- LESSON 1.5: HTTP AND HTTPS
-- Seven learning sections; Written Practice is intentionally excluded.

INSERT INTO public.lesson_section
    (lesson_id, display_order, section_type, section_title, section_content, quiz_id)
VALUES

(5, 1, 'introduction', 'Introduction to HTTP and HTTPS',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'Browsers and web servers need agreed rules for exchanging information. One of the main protocols used for this is HTTP, which stands for Hypertext Transfer Protocol. HTTPS is HTTP communicated over a connection protected by TLS (Transport Layer Security). Website addresses often begin with http:// or https://.'
    )
 )), NULL),

(5, 2, 'text', 'What Is HTTP?',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'HTTP defines how clients and servers communicate about web resources. A browser can use HTTP to request a webpage, and a web application can use HTTP to request data from a backend.'
    ),
    jsonb_build_object(
        'type', 'list',
        'title', 'HTTP defines concepts such as',
        'items', jsonb_build_array(
            'Request methods.',
            'Response status codes.',
            'Headers.',
            'Message bodies.'
        )
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'HTTP does not, by itself, provide the confidentiality and integrity protections associated with HTTPS.'
    )
 )), NULL),

(5, 3, 'text', 'What Is HTTPS?',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'HTTPS uses TLS to protect HTTP communication in transit. When correctly configured and validated, HTTPS helps provide confidentiality, integrity and authentication.'
    ),
    jsonb_build_object(
        'type', 'list',
        'title', 'Protections provided by TLS',
        'items', jsonb_build_array(
            'Confidentiality: helps prevent unauthorised parties on the network from easily reading exchanged content.',
            'Integrity: helps detect unauthorised modification of data in transit.',
            'Authentication: helps the browser verify that it is communicating with the server identified by the certificate.'
        )
    ),
    jsonb_build_object(
        'type', 'callout',
        'title', 'HTTPS does not guarantee trustworthiness',
        'text', 'HTTPS is essential for login pages, online banking, shopping and other situations involving sensitive information. However, a fraudulent website can also use HTTPS, and a secure connection does not guarantee that the application is free of vulnerabilities.'
    )
 )), NULL),

(5, 4, 'text', 'HTTP versus HTTPS',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'list',
        'title', 'Compare HTTP and HTTPS',
        'items', jsonb_build_array(
            'Communication protocol: HTTP uses HTTP; HTTPS uses HTTP over TLS.',
            'Protection in transit: HTTP has no TLS protection by itself; HTTPS provides encryption and integrity protection through TLS.',
            'Server identity verification: HTTP does not provide TLS certificate verification; HTTPS uses certificate-based verification.',
            'Sensitive modern web traffic: HTTP is not recommended; HTTPS is recommended.'
        )
    )
 )), NULL),

(5, 5, 'text', 'HTTP Methods: A First Look',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'HTTP methods indicate the intended action of a request.'
    ),
    jsonb_build_object(
        'type', 'list',
        'title', 'Common HTTP methods',
        'items', jsonb_build_array(
            'GET: retrieve information.',
            'POST: submit information or request processing.',
            'PATCH: partially update a resource.',
            'DELETE: request deletion of a resource.'
        )
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'These methods do not guarantee that an operation will succeed. The server must still process the request and return an appropriate response.'
    )
 )), NULL),

(5, 6, 'text', 'Understanding HTTP Status Codes',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'list',
        'title', 'Common status codes',
        'items', jsonb_build_array(
            '200 OK: a page or data request succeeded.',
            '201 Created: a resource was successfully created.',
            '301 Moved Permanently: a resource has a permanent redirect.',
            '400 Bad Request: the request was invalid or malformed.',
            '401 Unauthorized: valid authentication is missing or required.',
            '403 Forbidden: the request is not permitted.',
            '404 Not Found: the requested resource could not be found.',
            '500 Internal Server Error: the server encountered an unexpected problem.'
        )
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'The exact meaning depends on the request and the application implementation. An application may use a particular error response to indicate that a submitted value is invalid.'
    )
 )), NULL),

(5, 7, 'text', 'Practical Activity: Identify HTTPS',
 jsonb_build_object('blocks', jsonb_build_array(
    jsonb_build_object(
        'type', 'list',
        'title', 'Activity steps',
        'items', jsonb_build_array(
            'Open your browser.',
            'Visit a reputable website that uses HTTPS.',
            'Inspect the address bar.',
            'Identify the https:// prefix.',
            'Open the browser connection or site-information controls to view security information.'
        )
    ),
    jsonb_build_object(
        'type', 'paragraph',
        'text', 'Browser interfaces vary. The goal is to recognise that HTTPS protects communication between the browser and the website server.'
    )
 )), NULL);

-- Create the lesson-level practice quiz.
-- module_id must be NULL for this type of quiz.

WITH new_quiz AS (
    INSERT INTO public.quiz
        (lesson_id, module_id, quiz_number, title, instructions,
         quiz_type, pass_mark, xp_per_correct, perfect_bonus_xp, status)
    VALUES
        (5, NULL, 1, 'Lesson 1.5 Knowledge Check',
         'Answer every question. Select one answer for each question.',
         'practice', 50, 0, 0, 'draft')
    RETURNING quiz_id
),
quiz_section AS (
    INSERT INTO public.lesson_section
        (lesson_id, display_order, section_type, section_title,
         section_content, quiz_id)
    SELECT
        5,
        8,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Check your understanding of HTTP, HTTPS, HTTP methods and status codes. Answer all three questions.'
                )
            )
        ),
        new_quiz.quiz_id
    FROM new_quiz
)
INSERT INTO public.question
    (quiz_id, display_order, question_type, prompt, options,
     evaluation, explanation, xp_reward, is_required)
SELECT
    new_quiz.quiz_id,
    q.display_order,
    'multiple_choice',
    q.prompt,
    q.options::jsonb,
    q.evaluation::jsonb,
    q.explanation,
    0,
    TRUE
FROM new_quiz
CROSS JOIN (
    VALUES
    (
        1,
        'What does HTTPS add to HTTP?',
        '[{"value":"A","label":"TLS protection for communication in transit"},{"value":"B","label":"A guarantee that the website is honest"},{"value":"C","label":"A database for every website"},{"value":"D","label":"A guarantee that the application has no bugs"}]',
        '{"correct_answer":"A"}',
        'HTTPS uses TLS to help protect confidentiality, integrity and authentication of the connection.'
    ),
    (
        2,
        'Which HTTP method is commonly used to retrieve information?',
        '[{"value":"A","label":"DELETE"},{"value":"B","label":"GET"},{"value":"C","label":"PATCH"},{"value":"D","label":"POST"}]',
        '{"correct_answer":"B"}',
        'GET is commonly used to retrieve information or a resource.'
    ),
    (
        3,
        'What does HTTP status code 404 commonly indicate?',
        '[{"value":"A","label":"The resource was not found"},{"value":"B","label":"The resource was created successfully"},{"value":"C","label":"The connection is encrypted"},{"value":"D","label":"The request succeeded"}]',
        '{"correct_answer":"A"}',
        '404 Not Found commonly indicates that the requested resource could not be found.'
    )
) AS q(display_order, prompt, options, evaluation, explanation);

COMMIT;






BEGIN;

UPDATE public.lesson
SET status = 'published'
WHERE lesson_id = 5
  AND module_id = 1
  AND lesson_number = 5
  AND title = 'HTTP and HTTPS';

UPDATE public.quiz
SET status = 'published'
WHERE lesson_id = 5
  AND module_id IS NULL
  AND title = 'Lesson 1.5 Knowledge Check'
  AND quiz_number = 1;

COMMIT;










--lesson 6

BEGIN;

DO $lesson6$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = 6
          AND module_id = 1
          AND lesson_number = 6
          AND title = 'Domains, URLs, Web Hosting and DNS Basics'
    ) THEN
        RAISE EXCEPTION 'Lesson 6 was not found or its details do not match.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = 6
    ) OR EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = 6
    ) THEN
        RAISE EXCEPTION 'Lesson 6 already has sections or a quiz. Nothing was inserted.';
    END IF;
END;
$lesson6$;

WITH new_sections AS (
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES
    (
        6, 1, 'introduction', 'Introduction to Domains, URLs, Web Hosting and DNS',
        '{"blocks":[{"type":"paragraph","text":"When you visit a website, several parts work together to help your browser find and display the correct resources. Domains, URLs, web hosting and DNS each have a different role in this process."},{"type":"callout","title":"Lesson goal","text":"Understand how website addresses, domain names, DNS and hosting work together."}]}'::jsonb
    ),
    (
        6, 2, 'text', 'What Is a Domain Name?',
        '{"blocks":[{"type":"paragraph","text":"A domain name is a readable name used to identify a website on the internet. It is easier to remember a domain name such as example.com than a numerical IP address."},{"type":"paragraph","text":"A domain name helps people locate a website, but it does not contain the website itself."},{"type":"callout","title":"Example","text":"learn.example.com is a domain name that can be used to identify a website or service."}]}'::jsonb
    ),
    (
        6, 3, 'text', 'What Is a URL?',
        '{"blocks":[{"type":"paragraph","text":"A Uniform Resource Locator (URL) identifies the location of a resource and explains how the browser should access it."},{"type":"paragraph","text":"A URL can contain a scheme, hostname, path and query string."},{"type":"list","items":[{"label":"Scheme","text":"https:// indicates the protocol used to access the resource."},{"label":"Hostname","text":"learn.example.com identifies the host."},{"label":"Path","text":"/courses/html identifies a resource path on the host."},{"label":"Query string","text":"?level=beginner supplies additional information to the request."}]},{"type":"callout","title":"Example URL","text":"https://learn.example.com/courses/html?level=beginner"}]}'::jsonb
    ),
    (
        6, 4, 'text', 'What Is Web Hosting?',
        '{"blocks":[{"type":"paragraph","text":"Web hosting provides the infrastructure and services used to make a website’s files and resources available over a network."},{"type":"paragraph","text":"Depending on how a website is built, its resources may include HTML, CSS, JavaScript, images and other files. A web application may also rely on a backend server and database."},{"type":"callout","title":"Remember","text":"A domain is the readable address; hosting provides the infrastructure that makes website resources available."}]}'::jsonb
    ),
    (
        6, 5, 'text', 'What Is DNS?',
        '{"blocks":[{"type":"paragraph","text":"The Domain Name System (DNS) helps translate domain names into the internet addressing information needed to locate services."},{"type":"paragraph","text":"When you enter a domain name, your device may use DNS to find the IP address associated with the hostname. The browser can then connect to the appropriate server."},{"type":"list","items":[{"label":"1. Enter a URL","text":"The user enters a website address in the browser."},{"label":"2. Resolve the hostname","text":"DNS helps find the associated IP address."},{"label":"3. Connect","text":"The browser connects to the server."},{"label":"4. Request a resource","text":"The browser sends an HTTP or HTTPS request."},{"label":"5. Receive a response","text":"The server responds with the requested resource or another result."}]}]}'::jsonb
    ),
    (
        6, 6, 'text', 'How Domains, DNS and Hosting Work Together',
        '{"blocks":[{"type":"paragraph","text":"These components solve different parts of accessing a website. The domain name gives people a readable address, DNS helps locate the relevant server, and hosting infrastructure makes the website resources available."},{"type":"list","items":[{"label":"Domain name","text":"Provides a readable name for the website."},{"label":"DNS","text":"Helps resolve the hostname to internet addressing information."},{"label":"Web hosting","text":"Provides infrastructure for making website resources available."},{"label":"URL","text":"Identifies the resource the browser is trying to access."}]},{"type":"callout","title":"Key idea","text":"These components work together, but they are not interchangeable."}]}'::jsonb
    ),
    (
        6, 7, 'text', 'Practical Activity: Read a URL',
        '{"blocks":[{"type":"paragraph","text":"Examine this URL: https://learn.example.com/courses/html?level=beginner"},{"type":"list","items":[{"label":"Scheme","text":"https"},{"label":"Hostname","text":"learn.example.com"},{"label":"Path","text":"/courses/html"},{"label":"Query string","text":"level=beginner"}]},{"type":"paragraph","text":"Practise identifying each part of a URL and explaining how DNS and web hosting contribute to accessing the website."}]}'::jsonb
    )
    RETURNING section_id
),
new_quiz AS (
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
        6,
        NULL,
        1,
        'Lesson 1.6 Knowledge Check',
        'Answer every question. Select one answer for each question.',
        'practice',
        50,
        0,
        0,
        'draft'
    )
    RETURNING quiz_id
),
quiz_section AS (
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content,
        quiz_id
    )
    SELECT
        6,
        8,
        'quiz',
        'Knowledge Check',
        '{"blocks":[{"type":"paragraph","text":"Check your understanding of domains, URLs, web hosting and DNS."}]}'::jsonb,
        quiz_id
    FROM new_quiz
    RETURNING section_id
)
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
SELECT
    new_quiz.quiz_id,
    questions.display_order,
    'multiple_choice',
    questions.prompt,
    questions.options::jsonb,
    questions.evaluation::jsonb,
    questions.explanation,
    0,
    TRUE
FROM new_quiz
CROSS JOIN (
    VALUES
    (
        1,
        'What is the main purpose of DNS?',
        '[{"label":"A","text":"To help resolve domain names to internet addressing information"},{"label":"B","text":"To write HTML code for websites"},{"label":"C","text":"To create databases for every website"}]',
        '{"correct_answer":"A"}',
        'DNS helps resolve hostnames to the addressing information needed to locate internet services.'
    ),
    (
        2,
        'What is web hosting used for?',
        '[{"label":"A","text":"To make website resources available through hosting infrastructure"},{"label":"B","text":"To replace the web browser"},{"label":"C","text":"To choose passwords for website users"}]',
        '{"correct_answer":"A"}',
        'Web hosting provides infrastructure and services that make website resources available.'
    ),
    (
        3,
        'In the URL https://learn.example.com/courses/html?level=beginner, what is /courses/html?',
        '[{"label":"A","text":"The hostname"},{"label":"B","text":"The path"},{"label":"C","text":"The scheme"}]',
        '{"correct_answer":"B"}',
        'The path is /courses/html. The scheme is https, and the hostname is learn.example.com.'
    )
) AS questions(display_order, prompt, options, evaluation, explanation);

COMMIT;



BEGIN;

UPDATE public.lesson
SET status = 'published'
WHERE lesson_id = 6
  AND module_id = 1
  AND lesson_number = 6
  AND title = 'Domains, URLs, Web Hosting and DNS Basics';

UPDATE public.quiz
SET status = 'published'
WHERE lesson_id = 6
  AND module_id IS NULL
  AND title = 'Lesson 1.6 Knowledge Check'
  AND quiz_number = 1;

COMMIT;








--lesson 7

DO $$
DECLARE
    v_lesson_id INTEGER := 7;
    v_quiz_id INTEGER;
BEGIN
    -- Stop if Lesson 7 is missing or its content already exists.
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = v_lesson_id
          AND module_id = 1
          AND lesson_number = 7
    ) THEN
        RAISE EXCEPTION 'Lesson 7 was not found in module 1.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION 'Lesson 7 already has sections. No changes were made.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION 'Lesson 7 already has a quiz. No changes were made.';
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
        'Lesson 1.7 Knowledge Check',
        'Answer all three questions about HTML, CSS and JavaScript.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;

    -- Section 1: Introduction
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 1, 'text', 'Introduction',
        jsonb_build_object(
            'content',
            'Websites use different technologies to perform different jobs. HTML provides the structure of a page, CSS controls its appearance, and JavaScript adds behaviour and interaction. Understanding these roles helps you know which technology to use when building a website.'
        )
    );

    -- Section 2: HTML
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 2, 'text', 'HTML: Structure and Content',
        jsonb_build_object(
            'content',
            'HTML stands for HyperText Markup Language. It describes the structure and meaning of webpage content. Headings, paragraphs, links, images, lists, forms and buttons can all be represented using HTML elements. For example, an h1 element represents a main heading, while a p element represents a paragraph.'
        )
    );

    -- Section 3: CSS
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 3, 'text', 'CSS: Appearance and Layout',
        jsonb_build_object(
            'content',
            'CSS stands for Cascading Style Sheets. It controls how webpage content looks and is arranged. CSS can change colours, fonts, spacing, borders, sizes and layouts. For example, a CSS rule can make a heading blue or arrange cards in columns without changing the HTML content itself.'
        )
    );

    -- Section 4: JavaScript
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 4, 'text', 'JavaScript: Behaviour and Interaction',
        jsonb_build_object(
            'content',
            'JavaScript is a programming language that can make webpages respond to user actions. It can react to button clicks, validate form input, update page content and display messages. For example, JavaScript can show a welcome message when a visitor clicks a button.'
        )
    );

    -- Section 5: How the technologies work together
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 5, 'text', 'How HTML, CSS and JavaScript Work Together',
        jsonb_build_object(
            'content',
            'These technologies often work together on the same page. HTML creates a button, CSS styles the button, and JavaScript can respond when the button is clicked. Each technology has a different main responsibility, but combining them helps developers create complete and interactive websites.'
        )
    );

    -- Section 6: Practical example
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 6, 'text', 'A Simple Practical Example',
        jsonb_build_object(
            'content',
            'Imagine a webpage with a button labelled Say Hello. HTML creates the button element. CSS gives it a background colour, padding and rounded corners. JavaScript listens for a click and displays the message Hello, welcome to the website! This example shows how structure, appearance and behaviour can be handled separately.'
        )
    );

    -- Section 7: Summary
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 7, 'text', 'Lesson Summary',
        jsonb_build_object(
            'content',
            'Remember the main roles: HTML structures webpage content, CSS controls its appearance and layout, and JavaScript adds behaviour and interaction. When deciding which technology to use, identify whether you need to change the content structure, the visual presentation, or how the page responds to the user.'
        )
    );

    -- Section 8: Knowledge Check
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 8, 'quiz', 'Knowledge Check',
        jsonb_build_object(
            'content',
            'Test your understanding of the main roles of HTML, CSS and JavaScript.'
        ),
        v_quiz_id
    );

    -- Question 1
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'Which technology primarily defines the structure and content of a web page?',
        '[
            {"label":"A","text":"HTML"},
            {"label":"B","text":"CSS"},
            {"label":"C","text":"JavaScript"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'HTML uses elements to represent webpage structure and content, such as headings, paragraphs, links and images.',
        3,
        TRUE
    );

    -- Question 2
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which technology is mainly used to style webpage elements and control their appearance?',
        '[
            {"label":"A","text":"HTML"},
            {"label":"B","text":"CSS"},
            {"label":"C","text":"JavaScript"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'CSS controls presentation, including colours, fonts, spacing, borders and layout.',
        3,
        TRUE
    );

    -- Question 3
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'Which technology can respond to a button click by changing content on a webpage?',
        '[
            {"label":"A","text":"JavaScript"},
            {"label":"B","text":"CSS"},
            {"label":"C","text":"HTML alone"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'JavaScript can handle click events and update webpage content in response to user actions.',
        3,
        TRUE
    );

    RAISE NOTICE 'Lesson 7 content and draft quiz created. Quiz ID: %', v_quiz_id;
END $$;




UPDATE public.quiz
SET status = 'published'
WHERE quiz_id = 9
  AND lesson_id = 7
  AND status = 'draft';

  








--lesson 8

DO $$
DECLARE
    v_lesson_id INTEGER := 8;
    v_quiz_id INTEGER;
BEGIN
    -- Confirm Lesson 8 exists in the expected module.
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = v_lesson_id
          AND module_id = 1
          AND lesson_number = 8
    ) THEN
        RAISE EXCEPTION 'Lesson 8 was not found in module 1.';
    END IF;

    -- Prevent duplicate content or quizzes.
    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION 'Lesson 8 already has sections. No changes were made.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION 'Lesson 8 already has a quiz. No changes were made.';
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
        'Lesson 1.8 Knowledge Check',
        'Answer all three questions about planning and building a simple web page.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;

    -- Section 1: Introduction
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 1, 'text', 'Introduction',
        jsonb_build_object(
            'content',
            'Before building a webpage, it helps to understand what the page should do and what information it should contain. Planning first makes development easier because you can organise the content, decide how users will move through the page, and identify the HTML, CSS and JavaScript features you may need.'
        )
    );

    -- Section 2: Understand the purpose
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 2, 'text', 'Understand the Purpose of the Page',
        jsonb_build_object(
            'content',
            'Start by identifying the purpose of the webpage and its intended users. For example, a personal portfolio introduces a person and displays their work, while a contact page helps visitors find contact information. Knowing the purpose helps you decide which content and features are necessary.'
        )
    );

    -- Section 3: Organise the content
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 3, 'text', 'Organise the Content',
        jsonb_build_object(
            'content',
            'List the information that the page needs and group related items together. A simple page might contain a heading, an introduction, a section about the topic, an image and a footer. Clear headings and paragraphs help users understand the information and make the page easier to read.'
        )
    );

    -- Section 4: Create a basic HTML structure
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 4, 'text', 'Create a Basic HTML Structure',
        jsonb_build_object(
            'content',
            'A basic HTML document normally includes a doctype declaration, an html element, a head element and a body element. The head contains information about the document, such as its title and character encoding. The body contains the content that appears on the page, including headings, paragraphs, links and images.'
        )
    );

    -- Section 5: Add semantic elements
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 5, 'text', 'Use Suitable HTML Elements',
        jsonb_build_object(
            'content',
            'Choose HTML elements that describe the type of content they contain. Use headings for titles, paragraphs for blocks of text, links for navigation and lists for related items. Elements such as header, nav, main, section and footer can help organise the main areas of a page and make its structure clearer.'
        )
    );

    -- Section 6: Style and test the page
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 6, 'text', 'Style and Test the Page',
        jsonb_build_object(
            'content',
            'After adding the HTML structure, use CSS to improve the page appearance. Set readable fonts, suitable colours, spacing and a layout that works on different screen sizes. Open the page in a browser to check the result. Test links and interactive features, and use the browser Developer Tools to investigate problems.'
        )
    );

    -- Section 7: Summary
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 7, 'text', 'Lesson Summary',
        jsonb_build_object(
            'content',
            'A simple webpage is easier to build when you plan its purpose, organise its content, create a clear HTML structure, apply CSS and test the result in a browser. Make small changes, check the page regularly and fix problems as you find them instead of waiting until the end.'
        )
    );

    -- Section 8: Knowledge Check
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 8, 'quiz', 'Knowledge Check',
        jsonb_build_object(
            'content',
            'Check your understanding of planning and building a simple web page.'
        ),
        v_quiz_id
    );

    -- Question 1
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'What should you identify first when planning a webpage?',
        '[
            {"label":"A","text":"The purpose of the page and its intended users"},
            {"label":"B","text":"The final animation effects"},
            {"label":"C","text":"The exact colour of every element"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'Understanding the page purpose and its users helps determine the content and features that are needed.',
        3,
        TRUE
    );

    -- Question 2
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which part of an HTML document contains the main content displayed on the webpage?',
        '[
            {"label":"A","text":"The head element"},
            {"label":"B","text":"The body element"},
            {"label":"C","text":"The doctype declaration"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The body element contains the webpage content, such as headings, paragraphs, links and images.',
        3,
        TRUE
    );

    -- Question 3
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'Why should you test a webpage in a browser while developing it?',
        '[
            {"label":"A","text":"To check its appearance, links and behaviour"},
            {"label":"B","text":"To automatically replace all HTML with CSS"},
            {"label":"C","text":"To avoid checking errors during development"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'Browser testing helps you confirm that the page displays and behaves as expected and helps you find problems.',
        3,
        TRUE
    );

    RAISE NOTICE 'Lesson 8 content and draft quiz created. Quiz ID: %', v_quiz_id;
END $$;




UPDATE public.lesson
SET status = 'published'
WHERE lesson_id = 8
  AND module_id = 1
  AND lesson_number = 8
  AND status = 'draft';


UPDATE public.quiz
SET status = 'published'
WHERE quiz_id = 10
  AND lesson_id = 8
  AND status = 'draft';




















--Lesson 9


DO $$
DECLARE
    v_lesson_id INTEGER := 9;
    v_quiz_id INTEGER;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = v_lesson_id
          AND module_id = 1
          AND lesson_number = 9
    ) THEN
        RAISE EXCEPTION 'Lesson 9 was not found in module 1.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION 'Lesson 9 already has sections. No changes were made.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION 'Lesson 9 already has a quiz. No changes were made.';
    END IF;

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
        'Lesson 1.9 Knowledge Check',
        'Answer all three questions about HTML document structure and common elements.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;

    -- Section 1
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 1, 'text', 'Introduction to HTML Documents',
        jsonb_build_object(
            'content',
            'HTML gives a webpage its structure. A browser reads the HTML document and uses its elements to display headings, paragraphs, links, images and other content. Learning the basic document structure helps you create pages that are organised and easier to maintain.'
        )
    );

    -- Section 2
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 2, 'text', 'The Basic HTML Document',
        jsonb_build_object(
            'content',
            'A typical HTML document begins with <!DOCTYPE html>, followed by the html element. The document usually contains a head element and a body element. The doctype tells the browser to use modern HTML standards mode, while the html element contains the document content.'
        )
    );

    -- Section 3
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 3, 'text', 'The Head and Body Elements',
        jsonb_build_object(
            'content',
            'The head element contains information about the document, including its title, character encoding and links to stylesheets. The body element contains the main content shown on the page. Keeping these roles separate helps make the HTML document easier to understand.'
        )
    );

    -- Section 4
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 4, 'text', 'Headings and Paragraphs',
        jsonb_build_object(
            'content',
            'HTML provides six heading levels, from h1 to h6. Use headings to organise topics and show their relationship. The p element represents a paragraph of text. A clear heading structure helps visitors scan the page and helps assistive technologies communicate the document structure.'
        )
    );

    -- Section 5
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 5, 'text', 'Links, Images and Lists',
        jsonb_build_object(
            'content',
            'The a element creates a link, usually using its href attribute to specify the destination. The img element embeds an image and should include useful alternative text in its alt attribute when appropriate. The ul element creates an unordered list, while ol creates an ordered list; li represents each list item.'
        )
    );

    -- Section 6
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 6, 'text', 'Semantic Elements and Good Structure',
        jsonb_build_object(
            'content',
            'Semantic elements describe the purpose of different parts of a page. Examples include header for introductory content, nav for navigation links, main for the main content, section for a grouped topic and footer for closing information. Use elements according to their meaning rather than choosing them only for their default appearance.'
        )
    );

    -- Section 7
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id, 7, 'text', 'Reviewing HTML Structure',
        jsonb_build_object(
            'content',
            'When reviewing HTML, check that elements are nested correctly, opening and closing tags are used where required, attributes are written correctly and the content follows a logical order. Use browser Developer Tools to inspect the page and investigate problems. Valid, meaningful HTML gives CSS and JavaScript a clearer structure to work with.'
        )
    );

    -- Section 8: Knowledge Check
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title,
        section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 8, 'quiz', 'Knowledge Check',
        jsonb_build_object(
            'content',
            'Check your understanding of HTML document structure and common elements.'
        ),
        v_quiz_id
    );

    -- Question 1
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'Which part of a typical HTML document contains the main content displayed on the page?',
        '[
            {"label":"A","text":"The head element"},
            {"label":"B","text":"The body element"},
            {"label":"C","text":"The doctype declaration"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The body element contains the main webpage content, such as headings, paragraphs, links and images.',
        3,
        TRUE
    );

    -- Question 2
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which HTML element is used to create a hyperlink?',
        '[
            {"label":"A","text":"The a element"},
            {"label":"B","text":"The p element"},
            {"label":"C","text":"The img element"}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'The a element creates hyperlinks, and its href attribute normally specifies the destination.',
        3,
        TRUE
    );

    -- Question 3
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'Which attribute provides alternative text for an image?',
        '[
            {"label":"A","text":"href"},
            {"label":"B","text":"src"},
            {"label":"C","text":"alt"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'The alt attribute provides a text alternative for an image when appropriate, including for people using screen readers.',
        3,
        TRUE
    );

    RAISE NOTICE 'Lesson 9 content and draft quiz created. Quiz ID: %', v_quiz_id;
END $$;




UPDATE public.quiz
SET status = 'published'
WHERE quiz_id = 11
  AND lesson_id = 9
  AND status = 'draft';



UPDATE public.lesson
SET status = 'published'
WHERE lesson_id = 9
  AND module_id = 1
  AND lesson_number = 9
  AND status = 'draft';








--Lesson 10



BEGIN;

DO $$
DECLARE
    v_lesson_id BIGINT := 10;
    v_quiz_id BIGINT;
BEGIN
    -- Confirm Lesson 10 exists before changing anything.
    IF NOT EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION 'Lesson 10 does not exist. No changes were made.';
    END IF;

    -- Update Lesson 10's details and keep it in draft.
    UPDATE public.lesson
    SET
        title = 'Practical Activity: Demonstrating How a Website Works',
        slug = 'website-workings-practical-activity',
        status = 'draft',
        updated_at = NOW()
    WHERE lesson_id = v_lesson_id;

    -- Reuse the existing lesson quiz, if one exists.
    SELECT quiz_id
    INTO v_quiz_id
    FROM public.quiz
    WHERE lesson_id = v_lesson_id
      AND module_id IS NULL
    ORDER BY quiz_number, quiz_id
    LIMIT 1
    FOR UPDATE;

    -- Otherwise, create the checkpoint quiz.
    IF v_quiz_id IS NULL THEN
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
            'Lesson 1.10 Mastery Checkpoint',
            'Answer all 10 questions. You must answer every question correctly to pass this checkpoint.',
            'checkpoint',
            100,
            3,
            5,
            'draft'
        )
        RETURNING quiz_id INTO v_quiz_id;
    ELSE
        UPDATE public.quiz
        SET
            title = 'Lesson 1.10 Mastery Checkpoint',
            instructions = 'Answer all 10 questions. You must answer every question correctly to pass this checkpoint.',
            quiz_type = 'checkpoint',
            pass_mark = 100,
            xp_per_correct = 3,
            perfect_bonus_xp = 5,
            status = 'draft'
        WHERE quiz_id = v_quiz_id;
    END IF;

    -- SECTION 1: Introduction
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 1, 'introduction',
        'Practical Activity: How a Website Works',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "In this practical activity, you will bring together the main ideas covered in Module 1. You will explore how a webpage is created, how the browser displays it, and how the browser and server communicate."
                },
                {
                    "type": "paragraph",
                    "text": "You will also connect the roles of HTML, CSS, JavaScript, URLs, DNS, HTTP and HTTPS with the work performed by frontend and backend systems."
                },
                {
                    "type": "callout",
                    "text": "Your goal is to explain the journey from entering a website address to viewing and interacting with a webpage."
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- SECTION 2: Creating a webpage
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 2, 'text',
        'Step 1: Create the Webpage',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "A webpage can use HTML for structure, CSS for presentation, and JavaScript for behaviour. Each technology has a different role, but they work together to create a complete user experience."
                },
                {
                    "type": "list",
                    "items": [
                        "HTML defines elements such as headings, paragraphs, links, images and buttons.",
                        "CSS controls colours, fonts, spacing, alignment and layout.",
                        "JavaScript can respond to user actions and update page content."
                    ]
                },
                {
                    "type": "example",
                    "text": "A heading is created in HTML, styled with CSS, and can be changed by JavaScript when a user clicks a button."
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- SECTION 3: Saving and testing
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 3, 'text',
        'Step 2: Save and Test Your Files',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "After writing the code, save your files and open the webpage in a browser. You can open an HTML file directly or use a local development server, depending on the project."
                },
                {
                    "type": "list",
                    "items": [
                        "Use a text editor or IDE to create and edit files.",
                        "Save changes before testing them.",
                        "Refresh the browser to view updated content.",
                        "Check that file paths and filenames are correct.",
                        "Use browser Developer Tools to inspect elements and investigate errors."
                    ]
                },
                {
                    "type": "callout",
                    "text": "If your changes do not appear, confirm that you edited and saved the correct file and refreshed the correct page."
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- SECTION 4: Browser requests
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 4, 'text',
        'Step 3: Understand the Browser Request',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "When a user enters a website address, the browser uses the URL to identify the requested resource. DNS helps resolve the domain name to network addressing information so the browser can locate the appropriate server."
                },
                {
                    "type": "list",
                    "items": [
                        "A URL identifies a web resource and can include a scheme, hostname, path and query string.",
                        "DNS helps resolve domain names to IP addresses.",
                        "HTTP defines how web requests and responses are exchanged.",
                        "HTTPS protects HTTP communication using TLS.",
                        "The browser processes returned resources to display the page."
                    ]
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- SECTION 5: Servers and backend
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 5, 'text',
        'Step 4: Understand the Server and Backend',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "A web server receives requests and sends responses. In a web application, backend code can validate information, apply application rules, communicate with a database and return the result to the frontend."
                },
                {
                    "type": "example",
                    "text": "When a user signs in, the frontend sends the submitted information to the backend. The backend validates the request and may communicate with a database before returning a response."
                },
                {
                    "type": "list",
                    "items": [
                        "The frontend handles the user-facing interface.",
                        "The backend processes requests and application logic.",
                        "A database stores and retrieves data when the application needs one.",
                        "The browser displays the response or updates the interface based on returned data."
                    ]
                },
                {
                    "type": "callout",
                    "text": "Not every webpage needs a database or a custom backend. Static websites can serve files without application-specific database processing."
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- SECTION 6: Practical walkthrough
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 6, 'activity',
        'Step 5: Perform a Website Walkthrough',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "Open a website that you are allowed to inspect. Use the following activity to connect the technologies and processes covered in this module."
                },
                {
                    "type": "list",
                    "items": [
                        "Open the webpage in your browser.",
                        "Inspect its HTML elements using the Elements or Inspector panel.",
                        "Identify CSS rules that affect the page appearance.",
                        "Find a JavaScript interaction if the page contains one.",
                        "Refresh the page and observe what changes.",
                        "Open the Network panel and inspect requests and response status codes.",
                        "Identify whether the website appears to request data from a backend."
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Write a short explanation of what happens in the browser and what may happen on the server. Do not assume that every website uses the same architecture."
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- SECTION 7: Troubleshooting
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 7, 'text',
        'Step 6: Identify and Troubleshoot Problems',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "When a webpage does not behave as expected, check the likely cause instead of changing unrelated code."
                },
                {
                    "type": "list",
                    "items": [
                        "If the layout is incorrect, inspect the HTML structure and CSS rules.",
                        "If an interaction fails, check the JavaScript and the browser Console.",
                        "If a resource cannot load, inspect its path and the Network panel.",
                        "If a server request fails, inspect the request, response status and backend logs where available.",
                        "If data is missing, check the API response and relevant backend or database logic."
                    ]
                },
                {
                    "type": "callout",
                    "text": "Developer Tools help you gather evidence about a problem. Use the evidence to decide which part of the application needs attention."
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- SECTION 8: Summary
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 8, 'summary',
        'Lesson Summary',
        '{
            "blocks": [
                {
                    "type": "list",
                    "items": [
                        "HTML defines webpage structure and content.",
                        "CSS controls visual presentation and layout.",
                        "JavaScript adds behaviour and interactivity.",
                        "Browsers request and process web resources.",
                        "DNS helps resolve domain names to network addressing information.",
                        "HTTP and HTTPS support communication between browsers and web servers.",
                        "Backend code can process requests, validate data and communicate with databases.",
                        "Developer Tools help inspect page elements, network requests and errors."
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Review these ideas before completing the mastery checkpoint. You must answer all 10 checkpoint questions correctly to meet the required pass mark."
                }
            ]
        }'::jsonb,
        NULL
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = NULL;

    -- QUESTION CHECKPOINT
    -- Reuse the quiz if it exists; otherwise it was created above.
    -- This section link is unique per quiz.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id, 9, 'quiz',
        'Lesson 1.10 Mastery Checkpoint',
        '{
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "Answer all 10 questions. A score of 100% is required to pass this checkpoint. Review the lesson and try again if you miss a question."
                }
            ]
        }'::jsonb,
        v_quiz_id
    )
    ON CONFLICT (lesson_id, display_order)
    DO UPDATE SET
        section_type = EXCLUDED.section_type,
        section_title = EXCLUDED.section_title,
        section_content = EXCLUDED.section_content,
        quiz_id = EXCLUDED.quiz_id;

    -- Insert or update the 10 checkpoint questions.
    -- Existing questions at positions 1–10 are updated, not duplicated.
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
    VALUES
    (
        v_quiz_id, 1, 'multiple_choice',
        'You edit a heading in index.html and save the file. What should you normally do to see the updated heading in the browser?',
        '[{"value":"A","label":"Refresh the browser page"},{"value":"B","label":"Delete the domain name"},{"value":"C","label":"Disable HTML"}]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'After saving the correct file, refresh the page to load the updated content.',
        3, TRUE
    ),
    (
        v_quiz_id, 2, 'multiple_choice',
        'Which technology primarily defines the structure and content of a webpage?',
        '[{"value":"A","label":"CSS"},{"value":"B","label":"HTML"},{"value":"C","label":"DNS"}]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'HTML defines elements such as headings, paragraphs, links and buttons.',
        3, TRUE
    ),
    (
        v_quiz_id, 3, 'multiple_choice',
        'Which technology is mainly responsible for styling colours, spacing and layout?',
        '[{"value":"A","label":"JavaScript"},{"value":"B","label":"HTTP"},{"value":"C","label":"CSS"}]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'CSS controls the visual presentation of webpage elements.',
        3, TRUE
    ),
    (
        v_quiz_id, 4, 'multiple_choice',
        'A button should respond to a click and update a message on the page. Which technology commonly handles this behaviour?',
        '[{"value":"A","label":"JavaScript"},{"value":"B","label":"DNS"},{"value":"C","label":"CSS alone"}]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'JavaScript can respond to click events and update webpage content.',
        3, TRUE
    ),
    (
        v_quiz_id, 5, 'multiple_choice',
        'What is the main purpose of DNS when accessing a website by its domain name?',
        '[{"value":"A","label":"To style the webpage"},{"value":"B","label":"To help resolve the domain name to network addressing information"},{"value":"C","label":"To execute JavaScript in the browser"}]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'DNS helps resolve domain names to IP addresses used to locate network resources.',
        3, TRUE
    ),
    (
        v_quiz_id, 6, 'multiple_choice',
        'What is the role of HTTPS when a browser communicates with a website?',
        '[{"value":"A","label":"It replaces HTML and CSS"},{"value":"B","label":"It stores every website database"},{"value":"C","label":"It provides HTTP communication protected by TLS"}]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'HTTPS protects HTTP communication using TLS.',
        3, TRUE
    ),
    (
        v_quiz_id, 7, 'multiple_choice',
        'Which task is commonly performed by backend code in a web application?',
        '[{"value":"A","label":"Validating a request and communicating with a database"},{"value":"B","label":"Choosing the monitor brightness"},{"value":"C","label":"Automatically styling every HTML element"}]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'Backend code can validate input, apply application rules and interact with databases.',
        3, TRUE
    ),
    (
        v_quiz_id, 8, 'multiple_choice',
        'Which browser Developer Tools panel is commonly used to inspect HTML elements and their applied styles?',
        '[{"value":"A","label":"Downloads"},{"value":"B","label":"Elements or Inspector"},{"value":"C","label":"Bookmarks"}]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The Elements or Inspector panel lets developers examine document structure and styles.',
        3, TRUE
    ),
    (
        v_quiz_id, 9, 'multiple_choice',
        'A frontend form sends information to a backend, which checks it and retrieves data from a database. Which description best fits this process?',
        '[{"value":"A","label":"The CSS file directly replaces the database"},{"value":"B","label":"DNS handles all application validation"},{"value":"C","label":"The frontend sends a request, and the backend processes it and may return a response"}]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'The frontend sends requests to the backend, which processes them and may communicate with a database before responding.',
        3, TRUE
    ),
    (
        v_quiz_id, 10, 'multiple_choice',
        'You want to investigate why a webpage request failed. Which Developer Tools feature is especially useful for checking requests, response status codes and transferred resources?',
        '[{"value":"A","label":"The Network panel"},{"value":"B","label":"The page zoom control"},{"value":"C","label":"The bookmarks menu"}]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'The Network panel displays web requests, responses, status codes and resource-loading information.',
        3, TRUE
    )
    ON CONFLICT (quiz_id, display_order)
    DO UPDATE SET
        question_type = EXCLUDED.question_type,
        prompt = EXCLUDED.prompt,
        options = EXCLUDED.options,
        evaluation = EXCLUDED.evaluation,
        explanation = EXCLUDED.explanation,
        xp_reward = EXCLUDED.xp_reward,
        is_required = EXCLUDED.is_required;

    -- Keep the checkpoint in draft until reviewed.
    UPDATE public.quiz
    SET
        pass_mark = 100,
        xp_per_correct = 3,
        perfect_bonus_xp = 5,
        status = 'draft'
    WHERE quiz_id = v_quiz_id;

END $$;

COMMIT;








BEGIN;

-- Make Lesson 10's quiz use the same normal quiz type as Lesson 9.
UPDATE public.quiz
SET
    title = 'Lesson 1.10 Knowledge Check',
    instructions = 'Answer the questions to check your understanding of how a website works.',
    quiz_type = 'practice',
    pass_mark = 50,
    xp_per_correct = 3,
    perfect_bonus_xp = 5,
    status = 'draft'
WHERE quiz_id = 12
  AND lesson_id = 10;

-- Match Lesson 9's answer-option format.
-- Lesson 10 currently stores options as value/label.
-- Lesson 9 stores them as label/text.
UPDATE public.question AS q
SET options = (
    SELECT jsonb_agg(
        jsonb_build_object(
            'label', option_item ->> 'value',
            'text', option_item ->> 'label'
        )
        ORDER BY option_order
    )
    FROM jsonb_array_elements(q.options)
         WITH ORDINALITY AS option_data(option_item, option_order)
)
WHERE q.quiz_id = 12
  AND q.options IS NOT NULL
  AND jsonb_typeof(q.options) = 'array'
  AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(q.options) AS option_data(option_item)
      WHERE option_item ? 'value'
        AND option_item ? 'label'
  );

COMMIT;






BEGIN;

UPDATE public.quiz
SET status = 'published'
WHERE quiz_id = 12
  AND lesson_id = 10;

UPDATE public.lesson
SET status = 'published'
WHERE lesson_id = 10;

COMMIT;










