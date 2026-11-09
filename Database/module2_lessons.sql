
DO $$
DECLARE
    v_lesson_id BIGINT;
    v_quiz_id BIGINT;
BEGIN
    -- Confirm Module 2 exists.
    IF NOT EXISTS (
        SELECT 1
        FROM public.module
        WHERE module_id = 2
    ) THEN
        RAISE EXCEPTION 'Module 2 was not found.';
    END IF;

    -- Prevent duplicate lesson insertion.
    IF EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE module_id = 2
          AND lesson_number = 2
    ) THEN
        RAISE EXCEPTION 'Module 2 Lesson 2 already exists. No changes were made.';
    END IF;

    -- Create Lesson 2.
    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        2,
        2,
        'HTML Document Structure',
        'html-document-structure',
        'Learn the standard structure of an HTML document, understand the purpose of DOCTYPE, html, head and body elements, and connect external CSS and JavaScript files.',
        'beginner',
        30,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;

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
        2,
        'Lesson 2.2 Knowledge Check',
        'Answer all three questions about HTML document structure, metadata, the viewport declaration and connecting JavaScript files.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: Introduction.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to HTML Document Structure',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Every properly organised HTML page follows a basic document structure. This structure tells the browser which version of HTML is being used, where the document begins and ends, what information belongs in the head, and what content should be displayed on the page.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A complete HTML document normally contains the following elements:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Basic HTML document structure',
                    'language', 'html',
                    'code', $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>

<body>

    <h1>Welcome to My Website</h1>

    <p>This is my first properly structured HTML page.</p>

</body>

</html>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The document is organised into different parts, each with its own responsibility. Let us examine each part.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'A consistent HTML document structure makes web pages easier to understand, maintain and develop.'
                )
            )
        )
    );


    -- SECTION 2: DOCTYPE declaration.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        2,
        'heading',
        'The DOCTYPE Declaration',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The DOCTYPE declaration tells the browser that the document uses modern HTML. It helps the browser render the page using standards mode instead of older compatibility behaviour.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'HTML DOCTYPE declaration',
                    'language', 'html',
                    'code', $code$
<!DOCTYPE html>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Important points about the DOCTYPE declaration:'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'It is not an HTML element.',
                        'It does not require a closing tag.',
                        'It should appear at the beginning of the document.'
                    )
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'The DOCTYPE declaration helps browsers interpret an HTML document using modern standards.'
                )
            )
        )
    );


    -- SECTION 3: HTML root element.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        3,
        'heading',
        'The HTML Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The html element is the root element of an HTML document. All other HTML elements, except the DOCTYPE declaration, are placed inside it.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'HTML root element',
                    'language', 'html',
                    'code', $code$
<html lang="en">
    <!-- Other HTML elements go here -->
</html>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The lang="en" attribute identifies the primary language of the document as English.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Another Example'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'HTML document using French',
                    'language', 'html',
                    'code', $code$
<html lang="fr">
    <!-- Other HTML elements go here -->
</html>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This identifies French as the document''s primary language. Specifying the language helps screen readers and other tools interpret the content correctly.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'The lang attribute helps identify the primary language used in an HTML document.'
                )
            )
        )
    );


    -- SECTION 4: HEAD element.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        4,
        'heading',
        'The HEAD Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The head element contains information about the HTML document. This information is generally not displayed as the main page content.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The following example shows some common elements that can be placed inside the head.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example of the HEAD element',
                    'language', 'html',
                    'code', $code$
<head>
    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>CodeXperts Learning Platform</title>

    <meta name="description"
          content="Learn programming through practical lessons.">

    <link rel="stylesheet" href="css/style.css">
</head>
$code$
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Common Elements Inside the HEAD'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '1. Title'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Document title',
                    'language', 'html',
                    'code', $code$
<title>My Website</title>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The title element defines the document title shown in the browser tab.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '2. Character Encoding'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Character encoding',
                    'language', 'html',
                    'code', $code$
<meta charset="UTF-8">
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This specifies the character encoding used by the document. UTF-8 supports a wide range of characters and symbols.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '3. Viewport'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Viewport declaration',
                    'language', 'html',
                    'code', $code$
<meta name="viewport"
      content="width=device-width, initial-scale=1.0">
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The viewport declaration helps the page display correctly on different screen sizes, especially mobile devices. It tells the browser to use the device''s screen width as the layout viewport width and sets the initial zoom level.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '4. Description'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Meta description',
                    'language', 'html',
                    'code', $code$
<meta name="description"
      content="A website for learning web development.">
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The description provides information about the page that search engines may use in search results.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '5. External Stylesheet'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Connecting an external CSS file',
                    'language', 'html',
                    'code', $code$
<link rel="stylesheet" href="css/style.css">
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The link element connects an external CSS file to the HTML document. The rel attribute identifies the relationship as a stylesheet, while href specifies the file location.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'The head contains document information and linked resources. It is different from the body, which contains the visible page content.'
                )
            )
        )
    );


    -- SECTION 5: BODY element.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        5,
        'heading',
        'The BODY Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The body element contains the content displayed on the web page. This includes headings, paragraphs, images, links, forms, tables, lists and other HTML elements.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example of the BODY element',
                    'language', 'html',
                    'code', $code$
<body>

    <header>
        <h1>CodeXperts</h1>
    </header>

    <main>
        <h2>Start Learning</h2>

        <p>Choose a programming language and begin.</p>
    </main>

    <footer>
        <p>Copyright 2026 CodeXperts</p>
    </footer>

</body>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This example uses three common structural elements inside the body:'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'header: Contains introductory content, such as a website heading or navigation.',
                        'main: Contains the main content of the page.',
                        'footer: Contains footer information, such as copyright details.'
                    )
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'Visible page content belongs inside the body element, not directly inside the head element.'
                )
            )
        )
    );


    -- SECTION 6: Connecting CSS and JavaScript.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'Connecting CSS and JavaScript',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An HTML document can connect external CSS and JavaScript files. Keeping these files separate helps organise a website and makes the code easier to maintain.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Example Folder Structure'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Website folder structure',
                    'language', 'plaintext',
                    'code', $code$
my-website/
│
├── index.html
│
├── css/
│   └── style.css
│
└── js/
    └── script.js
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The index.html file contains the page structure, while the css and js folders contain the external styling and JavaScript files.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Connecting the CSS File'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Connect the external CSS file inside the head element using the link element.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Connecting CSS',
                    'language', 'html',
                    'code', $code$
<link rel="stylesheet" href="css/style.css">
$code$
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Connecting the JavaScript File'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Connect the external JavaScript file using the script element. The defer attribute tells the browser to download the script while parsing the HTML and execute it after the document has been parsed.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Connecting JavaScript',
                    'language', 'html',
                    'code', $code$
<script src="js/script.js" defer></script>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This is useful when JavaScript needs to access HTML elements because the document will have been parsed before the script executes.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'External CSS is connected using link, while external JavaScript is connected using script. The defer attribute allows the HTML document to be parsed before the script executes.'
                )
            )
        )
    );


    -- SECTION 7: Complete practical example.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'heading',
        'Complete Practical Example',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Now that you understand the main parts of an HTML document, you can create a simple Student Portal page that connects HTML, CSS and JavaScript.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Step 1: Create index.html'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Create a file named index.html. Add the following HTML structure:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'index.html',
                    'language', 'html',
                    'code', $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Student Portal</title>

    <link rel="stylesheet" href="css/style.css">

    <script src="js/script.js" defer></script>
</head>

<body>

    <header>
        <h1>Student Portal</h1>
    </header>

    <main>
        <h2>Welcome, Student!</h2>

        <p>Continue learning and improve your coding skills.</p>

        <button id="startButton">Start Learning</button>
    </main>

    <footer>
        <p>Student Portal 2026</p>
    </footer>

</body>

</html>
$code$
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Step 2: Create css/style.css'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Inside the css folder, create a file named style.css. Add the following CSS:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'css/style.css',
                    'language', 'css',
                    'code', $code$
body {
    font-family: Arial, sans-serif;
    margin: 0;
    background-color: #f4f4f4;
}

header {
    background-color: #172554;
    color: white;
    padding: 20px;
    text-align: center;
}

main {
    padding: 30px;
    text-align: center;
}

button {
    padding: 12px 20px;
    cursor: pointer;
}
$code$
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Step 3: Create js/script.js'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Inside the js folder, create a file named script.js. Add the following JavaScript:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'js/script.js',
                    'language', 'javascript',
                    'code', $code$
document.getElementById("startButton").addEventListener("click", function () {
    alert("Welcome to your learning journey!");
});
$code$
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Step 4: Test Your Website'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Save all three files in their correct folders.',
                        'Open index.html in a web browser.',
                        'Check that the page displays the Student Portal heading and content.',
                        'Click the Start Learning button.',
                        'Confirm that the welcome alert appears.'
                    )
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Expected Result',
                    'text', 'Your browser should display a styled Student Portal page. When the Start Learning button is clicked, JavaScript should display a welcome alert.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Practical tip',
                    'text', 'Check that the file paths in your link and script elements match the actual folder structure. Incorrect file paths can prevent external CSS and JavaScript files from loading.'
                )
            )
        )
    );


    -- SECTION 8: Lesson summary.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        8,
        'summary',
        'Lesson Summary',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A properly structured HTML document contains a DOCTYPE declaration, a root html element, a head element and a body element. Each part has a specific responsibility in organising and displaying a web page.'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'title', 'Important points to remember',
                    'items',
                    jsonb_build_array(
                        '<!DOCTYPE html> declares the HTML document type.',
                        '<html> is the root element of the document.',
                        '<head> contains document information and linked resources.',
                        '<title> defines the browser tab title.',
                        '<body> contains visible page content.',
                        '<meta charset="UTF-8"> specifies character encoding.',
                        'The viewport meta element helps with responsive display.',
                        'External CSS is connected using <link>.',
                        'External JavaScript is connected using <script>.',
                        'The defer attribute allows HTML parsing to finish before the script executes.'
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
                        'Can you explain the purpose of the DOCTYPE declaration?',
                        'Can you identify the root element of an HTML document?',
                        'Can you explain the difference between the head and body elements?',
                        'Can you describe the purpose of the title and meta elements?',
                        'Can you explain how the viewport declaration helps mobile devices?',
                        'Can you connect external CSS and JavaScript files to an HTML document?',
                        'Can you explain what the defer attribute does?'
                    )
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'You are ready for the next lesson when...',
                    'text', 'You can create a properly structured HTML document, explain the purpose of its main elements, connect external CSS and JavaScript files, and describe how the browser processes these resources.'
                )
            )
        )
    );


    -- SECTION 9: Knowledge Check.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        9,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of HTML document structure, the head and body elements, responsive viewport settings and connecting external JavaScript files.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'A developer places a paragraph directly inside the head element because they want it to appear on the web page. What is the main problem?',
        '[
            {"label":"A","text":"The paragraph must be placed inside a title element to become visible."},
            {"label":"B","text":"The head is intended for document metadata and resources, while visible page content belongs in the body."},
            {"label":"C","text":"The browser will automatically move every paragraph into the body."},
            {"label":"D","text":"Paragraphs cannot be displayed unless CSS is connected first."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The head contains metadata and linked resources, not the normal visible content of the page. Visible content such as paragraphs belongs inside the body element.',
        3,
        TRUE
    );


    -- QUESTION 2.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which declaration is most directly responsible for helping a page use the device''s actual screen width on mobile devices?',
        '[
            {"label":"A","text":"<meta charset=\"UTF-8\">"},
            {"label":"B","text":"<title>Mobile Website</title>"},
            {"label":"C","text":"<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"},
            {"label":"D","text":"<html lang=\"en\">"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'The viewport declaration controls the layout viewport width and initial scale. Using width=device-width helps the page adapt to the width of the device screen.',
        3,
        TRUE
    );


    -- QUESTION 3.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'A developer uses the following JavaScript connection: <script src="js/script.js" defer></script>. What is the main purpose of defer?',
        '[
            {"label":"A","text":"It prevents the JavaScript file from being downloaded until a button is clicked."},
            {"label":"B","text":"It executes the script after the HTML document has been parsed."},
            {"label":"C","text":"It converts the JavaScript into HTML elements."},
            {"label":"D","text":"It places the script inside the document''s head automatically."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The browser can download a deferred script while parsing the HTML document, but executes it after parsing is complete. This allows the script to access the parsed HTML elements.',
        3,
        TRUE
    );


    -- Publish the lesson and quiz.
    UPDATE public.lesson
    SET status = 'published'
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;


    RAISE NOTICE
        'Module 2 Lesson 2 created successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id, v_quiz_id;

END $$;








-- lesson 3


DO $$
DECLARE
    v_lesson_id BIGINT;
    v_quiz_id BIGINT;
BEGIN
    -- Confirm Module 2 exists.
    IF NOT EXISTS (
        SELECT 1
        FROM public.module
        WHERE module_id = 2
    ) THEN
        RAISE EXCEPTION 'Module 2 was not found.';
    END IF;

    -- Prevent duplicate lesson insertion.
    IF EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE module_id = 2
          AND lesson_number = 3
    ) THEN
        RAISE EXCEPTION 'Module 2 Lesson 3 already exists. No changes were made.';
    END IF;

    -- Create Lesson 3.
    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        2,
        3,
        'Headings and Paragraphs',
        'headings-and-paragraphs',
        'Learn how to organise web content using HTML headings, paragraphs, line breaks, horizontal rules and text formatting elements.',
        'beginner',
        30,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;


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
        3,
        'Lesson 2.3 Knowledge Check',
        'Answer all three questions about HTML heading hierarchy, text formatting elements and line breaks.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: Introduction.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to Headings and Paragraphs',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Headings and paragraphs are two of the most frequently used HTML elements. They organise information and make web pages easier to read.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Headings identify the topic or purpose of a section, while paragraphs contain the actual written information.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Why they matter',
                    'text', 'Using headings and paragraphs correctly creates organised content that is easier for visitors to read, understand and navigate.'
                )
            )
        )
    );


    -- SECTION 2: HTML headings.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        2,
        'heading',
        'HTML Headings',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML provides six heading levels, ranging from h1 to h6. Each level represents a different level in the organisation of page content.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'The six HTML heading levels',
                    'language', 'html',
                    'code', $code$
<h1>Main Heading</h1>

<h2>Section Heading</h2>

<h3>Subsection Heading</h3>

<h4>Smaller Subsection</h4>

<h5>Minor Heading</h5>

<h6>Smallest Heading</h6>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The levels range from h1 to h6.'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        '<h1> represents the highest-level heading.',
                        '<h6> represents the lowest-level heading.'
                    )
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Headings should reflect the organisation of the content, not simply the size of the text.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Example: A Logical Heading Structure'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Organising web development topics',
                    'language', 'html',
                    'code', $code$
<h1>Web Development</h1>

<h2>HTML</h2>

<h3>HTML Elements</h3>

<h3>HTML Attributes</h3>

<h2>CSS</h2>

<h3>CSS Selectors</h3>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This example creates a logical content hierarchy. Web Development is the main topic, HTML and CSS are its subsections, and the smaller headings describe topics within those sections.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'Use heading levels to represent the structure of your content. Do not select a heading level only because its default font size looks attractive.'
                )
            )
        )
    );


    -- SECTION 3: Why heading hierarchy matters.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        3,
        'heading',
        'Why Heading Hierarchy Matters',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Imagine a learning platform containing several lessons. A suitable heading structure can organise the learning content into modules and individual lessons.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Learning platform hierarchy',
                    'language', 'html',
                    'code', $code$
<h1>HTML Learning Path</h1>

<h2>Module 1: Introduction</h2>

<h3>Lesson 1: What is HTML?</h3>

<p>HTML is used to structure web content.</p>

<h3>Lesson 2: HTML Elements</h3>

<p>Elements are the building blocks of HTML documents.</p>

<h2>Module 2: Building Web Pages</h2>

<h3>Lesson 1: Headings and Paragraphs</h3>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This organisation provides several benefits:'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Students can understand the relationship between topics.',
                        'Search engines can better interpret the page structure.',
                        'Screen reader users can navigate between sections more easily.',
                        'Developers can maintain more readable and organised documents.'
                    )
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Do not choose a heading level just because its default font size looks attractive. Use CSS to change its appearance instead.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Changing heading appearance with CSS',
                    'language', 'css',
                    'code', $code$
h1 {
    font-size: 32px;
}

h2 {
    font-size: 24px;
}

h3 {
    font-size: 20px;
}
$code$
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'A logical heading hierarchy improves content organisation and accessibility. CSS should be used when you want to change the visual appearance of headings.'
                )
            )
        )
    );


    -- SECTION 4: HTML paragraphs.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        4,
        'heading',
        'HTML Paragraphs',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The p element defines a paragraph. It is used to organise written information into separate blocks of text.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Creating an HTML paragraph',
                    'language', 'html',
                    'code', $code$
<p>
    HTML provides the structure of a web page.

    It allows developers to organise content
    into headings, paragraphs and other elements.
</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Browsers normally display paragraphs as separate blocks with spacing around them.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Multiple paragraphs should generally use separate p elements.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Creating multiple paragraphs',
                    'language', 'html',
                    'code', $code$
<p>HTML structures the content of a website.</p>

<p>CSS controls how that content looks.</p>

<p>JavaScript adds interactive functionality.</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'Use separate paragraph elements to organise different blocks of written content. Browsers automatically display paragraphs as block-level elements.'
                )
            )
        )
    );


    -- SECTION 5: Line breaks.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        5,
        'heading',
        'Line Breaks',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The br element creates a line break within text. It moves the following content onto a new line without starting a new paragraph.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Displaying an address',
                    'language', 'html',
                    'code', $code$
<p>
    John Smith<br>
    Johannesburg<br>
    South Africa
</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The br element is useful when a line break is part of the content, such as an address or poem.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'Avoid using many br elements to create page spacing. CSS is better suited for controlling layout and spacing.'
                )
            )
        )
    );


    -- SECTION 6: Horizontal rules.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'Horizontal Rules',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The hr element represents a thematic break between sections of content. It is commonly displayed by browsers as a horizontal line.'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Using a horizontal rule',
                    'language', 'html',
                    'code', $code$
<h2>About HTML</h2>

<p>HTML is a markup language.</p>

<hr>

<h2>About CSS</h2>

<p>CSS controls the appearance of web pages.</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The hr element also has semantic meaning. It represents a thematic separation between related sections or topics.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'The hr element is not only a visual line. It communicates a thematic break in the content.'
                )
            )
        )
    );


    -- SECTION 7: Text formatting elements.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'heading',
        'Text Formatting Elements',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML includes several elements for emphasising, highlighting or identifying specific types of text. These elements can communicate meaning as well as affect how text is displayed.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Strong Importance'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Using the strong element',
                    'language', 'html',
                    'code', $code$
<p>
    <strong>Warning:</strong>
    Save your work before closing the editor.
</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The strong element indicates that its content has strong importance.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Emphasis'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Using the em element',
                    'language', 'html',
                    'code', $code$
<p>
    You should <em>always</em> check your code.
</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The em element indicates emphasis in the content.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Bold Presentation'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Using the b element',
                    'language', 'html',
                    'code', $code$
<p><b>HTML</b> is used to structure content.</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The b element draws attention to text without necessarily expressing strong importance.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Italic Presentation'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Using the i element',
                    'language', 'html',
                    'code', $code$
<p><i>HTML</i> stands for HyperText Markup Language.</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The i element can identify text in an alternate voice or mood, among other uses.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Highlighted Text'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Using the mark element',
                    'language', 'html',
                    'code', $code$
<p>Remember to study <mark>HTML elements</mark>.</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The mark element highlights text that may be relevant or important in a particular context.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Deleted and Inserted Text'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Using del and ins',
                    'language', 'html',
                    'code', $code$
<p>Price: <del>R500</del> <ins>R350</ins></p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The del element represents deleted text, while the ins element represents inserted text.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Subscript and Superscript'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Using sub and sup',
                    'language', 'html',
                    'code', $code$
<p>Water: H<sub>2</sub>O</p>

<p>Mathematical expression: x<sup>2</sup></p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The sub element displays subscript text, while the sup element displays superscript text.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'HTML text formatting elements can communicate different meanings. For example, strong indicates importance, em indicates emphasis, and mark highlights relevant text.'
                )
            )
        )
    );


    -- SECTION 8: Practical example.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        8,
        'heading',
        'Practical Example: Student Introduction Page',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Now that you understand headings, paragraphs and text formatting elements, you can combine them to create a simple student introduction page.'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Create a new HTML file and add the following code:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Student introduction page',
                    'language', 'html',
                    'code', $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Student Introduction</title>
</head>

<body>

    <h1>Student Profile</h1>

    <h2>Personal Information</h2>

    <p>My name is Sarah. I am a student learning web development.</p>

    <hr>

    <h2>My Learning Goals</h2>

    <p>
        I want to become a skilled web developer.
        I am particularly interested in
        <strong>frontend development</strong>.
    </p>

    <h3>Current Focus</h3>

    <p>
        I am currently studying
        <mark>HTML and CSS</mark>.
    </p>

    <h3>Contact Information</h3>

    <p>
        Johannesburg<br>
        South Africa
    </p>

</body>

</html>
$code$
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Understanding the Example'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'The h1 element creates the main Student Profile heading.',
                        'The h2 elements identify the main content sections.',
                        'The h3 elements introduce smaller subsections.',
                        'The p elements organise the written information.',
                        'The hr element separates the learning goals section.',
                        'The strong element emphasises frontend development.',
                        'The mark element highlights HTML and CSS.',
                        'The br elements display the contact information on separate lines.'
                    )
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Practical tip',
                    'text', 'Try changing the student name, learning goals and contact information. You can also experiment with different heading levels and text formatting elements.'
                )
            )
        )
    );


    -- SECTION 9: Common mistakes.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        9,
        'heading',
        'Common Mistakes',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Beginners sometimes use HTML headings and paragraphs incorrectly. The following examples show common mistakes and how to correct them.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '1. Using Headings Only for Their Appearance'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Incorrect:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect heading structure',
                    'language', 'html',
                    'code', $code$
<h1>My Name</h1>

<h1>My Age</h1>

<h1>My Skills</h1>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Better:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct heading structure',
                    'language', 'html',
                    'code', $code$
<h1>Student Profile</h1>

<h2>My Name</h2>

<h2>My Age</h2>

<h2>My Skills</h2>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The corrected example uses one main heading and separate subsection headings to organise the information.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '2. Using Paragraphs to Create Headings'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Incorrect:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect paragraph usage',
                    'language', 'html',
                    'code', $code$
<p>About Us</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Better:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct heading usage',
                    'language', 'html',
                    'code', $code$
<h2>About Us</h2>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A heading element should be used when introducing a section or topic.'
                ),

                jsonb_build_object(
                    'type', 'heading',
                    'text', '3. Using BR Instead of Paragraphs'
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Incorrect:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect paragraph separation',
                    'language', 'html',
                    'code', $code$
<p>HTML is useful.<br><br>CSS is also important.</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Better:'
                ),

                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct paragraph separation',
                    'language', 'html',
                    'code', $code$
<p>HTML is useful.</p>

<p>CSS is also important.</p>
$code$
                ),

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Separate paragraphs should generally use separate p elements instead of multiple br elements.'
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'Use headings to organise topics, paragraphs to organise written content, and line breaks only when a line break is appropriate within the content.'
                )
            )
        )
    );


    -- SECTION 10: Lesson summary.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id,
        10,
        'summary',
        'Lesson Summary',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(

                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML headings and paragraphs help organise written information and create a logical structure for web pages. Other elements, such as br, hr, strong and em, provide additional ways to structure and format content.'
                ),

                jsonb_build_object(
                    'type', 'list',
                    'title', 'Important points to remember',
                    'items',
                    jsonb_build_array(
                        'HTML provides six heading levels, from h1 to h6.',
                        'Headings should follow a logical hierarchy.',
                        'The p element defines a paragraph.',
                        'The br element creates a line break.',
                        'The hr element represents a thematic break.',
                        'The strong element identifies important content.',
                        'The em element emphasises content.',
                        'The b element draws attention to text without necessarily indicating importance.',
                        'The i element identifies text in an alternate voice or mood, among other uses.',
                        'The mark element highlights relevant text.',
                        'The del and ins elements represent deleted and inserted text.',
                        'The sub and sup elements display subscript and superscript text.',
                        'CSS should control visual sizing and spacing.'
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
                        'Can you identify all six HTML heading levels?',
                        'Can you explain why heading hierarchy matters?',
                        'Can you create separate paragraphs using the p element?',
                        'Can you explain the difference between br and hr?',
                        'Can you describe the purpose of strong and em?',
                        'Can you identify the purpose of mark, del, ins, sub and sup?',
                        'Can you combine headings, paragraphs and formatting elements in a complete HTML page?'
                    )
                ),

                jsonb_build_object(
                    'type', 'callout',
                    'title', 'You are ready for the next lesson when...',
                    'text', 'You can organise a web page using logical heading levels, create paragraphs, use line breaks and horizontal rules correctly, and apply appropriate HTML text formatting elements.'
                )
            )
        )
    );


    -- SECTION 11: Knowledge Check.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        11,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of HTML heading hierarchy, text formatting elements and line breaks by answering the following questions.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'A developer wants to create a page with one main topic, two subsections and three smaller topics under the second subsection. Which approach best represents the hierarchy?',
        '[
            {"label":"A","text":"Use <h1> for every topic and control their importance through CSS."},
            {"label":"B","text":"Use <h1> for the main topic, <h2> for both subsections and <h3> for the smaller topics."},
            {"label":"C","text":"Use <h2> for the main topic, <h1> for the subsections and <h3> for smaller topics."},
            {"label":"D","text":"Use paragraphs for the main topic and headings only for the smaller topics."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'A logical heading hierarchy uses h1 for the main topic, h2 for its subsections and h3 for smaller topics nested under those subsections.',
        3,
        TRUE
    );


    -- QUESTION 2.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which statement best describes the difference between <strong> and <b>?',
        '[
            {"label":"A","text":"Both are identical semantic elements, but <strong> is displayed in a larger font."},
            {"label":"B","text":"<strong> indicates importance, while <b> draws attention without necessarily indicating importance."},
            {"label":"C","text":"<b> indicates importance, while <strong> only changes the font weight."},
            {"label":"D","text":"<strong> is used for headings, while <b> is used for paragraphs."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The strong element communicates that its content has strong importance, while the b element draws attention to text without necessarily assigning it additional importance.',
        3,
        TRUE
    );


    -- QUESTION 3.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'A developer needs to display a postal address with each part on a separate line. Which element is most suitable for creating the line breaks within one address block?',
        '[
            {"label":"A","text":"<hr>"},
            {"label":"B","text":"<p>"},
            {"label":"C","text":"<br>"},
            {"label":"D","text":"<section>"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'The br element creates a line break without starting a separate paragraph. It is suitable for content such as addresses and poems where line breaks are part of the content.',
        3,
        TRUE
    );


    -- Publish the lesson and quiz.
    UPDATE public.lesson
    SET status = 'published'
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;


    RAISE NOTICE
        'Module 2 Lesson 3 created successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id, v_quiz_id;

END $$;




-- LESSON 4

DO $$
DECLARE
    v_lesson_id BIGINT;
    v_quiz_id BIGINT;
BEGIN

    -- Check that Module 2 exists
    IF NOT EXISTS (
        SELECT 1
        FROM public.module
        WHERE module_id = 2
    ) THEN
        RAISE EXCEPTION 'Module 2 was not found.';
    END IF;

    -- Prevent duplicate lesson insertion
    IF EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE module_id = 2
        AND lesson_number = 4
    ) THEN
        RAISE EXCEPTION 'Module 2 Lesson 4 already exists. No changes were made.';
    END IF;

    -- Create Lesson 4
    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        2,
        4,
        'Links and Navigation',
        'links-and-navigation',
        'Learn how to create hyperlinks, use absolute and relative URLs, link to sections within a page, and build website navigation menus.',
        'beginner',
        30,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;


    -- Create Lesson 4 Quiz
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
        4,
        'Lesson 2.4 Knowledge Check',
        'Test your understanding of HTML links, URLs and navigation.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: INTRODUCTION
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
        'Introduction to Links and Navigation',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Links allow users to move between web pages, websites and different sections of the same page.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML uses the anchor element <a> to create hyperlinks. Links are important because they connect information and allow users to navigate a website.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'The anchor element <a> creates a hyperlink, while the href attribute specifies where the link should take the user.'
                )
            )
        )
    );


    -- SECTION 2: CREATING A BASIC HYPERLINK
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
        'Creating a Basic Hyperlink',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The anchor element is used to create clickable links. Its href attribute specifies the destination address.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Basic hyperlink structure',
                    'language', 'html',
                    'code', $code$
<a href="destination">Link Text</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The href attribute contains the destination, while the text between the opening and closing anchor tags is displayed as the clickable link.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Linking to Google',
                    'language', 'html',
                    'code', $code$
<a href="https://www.google.com">Visit Google</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'When the user clicks Visit Google, the browser navigates to the specified web address.'
                )
            )
        )
    );


    -- SECTION 3: ABSOLUTE URLS
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
        'Understanding Absolute URLs',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An absolute URL contains the complete web address of a resource. It provides the browser with the full destination needed to locate that resource.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Absolute URL',
                    'language', 'html',
                    'code', $code$
<a href="https://www.example.com/about.html">
    About Us
</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An absolute URL normally contains the following parts:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Protocol: such as https://.',
                        'Domain name: the website address, such as www.example.com.',
                        'Path: the location of the resource, where applicable.'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'When to use absolute URLs',
                    'text', 'Absolute URLs are useful when linking to external websites or resources.'
                )
            )
        )
    );


    -- SECTION 4: RELATIVE URLS
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
        'Understanding Relative URLs',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A relative URL identifies a resource based on the location of the current HTML document. Unlike an absolute URL, it does not need to contain the complete website address.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Suppose a website has the following folder structure:'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Website folder structure',
                    'language', 'plaintext',
                    'code', $code$
website/
│
├── index.html
│
├── about.html
│
├── pages/
│   └── contact.html
│
└── images/
    └── logo.png
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'From index.html, the following relative paths can be used to access other pages:'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Linking to about.html',
                    'language', 'html',
                    'code', $code$
<a href="about.html">About</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Linking to contact.html',
                    'language', 'html',
                    'code', $code$
<a href="pages/contact.html">Contact</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'From pages/contact.html, the developer can use ../ to move one directory level upwards and access index.html.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Linking back to index.html',
                    'language', 'html',
                    'code', $code$
<a href="../index.html">Home</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Understanding ../',
                    'text', 'The ../ notation moves one directory level upwards. Understanding relative paths is important when building websites with multiple pages and folders.'
                )
            )
        )
    );


    -- SECTION 5: OPENING LINKS IN A NEW TAB
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
        'heading',
        'Opening Links in a New Tab',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The target attribute controls where the linked document opens. One common value is _blank, which requests that the link open in a new browsing context, commonly a new tab.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Opening an external link in a new tab',
                    'language', 'html',
                    'code', $code$
<a href="https://www.example.com"
   target="_blank"
   rel="noopener noreferrer">
    Visit Example
</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The target="_blank" attribute requests a new browsing context. The rel="noopener noreferrer" attribute adds security and privacy protections when opening an external page in that context.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Best practice',
                    'text', 'Use this behaviour only when it makes sense for the user experience. When opening external links in a new tab, include rel="noopener noreferrer".'
                )
            )
        )
    );


    -- SECTION 6: LINKING TO SECTIONS WITHIN THE SAME PAGE
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'Linking to Sections Within the Same Page',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A hyperlink can take a user to a particular section of the current page. This is done by assigning an ID to the target element and using that ID in the link.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'First, give the element you want to link to a unique ID:'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Step 1: Assign an ID to the target element',
                    'language', 'html',
                    'code', $code$
<h2 id="courses">Available Courses</h2>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Next, create a link that references the ID using the # symbol:'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Step 2: Create the section link',
                    'language', 'html',
                    'code', $code$
<a href="#courses">View Courses</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'When the link is clicked, the browser navigates to the element with the matching ID.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'IDs should be unique within an HTML document. The ID in the href attribute must match the target element ID exactly.'
                )
            )
        )
    );


    -- SECTION 7: CREATING NAVIGATION MENUS
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'heading',
        'Creating Navigation Menus',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <nav> element represents a section containing navigation links. It is commonly used for menus that help users move between the main pages of a website.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Basic navigation menu',
                    'language', 'html',
                    'code', $code$
<nav>
    <a href="index.html">Home</a>

    <a href="about.html">About</a>

    <a href="courses.html">Courses</a>

    <a href="contact.html">Contact</a>
</nav>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A more organised navigation structure uses an unordered list. Each navigation link is placed inside a list item.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Navigation menu using an unordered list',
                    'language', 'html',
                    'code', $code$
<nav>
    <ul>
        <li><a href="index.html">Home</a></li>

        <li><a href="about.html">About</a></li>

        <li><a href="courses.html">Courses</a></li>

        <li><a href="contact.html">Contact</a></li>
    </ul>
</nav>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'CSS can then be used to display the navigation links horizontally and control their spacing, colours and appearance.'
                )
            )
        )
    );


    -- SECTION 8: EMAIL AND TELEPHONE LINKS
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        8,
        'heading',
        'Email and Telephone Links',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML supports special link destinations that allow users to send emails or make telephone calls.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Email Links'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The mailto: scheme creates a link that usually opens the user''s configured email application.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating an email link',
                    'language', 'html',
                    'code', $code$
<a href="mailto:support@example.com">
    Email Support
</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Telephone Links'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The tel: scheme creates a link that can open the phone application on supported devices, with the specified telephone number ready to call.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating a telephone link',
                    'language', 'html',
                    'code', $code$
<a href="tel:+27123456789">
    Call Us
</a>
$code$::text
                )
            )
        )
    );


    -- SECTION 9: PRACTICAL EXAMPLE
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        9,
        'heading',
        'Practical Example: Website Navigation',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The following example combines hyperlinks, navigation menus, relative URLs and email links to create a simple website navigation structure.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Complete website navigation example',
                    'language', 'html',
                    'code', $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Learning Website</title>
</head>

<body>

    <header>
        <h1>CodeXperts</h1>

        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>

                <li><a href="learning.html">Learning Paths</a></li>

                <li><a href="community.html">Community</a></li>

                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>

        <h2>Start Your Coding Journey</h2>

        <p>Choose a language and begin learning.</p>

        <a href="learning.html">Explore Courses</a>

        <h2 id="contact">Contact Us</h2>

        <p>
            Email:
            <a href="mailto:support@codexperts.com">
                support@codexperts.com
            </a>
        </p>

    </main>

</body>

</html>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The example uses a header for the website title and navigation menu, a main element for the page content, relative links to other pages, and a mailto link for contacting the website.'
                )
            )
        )
    );


    -- SECTION 10: COMMON MISTAKES
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        10,
        'heading',
        'Common Mistakes',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'heading',
                    'text', '1. Forgetting the href Attribute'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An anchor element without an href attribute does not define a navigation destination.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Missing href attribute',
                    'language', 'html',
                    'code', $code$
<a>Visit Website</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Including the href attribute',
                    'language', 'html',
                    'code', $code$
<a href="https://www.example.com">Visit Website</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'divider'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', '2. Using an Incorrect File Path'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'If a page is located inside a folder, the relative URL must include that folder name.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Missing the pages folder',
                    'language', 'html',
                    'code', $code$
<a href="contact.html">Contact</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Including the folder in the path',
                    'language', 'html',
                    'code', $code$
<a href="pages/contact.html">Contact</a>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'divider'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', '3. Linking to a Non-existent ID'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The ID in the link must match the ID of the target element. If the values are different, the browser cannot find the intended section.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Mismatched IDs',
                    'language', 'html',
                    'code', $code$
<a href="#services">Services</a>

<h2 id="service">Our Services</h2>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Matching IDs',
                    'language', 'html',
                    'code', $code$
<a href="#services">Services</a>

<h2 id="services">Our Services</h2>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Alternatively, the link could be changed to href="#service" to match the original heading ID.'
                )
            )
        )
    );


    -- SECTION 11: IMPORTANT POINTS TO REMEMBER
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        11,
        'summary',
        'Important Points to Remember',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        '<a> creates hyperlinks.',
                        'href specifies the destination of a link.',
                        'Absolute URLs contain a complete web address.',
                        'Relative URLs depend on the current document''s location.',
                        '../ moves one directory level upwards.',
                        'target="_blank" requests a new browsing context.',
                        'rel="noopener noreferrer" adds useful security and privacy protections for external links opened in a new context.',
                        '#id links to an element with a matching ID.',
                        '<nav> identifies a navigation section.',
                        'mailto: creates email links.',
                        'tel: creates telephone links.'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Lesson takeaway',
                    'text', 'Links connect pages and information. Understanding URLs, relative paths and navigation elements helps you build websites that users can move through easily.'
                )
            )
        )
    );


    -- SECTION 12: KNOWLEDGE CHECK
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
        12,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of HTML links and navigation by answering the following questions.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1
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
        'A file named contact.html is located inside the pages folder. A developer is currently editing index.html, which is located in the website''s root folder. Which link correctly points to the contact page?',
        '[
            {"label":"A","text":"<a href=\"../contact.html\">Contact</a>"},
            {"label":"B","text":"<a href=\"/pages/contact.html\">Contact</a>"},
            {"label":"C","text":"<a href=\"pages/contact.html\">Contact</a>"},
            {"label":"D","text":"<a href=\"contact/pages.html\">Contact</a>"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'The correct answer is C. The contact page is inside the pages folder, which is a child directory of the current root directory. Therefore, pages/contact.html is the correct relative path.',
        3,
        TRUE
    );


    -- QUESTION 2
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
        'Consider the following code: <a href="#pricing">View Pricing</a> <h2 id="prices">Our Pricing</h2>. What happens when the user clicks the link?',
        '[
            {"label":"A","text":"The browser navigates to the pricing heading because both IDs refer to the same topic."},
            {"label":"B","text":"The browser searches for an element with an ID of pricing, but no matching element exists."},
            {"label":"C","text":"The browser opens a new page called pricing.html."},
            {"label":"D","text":"The browser displays the text View Pricing as a heading."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The correct answer is B. The link points to pricing, but the heading has the ID prices. The values must match exactly for the browser to locate the intended element.',
        3,
        TRUE
    );


    -- QUESTION 3
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
        'Which combination is most appropriate when an external link should open in a new tab with additional security protections?',
        '[
            {"label":"A","text":"target=\"_self\" and rel=\"external\""},
            {"label":"B","text":"target=\"_blank\" and rel=\"noopener noreferrer\""},
            {"label":"C","text":"href=\"_blank\" and target=\"noopener\""},
            {"label":"D","text":"target=\"new\" and rel=\"blank\""}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The correct answer is B. target="_blank" requests that the destination opens in a new browsing context, commonly a new tab. rel="noopener noreferrer" adds security and privacy protections.',
        3,
        TRUE
    );


    -- Publish the lesson and quiz
    UPDATE public.lesson
    SET status = 'published'
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;


    RAISE NOTICE 'Lesson 4 created successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id,
        v_quiz_id;

END $$;





-- LESSON 5
DO $$
DECLARE
    v_lesson_id BIGINT;
    v_quiz_id BIGINT;
BEGIN

    -- Check that Module 2 exists
    IF NOT EXISTS (
        SELECT 1
        FROM public.module
        WHERE module_id = 2
    ) THEN
        RAISE EXCEPTION 'Module 2 was not found.';
    END IF;

    -- Prevent duplicate lesson insertion
    IF EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE module_id = 2
        AND lesson_number = 5
    ) THEN
        RAISE EXCEPTION 'Module 2 Lesson 5 already exists. No changes were made.';
    END IF;


    -- CREATE LESSON 5
    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        2,
        5,
        'Images and Media',
        'images-and-media',
        'Learn how to add images, audio, video and external content to HTML pages using media elements and their attributes.',
        'beginner',
        35,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;


    -- CREATE LESSON 5 QUIZ
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
        5,
        'Lesson 2.5 Knowledge Check',
        'Test your understanding of HTML images, audio, video and embedded content.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: INTRODUCTION
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
        'Introduction to Images and Media',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Web pages are not limited to text. HTML allows developers to add images, audio, video and other media to make websites more informative and engaging.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Media elements are useful for different purposes, including:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Displaying product photographs.',
                        'Showing profile pictures.',
                        'Presenting diagrams.',
                        'Playing instructional videos.',
                        'Adding audio lessons.',
                        'Displaying demonstrations.'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Lesson overview',
                    'text', 'In this lesson, you will learn how to display images, add captions, play audio and video files, and embed external content in an HTML document.'
                )
            )
        )
    );


    -- SECTION 2: ADDING IMAGES
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
        'Adding Images Using the IMG Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <img> element is used to display an image on a web page. It uses attributes to identify the image file and provide alternative text.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Displaying an image',
                    'language', 'html',
                    'code', $code$
<img src="images/logo.png" alt="CodeXperts logo">
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <img> element is a void element, meaning it does not have a closing tag.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'It uses two important attributes:'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'The src Attribute'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The src attribute specifies the location or path of the image file that the browser should display.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'The alt Attribute'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The alt attribute provides alternative text describing the image. This text is important for accessibility and can be displayed when an image cannot load.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'The src attribute tells the browser where to find the image, while alt provides a text description of the image.'
                )
            )
        )
    );


    -- SECTION 3: IMAGE PATHS
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
        'Understanding Image Paths',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Images can be stored in different folders within a website. The image path in the src attribute must correctly identify where the image is located.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Consider the following website folder structure:'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Website image folder structure',
                    'language', 'plaintext',
                    'code', $code$
website/
│
├── index.html
│
└── images/
    ├── logo.png
    └── student.jpg
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'If index.html needs to display logo.png, the image path should include the images folder.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Displaying an image from the images folder',
                    'language', 'html',
                    'code', $code$
<img src="images/logo.png" alt="Website logo">
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Images can also be loaded from external websites using a complete web address, provided that the image is publicly accessible.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Displaying an image from an external website',
                    'language', 'html',
                    'code', $code$
<img
    src="https://example.com/images/photo.jpg"
    alt="A student working on a computer"
>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'An external image must be accessible at the specified address for the browser to display it.'
                )
            )
        )
    );


    -- SECTION 4: ALTERNATIVE TEXT
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
        'Understanding Alternative Text',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The alt attribute provides a text description of an image. It is especially important for accessibility because screen reader users can use the description to understand the purpose or meaning of an image.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Descriptive alternative text',
                    'language', 'html',
                    'code', $code$
<img
    src="student.jpg"
    alt="A student practising HTML on a laptop"
>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Alternative text can also be displayed when an image cannot load.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Decorative images that do not provide meaningful information should generally use an empty alt attribute.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Decorative image',
                    'language', 'html',
                    'code', $code$
<img src="decorative-line.png" alt="">
$code$::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Accessibility tip',
                    'text', 'Write alternative text that describes the purpose or meaningful content of an image. Avoid using a filename as alternative text unless the filename itself meaningfully describes the image.'
                )
            )
        )
    );


    -- SECTION 5: IMAGE DIMENSIONS
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
        'heading',
        'Controlling Image Dimensions',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The width and height attributes can be used to specify the dimensions of an image. These attributes help the browser reserve space for the image before it finishes loading.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Setting image dimensions',
                    'language', 'html',
                    'code', $code$
<img
    src="profile.jpg"
    alt="Student profile picture"
    width="200"
    height="200"
>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'CSS can also be used to control image dimensions and appearance. This provides more flexibility when styling images across a website.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Styling an image with CSS',
                    'language', 'html',
                    'code', $code$
<img
    src="profile.jpg"
    alt="Student profile picture"
    class="profile-image"
>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'CSS image styling',
                    'language', 'css',
                    'code', $code$
.profile-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 50%;
}
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The object-fit: cover property allows the image to fill its container while maintaining its proportions. Parts of the image may be cropped when necessary.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'HTML attributes can specify image dimensions, while CSS provides additional control over image sizing and appearance.'
                )
            )
        )
    );


    -- SECTION 6: FIGURE AND FIGCAPTION
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'Using FIGURE and FIGCAPTION',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <figure> element represents self-contained content, such as an image, illustration or diagram.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <figcaption> element provides a caption or description for the content inside the figure.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Image with a caption',
                    'language', 'html',
                    'code', $code$
<figure>

    <img
        src="html-structure.png"
        alt="Diagram showing the structure of an HTML document"
    >

    <figcaption>
        Figure 1: Basic structure of an HTML document.
    </figcaption>

</figure>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This structure is useful when an image needs an explanation or description. The figure element groups the content, while figcaption provides its caption.'
                )
            )
        )
    );


    -- SECTION 7: ADDING AUDIO
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'heading',
        'Adding Audio',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <audio> element allows a browser to play audio files such as music, recordings and instructional lessons.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Adding an audio file',
                    'language', 'html',
                    'code', $code$
<audio controls>

    <source src="audio/lesson.mp3" type="audio/mpeg">

    Your browser does not support audio playback.

</audio>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The controls attribute displays playback controls such as play, pause and volume. The source element identifies the audio file and its media type.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Other useful audio attributes include:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'autoplay: Requests automatic playback.',
                        'loop: Repeats the audio after it finishes.',
                        'muted: Starts the audio without sound.',
                        'preload: Provides a hint about loading audio before playback.'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'Browsers may restrict automatic playback, especially when audio is not muted. Always consider the user experience when using autoplay.'
                )
            )
        )
    );


    -- SECTION 8: ADDING VIDEO
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        8,
        'heading',
        'Adding Video',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <video> element allows a browser to display and play video content directly within a web page.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Adding a video file',
                    'language', 'html',
                    'code', $code$
<video width="600" controls>

    <source src="videos/tutorial.mp4" type="video/mp4">

    Your browser does not support video playback.

</video>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The video element supports several useful attributes:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'controls: Displays video playback controls.',
                        'width: Specifies the width of the video.',
                        'height: Specifies the height of the video.',
                        'poster: Specifies an image shown before playback.',
                        'autoplay: Requests automatic playback.',
                        'loop: Repeats the video after it finishes.',
                        'muted: Starts the video without sound.'
                    )
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The poster attribute can be used to display a thumbnail image before the video begins playing.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Video with a poster image',
                    'language', 'html',
                    'code', $code$
<video
    width="600"
    controls
    poster="images/video-thumbnail.jpg"
>

    <source src="videos/html-tutorial.mp4" type="video/mp4">

</video>
$code$::text
                )
            )
        )
    );


    -- SECTION 9: EMBEDDING EXTERNAL CONTENT
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        9,
        'heading',
        'Embedding External Content',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The <iframe> element allows another webpage or external resource to be embedded inside the current HTML page.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Embedding an external webpage',
                    'language', 'html',
                    'code', $code$
<iframe
    src="https://www.example.com"
    title="Example website"
    width="600"
    height="400"
>
</iframe>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A common use of iframes is embedding maps, videos and other content from external services.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'For example, a YouTube video can be embedded using its embed URL:'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Embedding a YouTube video',
                    'language', 'html',
                    'code', $code$
<iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="HTML tutorial video"
    allowfullscreen
>
</iframe>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Replace VIDEO_ID with the actual video identifier supplied by YouTube.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Security and privacy',
                    'text', 'Only embed content from sources you trust. Also consider the privacy and security implications of third-party content.'
                )
            )
        )
    );


    -- SECTION 10: PRACTICAL EXAMPLE
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        10,
        'heading',
        'Practical Example: Media Learning Page',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The following example combines images, captions, audio and video to create a simple media learning page.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Complete HTML media learning page',
                    'language', 'html',
                    'code', $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>HTML Media Lesson</title>
</head>

<body>

    <h1>Learning with Media</h1>

    <h2>Lesson Image</h2>

    <figure>
        <img
            src="images/html-example.png"
            alt="Example of HTML code displayed in an editor"
            width="400"
        >

        <figcaption>
            An example of HTML code.
        </figcaption>
    </figure>

    <h2>Audio Lesson</h2>

    <audio controls>
        <source src="audio/introduction.mp3" type="audio/mpeg">
        Your browser does not support audio.
    </audio>

    <h2>Video Lesson</h2>

    <video width="500" controls>
        <source src="videos/introduction.mp4" type="video/mp4">
        Your browser does not support video.
    </video>

</body>

</html>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The page displays an image with alternative text and a caption, an audio lesson with playback controls, and a video lesson with playback controls.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Practical tip',
                    'text', 'Make sure the images, audio files and video files exist in the folders specified by their respective paths. Otherwise, the browser may not be able to load them.'
                )
            )
        )
    );


    -- SECTION 11: COMMON MISTAKES
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        11,
        'heading',
        'Common Mistakes',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'heading',
                    'text', '1. Using an Incorrect Image Path'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'If an image is stored inside the images folder, the src attribute must include the correct folder path.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Missing the images folder',
                    'language', 'html',
                    'code', $code$
<img src="logo.png" alt="Logo">
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Using the correct image path',
                    'language', 'html',
                    'code', $code$
<img src="images/logo.png" alt="Logo">
$code$::text
                ),
                jsonb_build_object(
                    'type', 'divider'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', '2. Missing Alternative Text'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'For meaningful images, forgetting the alt attribute can make the content less accessible to users who rely on screen readers.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Missing alternative text',
                    'language', 'html',
                    'code', $code$
<img src="student.jpg">
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Providing alternative text',
                    'language', 'html',
                    'code', $code$
<img
    src="student.jpg"
    alt="Student working on a computer"
>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'divider'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', '3. Using the Wrong Media Element'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Different media elements are designed for different types of content. Use <audio> for audio files and <video> for video files. Do not use an image element to display a video file.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Using an image element for a video',
                    'language', 'html',
                    'code', $code$
<img src="lesson.mp4" alt="Lesson video">
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Using the video element',
                    'language', 'html',
                    'code', $code$
<video controls>
    <source src="lesson.mp4" type="video/mp4">
    Your browser does not support video.
</video>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'divider'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', '4. Forgetting Video Controls'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Without the controls attribute, users may not have visible playback controls to play, pause or adjust the video.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Video without controls',
                    'language', 'html',
                    'code', $code$
<video src="lesson.mp4"></video>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Video with playback controls',
                    'language', 'html',
                    'code', $code$
<video controls>
    <source src="lesson.mp4" type="video/mp4">
    Your browser does not support video.
</video>
$code$::text
                )
            )
        )
    );


    -- SECTION 12: IMPORTANT POINTS TO REMEMBER
    INSERT INTO public.lesson_section (
        lesson_id,
        display_order,
        section_type,
        section_title,
        section_content
    )
    VALUES (
        v_lesson_id,
        12,
        'summary',
        'Important Points to Remember',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        '<img> displays images.',
                        'src specifies the media location.',
                        'alt provides alternative text.',
                        'width and height specify image dimensions.',
                        '<figure> groups self-contained media or content.',
                        '<figcaption> provides a caption.',
                        '<audio> plays audio files.',
                        '<video> plays video files.',
                        '<source> identifies media resources.',
                        '<iframe> embeds another resource within the page.'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Lesson takeaway',
                    'text', 'HTML provides different elements for displaying and embedding media. Choosing the correct element, providing alternative text and using valid file paths help create accessible and functional web pages.'
                )
            )
        )
    );


    -- SECTION 13: KNOWLEDGE CHECK
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
        13,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of HTML images, alternative text, audio and video elements by answering the following questions.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1
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
        'A website displays an image that is purely decorative and does not communicate any additional information. Which alternative-text approach is most appropriate?',
        '[
            {"label":"A","text":"alt=\"decorative-line.png\""},
            {"label":"B","text":"alt=\"image\""},
            {"label":"C","text":"alt=\"\""},
            {"label":"D","text":"Remove the alt attribute because decorative images do not need accessibility support."}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'The correct answer is C. An empty alternative text tells assistive technology that the image is decorative and can generally be ignored.',
        3,
        TRUE
    );


    -- QUESTION 2
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
        'A developer wants to display an image stored in an images folder located next to the current HTML file. Which value should be used for the image''s src attribute?',
        '[
            {"label":"A","text":"src=\"../images/photo.jpg\""},
            {"label":"B","text":"src=\"images/photo.jpg\""},
            {"label":"C","text":"src=\"/../photo.jpg\""},
            {"label":"D","text":"src=\"photo/images.jpg\""}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The correct answer is B. The images folder is a child directory of the current directory, so images/photo.jpg is the correct relative path.',
        3,
        TRUE
    );


    -- QUESTION 3
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
        'Which HTML structure correctly provides a video file with browser playback controls and a fallback message?',
        '[
            {"label":"A","text":"<video src=\"lesson.mp4\"><controls>Video unavailable.</controls></video>"},
            {"label":"B","text":"<video controls><source src=\"lesson.mp4\" type=\"video/mp4\">Your browser does not support video.</video>"},
            {"label":"C","text":"<img src=\"lesson.mp4\" controls>"},
            {"label":"D","text":"<audio controls><source src=\"lesson.mp4\" type=\"video/mp4\"></audio>"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The correct answer is B. It uses the video element with the controls attribute, identifies the video file through the source element, and provides fallback text for browsers that do not support video playback.',
        3,
        TRUE
    );


    -- PUBLISH LESSON AND QUIZ
    UPDATE public.lesson
    SET status = 'published'
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;


    RAISE NOTICE 'Lesson 5 created successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id,
        v_quiz_id;

END $$;


-- Lesson 6 -9

DO $$
DECLARE
    v_lesson_id BIGINT;
    v_quiz_id BIGINT;
BEGIN

    -- Check that Module 2 exists.
    IF NOT EXISTS (
        SELECT 1
        FROM public.module
        WHERE module_id = 2
    ) THEN
        RAISE EXCEPTION 'Module 2 was not found.';
    END IF;

    -- Prevent duplicate lesson insertion.
    IF EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE module_id = 2
        AND lesson_number IN (6, 7, 8)
    ) THEN
        RAISE EXCEPTION 'At least one of Lessons 6, 7 or 8 already exists. No changes were made.';
    END IF;


    -- =========================================================
    -- LESSON 6: ORDERED AND UNORDERED LISTS
    -- =========================================================

    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        2,
        6,
        'Ordered and Unordered Lists',
        'ordered-and-unordered-lists',
        'Learn how to organise information using ordered lists, unordered lists, description lists and nested lists in HTML.',
        'beginner',
        35,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;

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
        6,
        'Lesson 2.6 Knowledge Check',
        'Test your understanding of HTML ordered lists, unordered lists, description lists and nested lists.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: INTRODUCTION

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to HTML Lists',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'HTML lists organise related information into groups. They make information easier to read, understand and navigate.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'HTML provides three commonly used list types: ordered lists, unordered lists and description lists. Each type is suitable for a different purpose.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Ordered lists.',
                        'Unordered lists.',
                        'Description lists.'
                    )
                )
            )
        )
    );


    -- SECTION 2: ORDERED LISTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        2,
        'heading',
        'Ordered Lists',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'An ordered list displays items in a specific sequence. It is created using the <ol> element. Each item is placed inside an <li> element.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating an ordered list',
                    'language', 'html',
                    'code',
                    $code$
<h2>Steps to Create a Website</h2>

<ol>
    <li>Plan the website.</li>
    <li>Create the HTML structure.</li>
    <li>Add CSS styling.</li>
    <li>Implement JavaScript.</li>
    <li>Test the website.</li>
</ol>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The browser normally displays ordered list items using numbers.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Ordered lists are useful when the sequence matters, instructions must be followed in order, ranking or position is important, or a process has multiple steps.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'When the sequence matters.',
                        'When instructions must be followed in order.',
                        'When ranking or position is important.',
                        'When a process has multiple steps.'
                    )
                )
            )
        )
    );


    -- SECTION 3: CHANGING NUMBERING STYLE

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        3,
        'heading',
        'Changing the Numbering Style',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The type attribute can change the numbering style of an ordered list.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Using alphabetical numbering',
                    'language', 'html',
                    'code',
                    $code$
<ol type="A">
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
</ol>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Other supported values include:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        '1 — Numbers: 1, 2, 3.',
                        'A — Uppercase letters: A, B, C.',
                        'a — Lowercase letters: a, b, c.',
                        'I — Uppercase Roman numerals: I, II, III.',
                        'i — Lowercase Roman numerals: i, ii, iii.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Using Roman numerals',
                    'language', 'html',
                    'code',
                    $code$
<ol type="I">
    <li>Introduction</li>
    <li>Development</li>
    <li>Conclusion</li>
</ol>
$code$::text
                )
            )
        )
    );


    -- SECTION 4: STARTING FROM A DIFFERENT NUMBER

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        4,
        'heading',
        'Starting from a Different Number',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The start attribute specifies the starting number of an ordered list.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Starting an ordered list at 5',
                    'language', 'html',
                    'code',
                    $code$
<ol start="5">
    <li>Testing</li>
    <li>Deployment</li>
    <li>Maintenance</li>
</ol>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The list starts at 5 instead of 1.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The reversed attribute can display the list in descending order.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Reversed ordered list',
                    'language', 'html',
                    'code',
                    $code$
<ol reversed>
    <li>Three</li>
    <li>Two</li>
    <li>One</li>
</ol>
$code$::text
                )
            )
        )
    );


    -- SECTION 5: UNORDERED LISTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        5,
        'heading',
        'Unordered Lists',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'An unordered list displays items without indicating a particular sequence. It uses the <ul> element.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating an unordered list',
                    'language', 'html',
                    'code',
                    $code$
<h2>Programming Languages</h2>

<ul>
    <li>Python</li>
    <li>Java</li>
    <li>C++</li>
    <li>JavaScript</li>
</ul>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The browser normally displays unordered list items using bullet points.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Unordered lists are useful when the sequence does not matter, when displaying a collection of items, listing available options or grouping related information.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'When the sequence does not matter.',
                        'When displaying a collection of items.',
                        'When listing available options.',
                        'When grouping related information.'
                    )
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'CSS can change the appearance of unordered list bullets.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Changing the bullet style',
                    'language', 'css',
                    'code',
                    $code$
ul {
    list-style-type: square;
}
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Other supported list-style-type values include disc, circle, square and none.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'disc',
                        'circle',
                        'square',
                        'none'
                    )
                )
            )
        )
    );


    -- SECTION 6: DESCRIPTION LISTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'Description Lists',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A description list displays terms and their corresponding descriptions. It uses three main elements.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        '<dl> defines the description list.',
                        '<dt> identifies a term.',
                        '<dd> provides the term description.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating a description list',
                    'language', 'html',
                    'code',
                    $code$
<dl>

    <dt>HTML</dt>
    <dd>Used to structure web pages.</dd>

    <dt>CSS</dt>
    <dd>Used to style web pages.</dd>

    <dt>JavaScript</dt>
    <dd>Used to add interactivity.</dd>

</dl>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Description lists are useful for glossaries, definitions, frequently asked questions and technical terminology.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Glossaries.',
                        'Definitions.',
                        'Frequently asked questions.',
                        'Technical terminology.'
                    )
                )
            )
        )
    );


    -- SECTION 7: NESTED LISTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'heading',
        'Nested Lists',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A nested list is a list placed inside another list. Nested lists help represent categories and subcategories.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating nested lists',
                    'language', 'html',
                    'code',
                    $code$
<h2>Learning Paths</h2>

<ul>

    <li>Web Development
        <ul>
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ul>
    </li>

    <li>Software Development
        <ul>
            <li>Java</li>
            <li>Python</li>
            <li>C++</li>
        </ul>
    </li>

</ul>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'content', 'The nested list should be placed inside the relevant list item. This keeps the parent item and its subcategories correctly connected.'
                )
            )
        )
    );


    -- SECTION 8: NAVIGATION LISTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        8,
        'heading',
        'Creating a Navigation List',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Navigation menus commonly use unordered lists because the order of links usually does not represent a numbered process.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating a navigation menu',
                    'language', 'html',
                    'code',
                    $code$
<nav>

    <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="courses.html">Courses</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
    </ul>

</nav>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'CSS can remove the default bullet points and arrange navigation links horizontally.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Styling the navigation list',
                    'language', 'css',
                    'code',
                    $code$
nav ul {
    list-style: none;
    padding: 0;
    display: flex;
    gap: 20px;
}
$code$::text
                )
            )
        )
    );


    -- SECTION 9: PRACTICAL EXAMPLE

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        9,
        'heading',
        'Practical Example: Student Course List',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The following example combines ordered lists, unordered lists and description lists to create a student learning plan.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Complete HTML student course list',
                    'language', 'html',
                    'code',
                    $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Student Courses</title>
</head>

<body>

    <h1>My Learning Plan</h1>

    <h2>Steps to Complete My Course</h2>

    <ol>
        <li>Register for the course.</li>
        <li>Complete the lessons.</li>
        <li>Attempt the quizzes.</li>
        <li>Build a practical project.</li>
    </ol>

    <h2>Available Languages</h2>

    <ul>
        <li>Python</li>
        <li>Java</li>
        <li>JavaScript</li>
    </ul>

    <h2>Technology Definitions</h2>

    <dl>
        <dt>Frontend</dt>
        <dd>The part of a website users interact with.</dd>

        <dt>Backend</dt>
        <dd>The server-side part responsible for application logic and data processing.</dd>
    </dl>

</body>
</html>
$code$::text
                )
            )
        )
    );


    -- SECTION 10: COMMON MISTAKES

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        10,
        'heading',
        'Common Mistakes',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'One common mistake is using an <li> element outside a list. List items should be placed inside an ordered or unordered list.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: List item outside a list',
                    'language', 'html',
                    'code',
                    $code$
<li>HTML</li>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: List item inside a list',
                    'language', 'html',
                    'code',
                    $code$
<ul>
    <li>HTML</li>
</ul>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Another mistake is using ordered lists when the sequence does not matter. An unordered list is generally more appropriate for a collection of unrelated options.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Incorrectly nesting lists can also create an invalid structure. If a subcategory belongs to a parent item, the nested list should be placed inside that parent <li> element.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect: Nested list outside the parent item',
                    'language', 'html',
                    'code',
                    $code$
<ul>
    <li>Programming</li>
</ul>

<ul>
    <li>Python</li>
</ul>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct: Nested list inside the parent item',
                    'language', 'html',
                    'code',
                    $code$
<ul>
    <li>Programming
        <ul>
            <li>Python</li>
        </ul>
    </li>
</ul>
$code$::text
                )
            )
        )
    );


    -- SECTION 11: IMPORTANT POINTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        11,
        'summary',
        'Important Points to Remember',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        '<ol> creates an ordered list.',
                        '<ul> creates an unordered list.',
                        '<li> defines a list item.',
                        '<dl> creates a description list.',
                        '<dt> defines a description term.',
                        '<dd> contains the term description.',
                        'Lists can be nested.',
                        'The type and start attributes can modify ordered lists.',
                        'CSS can change the visual appearance of lists.'
                    )
                )
            )
        )
    );


    -- SECTION 12: KNOWLEDGE CHECK

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        12,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Test your understanding of ordered lists, unordered lists, description lists and nested lists by completing the following questions.'
                )
            )
        ),
        v_quiz_id
    );


    -- LESSON 6 QUESTIONS

    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES
    (
        v_quiz_id,
        1,
        'multiple_choice',
        'A developer is creating a list of instructions where the sequence of the items must be preserved. Which list type is most suitable?',
        '[
            {"label":"A","text":"<ul>, because it automatically organises items by importance."},
            {"label":"B","text":"<dl>, because it connects each instruction to a description."},
            {"label":"C","text":"<ol>, because it represents an ordered sequence."},
            {"label":"D","text":"<li>, because it creates numbered lists independently."}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'An ordered list communicates that the position or sequence of the items matters.',
        3,
        TRUE
    ),
    (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which code correctly places a nested list under the item "Frontend Development"?',
        '[
            {"label":"A","text":"<ul><li>Frontend Development</li><ul><li>HTML</li><li>CSS</li></ul></ul>"},
            {"label":"B","text":"<ul><li>Frontend Development<ul><li>HTML</li><li>CSS</li></ul></li></ul>"},
            {"label":"C","text":"<li><ul><li>Frontend Development</li></ul></li>"},
            {"label":"D","text":"<ul><li>Frontend Development</li><li><dd>HTML</dd><dd>CSS</dd></li></ul>"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The nested list is inside the parent list item. This correctly represents the relationship between the parent topic and its subtopics.',
        3,
        TRUE
    ),
    (
        v_quiz_id,
        3,
        'multiple_choice',
        'A developer wants to display technical terms followed by their explanations. Which elements are specifically designed for this purpose?',
        '[
            {"label":"A","text":"<ol>, <li> and <h3>"},
            {"label":"B","text":"<ul>, <li> and <p>"},
            {"label":"C","text":"<dl>, <dt> and <dd>"},
            {"label":"D","text":"<nav>, <a> and <section>"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'Description list elements are designed for this purpose. <dl> groups the descriptions, <dt> identifies terms and <dd> contains the explanations.',
        3,
        TRUE
    );


    UPDATE public.lesson
    SET status = 'published'
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;

    RAISE NOTICE 'Lesson 6 created successfully. Lesson ID: %, Quiz ID: %', v_lesson_id, v_quiz_id;


    -- =========================================================
    -- LESSON 7: HTML TABLES
    -- =========================================================

    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        2,
        7,
        'HTML Tables',
        'html-tables',
        'Learn how to organise tabular information using HTML tables, rows, cells, captions and table sections.',
        'beginner',
        40,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;

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
        7,
        'Lesson 2.7 Knowledge Check',
        'Test your understanding of HTML table elements, table sections, spanning cells and accessibility.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: INTRODUCTION

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to HTML Tables',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'HTML tables are used to organise information into rows and columns. They are particularly useful when displaying information that has a relationship between different values.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Examples of information commonly displayed using tables include:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Student results.',
                        'Product prices.',
                        'Timetables.',
                        'Employee records.',
                        'Course information.',
                        'Financial reports.'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'content', 'Tables should be used for tabular data rather than general page layout.'
                )
            )
        )
    );


    -- SECTION 2: TABLE ELEMENTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        2,
        'heading',
        'Understanding Table Elements',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'HTML provides several elements for creating tables.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        '<table> defines the table.',
                        '<tr> defines a table row.',
                        '<th> defines a header cell.',
                        '<td> defines a standard data cell.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating a basic HTML table',
                    'language', 'html',
                    'code',
                    $code$
<table>

    <tr>
        <th>Name</th>
        <th>Course</th>
        <th>Mark</th>
    </tr>

    <tr>
        <td>Sarah</td>
        <td>HTML</td>
        <td>85</td>
    </tr>

    <tr>
        <td>John</td>
        <td>CSS</td>
        <td>78</td>
    </tr>

</table>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The first row contains headings, while the following rows contain student information.'
                )
            )
        )
    );


    -- SECTION 3: THEAD, TBODY AND TFOOT

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        3,
        'heading',
        'Understanding THEAD, TBODY and TFOOT',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Tables can be divided into logical sections to make their structure easier to understand.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        '<thead> contains the table header rows.',
                        '<tbody> contains the main data rows.',
                        '<tfoot> contains summary or footer rows.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Organising table sections',
                    'language', 'html',
                    'code',
                    $code$
<table>

    <thead>
        <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td>Laptop</td>
            <td>2</td>
            <td>R15 000</td>
        </tr>

        <tr>
            <td>Mouse</td>
            <td>5</td>
            <td>R500</td>
        </tr>
    </tbody>

    <tfoot>
        <tr>
            <th colspan="2">Total</th>
            <td>R15 500</td>
        </tr>
    </tfoot>

</table>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'These sections help organise the table and can improve accessibility and maintainability.'
                )
            )
        )
    );


    -- SECTION 4: TABLE CAPTION

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        4,
        'heading',
        'Adding a Table Caption',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <caption> element provides a title or description for a table. A caption helps users understand what the table represents.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Adding a table caption',
                    'language', 'html',
                    'code',
                    $code$
<table>

    <caption>Student Examination Results</caption>

    <tr>
        <th>Student</th>
        <th>Result</th>
    </tr>

    <tr>
        <td>Sarah</td>
        <td>85%</td>
    </tr>

</table>
$code$::text
                )
            )
        )
    );


    -- SECTION 5: COLSPAN

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        5,
        'heading',
        'Understanding COLSPAN',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The colspan attribute allows a table cell to extend across multiple columns.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Combining columns',
                    'language', 'html',
                    'code',
                    $code$
<table border="1">

    <tr>
        <th colspan="2">Student Details</th>
    </tr>

    <tr>
        <td>Name</td>
        <td>Sarah</td>
    </tr>

</table>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The first header cell occupies two columns. This is useful when a heading or value applies to several columns.'
                )
            )
        )
    );


    -- SECTION 6: ROWSPAN

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'Understanding ROWSPAN',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The rowspan attribute allows a table cell to extend across multiple rows.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Combining rows',
                    'language', 'html',
                    'code',
                    $code$
<table border="1">

    <tr>
        <th rowspan="2">Student</th>
        <th>Subject</th>
    </tr>

    <tr>
        <td>HTML</td>
    </tr>

</table>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The Student cell spans two rows.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'colspan combines columns horizontally.',
                        'rowspan combines rows vertically.'
                    )
                )
            )
        )
    );


    -- SECTION 7: STYLING TABLES

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'heading',
        'Styling Tables Using CSS',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'HTML defines the structure of a table, while CSS controls its appearance.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example HTML: Student results table',
                    'language', 'html',
                    'code',
                    $code$
<table class="results-table">

    <caption>Student Results</caption>

    <thead>
        <tr>
            <th>Name</th>
            <th>Subject</th>
            <th>Mark</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <td>Sarah</td>
            <td>HTML</td>
            <td>85%</td>
        </tr>

        <tr>
            <td>John</td>
            <td>CSS</td>
            <td>78%</td>
        </tr>
    </tbody>

</table>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example CSS: Styling the results table',
                    'language', 'css',
                    'code',
                    $code$
.results-table {
    width: 100%;
    border-collapse: collapse;
}

.results-table th,
.results-table td {
    border: 1px solid #cccccc;
    padding: 12px;
    text-align: left;
}

.results-table th {
    background-color: #172554;
    color: white;
}

.results-table tbody tr:nth-child(even) {
    background-color: #f2f2f2;
}
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Understanding the CSS properties used in this example:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'width: 100% makes the table fill its available width.',
                        'border-collapse: collapse combines adjacent borders.',
                        'padding creates space inside cells.',
                        'text-align controls text alignment.',
                        'nth-child(even) selects even-numbered rows.'
                    )
                )
            )
        )
    );


    -- SECTION 8: ACCESSIBILITY

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        8,
        'heading',
        'Understanding Table Headers and Accessibility',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A table header should identify the information represented by a row or column. The scope attribute helps identify whether a header applies to a column or a row.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Using table headers and scope',
                    'language', 'html',
                    'code',
                    $code$
<table>

    <caption>Student Marks</caption>

    <thead>
        <tr>
            <th scope="col">Student</th>
            <th scope="col">HTML</th>
            <th scope="col">CSS</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <th scope="row">Sarah</th>
            <td>85</td>
            <td>90</td>
        </tr>

        <tr>
            <th scope="row">John</th>
            <td>78</td>
            <td>82</td>
        </tr>
    </tbody>

</table>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'scope="col" identifies a column header.',
                        'scope="row" identifies a row header.'
                    )
                )
            )
        )
    );


    -- SECTION 9: PRACTICAL EXAMPLE

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        9,
        'heading',
        'Practical Exercise: Create a Course Table',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Create a table showing course name, instructor, duration and status.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Course name.',
                        'Instructor.',
                        'Duration.',
                        'Status.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Complete HTML course information table',
                    'language', 'html',
                    'code',
                    $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Course Information</title>
</head>

<body>

    <h1>Available Courses</h1>

    <table border="1">

        <caption>CodeXperts Course Information</caption>

        <thead>
            <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Duration</th>
                <th>Status</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>HTML</td>
                <td>Sarah</td>
                <td>4 Weeks</td>
                <td>Available</td>
            </tr>

            <tr>
                <td>Python</td>
                <td>John</td>
                <td>6 Weeks</td>
                <td>Available</td>
            </tr>
        </tbody>

    </table>

</body>
</html>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'content', 'The border attribute is shown here for a simple demonstration. In modern web development, CSS should normally be used to style table borders.'
                )
            )
        )
    );


    -- SECTION 10: COMMON MISTAKES

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        10,
        'heading',
        'Common Mistakes',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Placing table cells outside a <tr> element.',
                        'Using <td> for every cell, including headers.',
                        'Using tables to arrange general page layouts.',
                        'Forgetting that colspan affects columns and rowspan affects rows.',
                        'Creating tables without meaningful headings or captions when these are needed.'
                    )
                )
            )
        )
    );


    -- SECTION 11: IMPORTANT POINTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        11,
        'summary',
        'Important Points to Remember',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        '<table> creates a table.',
                        '<tr> creates a row.',
                        '<th> creates a header cell.',
                        '<td> creates a data cell.',
                        '<thead> groups header rows.',
                        '<tbody> groups the main data.',
                        '<tfoot> groups summary rows.',
                        '<caption> describes the table.',
                        'colspan spans columns.',
                        'rowspan spans rows.',
                        'scope identifies the relationship between headers and cells.'
                    )
                )
            )
        )
    );


    -- SECTION 12: KNOWLEDGE CHECK

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        12,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Test your understanding of HTML table elements, table sections, spanning cells and accessibility.'
                )
            )
        ),
        v_quiz_id
    );


    -- LESSON 7 QUESTIONS

    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES
    (
        v_quiz_id,
        1,
        'multiple_choice',
        'A table contains four columns. A heading must extend across the first three columns. Which attribute should be used?',
        '[
            {"label":"A","text":"rowspan=\"3\""},
            {"label":"B","text":"colspan=\"3\""},
            {"label":"C","text":"scope=\"row\""},
            {"label":"D","text":"span=\"3\""}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'colspan="3" makes a cell occupy three columns horizontally.',
        3,
        TRUE
    ),
    (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which element is most suitable for identifying the main data section of a table?',
        '[
            {"label":"A","text":"<tfoot>"},
            {"label":"B","text":"<caption>"},
            {"label":"C","text":"<tbody>"},
            {"label":"D","text":"<th>"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        '<tbody> groups the main body rows of the table.',
        3,
        TRUE
    ),
    (
        v_quiz_id,
        3,
        'multiple_choice',
        'A developer wants a cell containing a department name to extend vertically across three rows. Which implementation is appropriate?',
        '[
            {"label":"A","text":"<td colspan=\"3\">IT Department</td>"},
            {"label":"B","text":"<td rowspan=\"3\">IT Department</td>"},
            {"label":"C","text":"<th scope=\"col\">IT Department</th>"},
            {"label":"D","text":"<td span=\"3\">IT Department</td>"}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'rowspan="3" makes the cell extend vertically across three rows.',
        3,
        TRUE
    );


    UPDATE public.lesson
    SET status = 'published'
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;

    RAISE NOTICE 'Lesson 7 created successfully. Lesson ID: %, Quiz ID: %', v_lesson_id, v_quiz_id;


    -- =========================================================
    -- LESSON 8: SEMANTIC HTML
    -- =========================================================

    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        2,
        8,
        'Semantic HTML',
        'semantic-html',
        'Understand semantic HTML elements and learn how to create meaningful, accessible and maintainable website structures.',
        'beginner',
        40,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;

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
        8,
        'Lesson 2.8 Knowledge Check',
        'Test your understanding of semantic HTML elements and their appropriate uses.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: INTRODUCTION

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to Semantic HTML',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Semantic HTML refers to using HTML elements that describe the meaning and purpose of the content they contain.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Instead of choosing elements only because of how they look, developers choose elements based on what the content represents.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'For example, a navigation menu should use <nav> rather than a collection of unrelated <div> elements.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Semantic HTML makes websites easier to:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Understand.',
                        'Maintain.',
                        'Navigate.',
                        'Read using assistive technologies.',
                        'Interpret by search engines.'
                    )
                )
            )
        )
    );


    -- SECTION 2: NON-SEMANTIC VERSUS SEMANTIC

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        2,
        'heading',
        'Non-semantic versus Semantic Elements',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Non-semantic elements do not communicate a specific meaning about their content. Common examples include <div> and <span>.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Semantic elements communicate the purpose of their content.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        '<header>',
                        '<nav>',
                        '<main>',
                        '<section>',
                        '<article>',
                        '<aside>',
                        '<footer>'
                    )
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Compare the following non-semantic and semantic structures.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Non-semantic website structure',
                    'language', 'html',
                    'code',
                    $code$
<div>
    <div>
        <h1>My Website</h1>
    </div>

    <div>
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
    </div>

    <div>
        <p>Welcome to my website.</p>
    </div>
</div>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Semantic website structure',
                    'language', 'html',
                    'code',
                    $code$
<header>
    <h1>My Website</h1>
</header>

<nav>
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
</nav>

<main>
    <p>Welcome to my website.</p>
</main>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The second example provides more meaningful information about the purpose of each section.'
                )
            )
        )
    );


    -- SECTION 3: HEADER

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        3,
        'heading',
        'The HEADER Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <header> element represents introductory content for a page or a section.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'It commonly contains:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'A website logo.',
                        'A page heading.',
                        'Introductory information.',
                        'Navigation-related content.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating a page header',
                    'language', 'html',
                    'code',
                    $code$
<header>
    <h1>CodeXperts</h1>

    <p>Learn a language by living in it.</p>
</header>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A document can contain more than one header when different sections or articles need their own introductory content.'
                )
            )
        )
    );


    -- SECTION 4: NAV

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        4,
        'heading',
        'The NAV Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <nav> element represents a section containing important navigation links.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating a navigation section',
                    'language', 'html',
                    'code',
                    $code$
<nav>
    <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="courses.html">Courses</a></li>
        <li><a href="community.html">Community</a></li>
    </ul>
</nav>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'content', 'Not every group of links needs to be inside a <nav>. It is intended for significant navigation sections.'
                )
            )
        )
    );


    -- SECTION 5: MAIN

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        5,
        'heading',
        'The MAIN Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <main> element represents the main content of the document.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating the main content area',
                    'language', 'html',
                    'code',
                    $code$
<main>

    <h1>Available Learning Paths</h1>

    <p>Select a programming language to begin learning.</p>

</main>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A page should generally have one visible main content area.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'content', 'The main element should not be used for repeated content such as site-wide navigation or footers.'
                )
            )
        )
    );


    -- SECTION 6: SECTION

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'The SECTION Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <section> element groups related content into a thematic section.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Grouping related content',
                    'language', 'html',
                    'code',
                    $code$
<section>
    <h2>About HTML</h2>

    <p>HTML provides the structure of web pages.</p>
</section>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A section should normally have a heading that identifies its topic. It is useful for grouping related parts of a page.'
                )
            )
        )
    );


    -- SECTION 7: ARTICLE

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'heading',
        'The ARTICLE Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <article> element represents independent, self-contained content.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Examples include:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Blog posts.',
                        'News articles.',
                        'Forum posts.',
                        'Individual product reviews.',
                        'User-generated community posts.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating an article',
                    'language', 'html',
                    'code',
                    $code$
<article>

    <h2>Why Learn HTML?</h2>

    <p>
        HTML is an important starting point
        for learning web development.
    </p>

</article>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'An article should make sense as an independent piece of content.'
                )
            )
        )
    );


    -- SECTION 8: SECTION VERSUS ARTICLE

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        8,
        'heading',
        'SECTION versus ARTICLE',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The section and article elements are related, but they are not interchangeable.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Use <section> when grouping related content within a larger page or topic.',
                        'Use <article> when the content represents an independent, self-contained item.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Using section and article together',
                    'language', 'html',
                    'code',
                    $code$
<main>

    <section>
        <h2>Latest Programming News</h2>

        <article>
            <h3>New JavaScript Features</h3>
            <p>Learn about recent JavaScript developments.</p>
        </article>

        <article>
            <h3>Introduction to Python</h3>
            <p>Discover the basics of Python programming.</p>
        </article>

    </section>

</main>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The section groups the news articles, while each article represents an individual item.'
                )
            )
        )
    );


    -- SECTION 9: ASIDE

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        9,
        'heading',
        'The ASIDE Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <aside> element represents content that is related to the surrounding content but is not part of its main flow.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Examples include:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Related links.',
                        'Additional reading.',
                        'Sidebars.',
                        'Advertisements.',
                        'Supporting information.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating supporting content',
                    'language', 'html',
                    'code',
                    $code$
<aside>
    <h3>Related Lessons</h3>

    <ul>
        <li><a href="css.html">Introduction to CSS</a></li>
        <li><a href="javascript.html">Introduction to JavaScript</a></li>
    </ul>
</aside>
$code$::text
                )
            )
        )
    );


    -- SECTION 10: FOOTER

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        10,
        'heading',
        'The FOOTER Element',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The <footer> element represents footer information for a page or section.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'It commonly contains:'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Copyright information.',
                        'Contact details.',
                        'Related links.',
                        'Author information.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Creating a website footer',
                    'language', 'html',
                    'code',
                    $code$
<footer>
    <p>&copy; 2026 CodeXperts. All rights reserved.</p>
</footer>
$code$::text
                )
            )
        )
    );


    -- SECTION 11: COMPLETE SEMANTIC STRUCTURE

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        11,
        'heading',
        'Complete Semantic Website Structure',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'The following example combines several semantic elements to create a complete website structure.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Complete CodeXperts semantic website',
                    'language', 'html',
                    'code',
                    $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>CodeXperts</title>
</head>

<body>

    <header>
        <h1>CodeXperts</h1>

        <p>Learn a language by living in it.</p>
    </header>

    <nav>
        <a href="index.html">Home</a>
        <a href="courses.html">Courses</a>
        <a href="community.html">Community</a>
    </nav>

    <main>

        <section>
            <h2>Learning Paths</h2>

            <p>Explore our programming courses.</p>
        </section>

        <section>
            <h2>Latest Updates</h2>

            <article>
                <h3>New HTML Lessons</h3>

                <p>Our HTML learning material is now available.</p>
            </article>

            <article>
                <h3>Python Learning Path</h3>

                <p>Start developing your Python skills.</p>
            </article>

        </section>

        <aside>
            <h2>Recommended</h2>

            <p>Explore additional programming resources.</p>
        </aside>

    </main>

    <footer>
        <p>&copy; 2026 CodeXperts</p>
    </footer>

</body>
</html>
$code$::text
                )
            )
        )
    );


    -- SECTION 12: DIV AND SPAN

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        12,
        'heading',
        'When Should DIV and SPAN Be Used?',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Semantic elements should be preferred when they accurately describe the content. However, <div> and <span> are still useful when no more suitable semantic element describes the content.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'content', 'DIV'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A <div> is a generic block-level container.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Using DIV',
                    'language', 'html',
                    'code',
                    $code$
<div class="course-card">
    <h2>HTML</h2>
    <p>Learn how to structure websites.</p>
</div>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'content', 'SPAN'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'A <span> is a generic inline container.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example: Using SPAN',
                    'language', 'html',
                    'code',
                    $code$
<p>
    Your current level is
    <span class="level">Beginner</span>.
</p>
$code$::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'content', 'Use <div> and <span> when no more suitable semantic element describes the content.'
                )
            )
        )
    );


    -- SECTION 13: IMPORTANT POINTS

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        13,
        'summary',
        'Important Points to Remember',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'list',
                    'items', jsonb_build_array(
                        'Semantic HTML describes the purpose of content.',
                        '<header> represents introductory content.',
                        '<nav> identifies important navigation sections.',
                        '<main> contains the primary page content.',
                        '<section> groups related content.',
                        '<article> represents independent content.',
                        '<aside> contains supporting content.',
                        '<footer> contains footer information.',
                        '<div> and <span> are generic containers.',
                        'Semantic HTML improves accessibility and maintainability.'
                    )
                )
            )
        )
    );


    -- SECTION 14: KNOWLEDGE CHECK

    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        14,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'content', 'Test your understanding of semantic HTML elements and how they are used to organise website content.'
                )
            )
        ),
        v_quiz_id
    );


    -- LESSON 8 QUESTIONS

    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES
    (
        v_quiz_id,
        1,
        'multiple_choice',
        'A website contains a page with a main news section and three individual news stories. Each story can be shared and understood independently. Which structure is most appropriate?',
        '[
            {"label":"A","text":"Use one <article> for the entire page and <div> elements for each story."},
            {"label":"B","text":"Use a <section> to group the news and an <article> for each individual story."},
            {"label":"C","text":"Use <aside> for the news section and <footer> for each story."},
            {"label":"D","text":"Use <main> for each story because every story is important."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'A section containing independent articles is the appropriate structure. The section groups related news, while each article represents an independent story.',
        3,
        TRUE
    ),
    (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which statement best explains the purpose of the <aside> element?',
        '[
            {"label":"A","text":"It contains all content that appears on the right side of the screen."},
            {"label":"B","text":"It represents supporting content related to the surrounding content but not part of its main flow."},
            {"label":"C","text":"It identifies the primary content users must read first."},
            {"label":"D","text":"It is used exclusively for advertising banners."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'An aside contains related supplementary content. It is not restricted to the right side of a screen.',
        3,
        TRUE
    ),
    (
        v_quiz_id,
        3,
        'multiple_choice',
        'A developer needs to group the primary content of a page. Which element is most appropriate?',
        '[
            {"label":"A","text":"<header>"},
            {"label":"B","text":"<section>"},
            {"label":"C","text":"<main>"},
            {"label":"D","text":"<span>"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        '<main> represents the primary content of the document.',
        3,
        TRUE
    );


    UPDATE public.lesson
    SET status = 'published'
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;

    RAISE NOTICE 'Lesson 8 created successfully. Lesson ID: %, Quiz ID: %', v_lesson_id, v_quiz_id;


    RAISE NOTICE 'SUCCESS: Lessons 6, 7 and 8, including their quizzes and questions, have been published.';

END $$;



-- Lesson 9

DO $$
DECLARE
    v_module_id BIGINT;
    v_lesson_id BIGINT;
    v_quiz_id BIGINT;
BEGIN

    -- Confirm Module 2 exists.
    SELECT module_id
    INTO v_module_id
    FROM public.module
    WHERE module_id = 2;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Module 2 does not exist.';
    END IF;

    -- Find Lesson 9 or create it.
    SELECT lesson_id
    INTO v_lesson_id
    FROM public.lesson
    WHERE module_id = v_module_id
      AND lesson_number = 9;

    IF NOT FOUND THEN

        INSERT INTO public.lesson (
            module_id,
            lesson_number,
            title,
            slug,
            summary,
            difficulty,
            estimated_minutes,
            prerequisites,
            status
        )
        VALUES (
            v_module_id,
            9,
            'Forms and User Input',
            'forms-and-user-input',
            'Learn how HTML forms collect information using input fields, labels, buttons, dropdown lists, checkboxes, radio buttons and other form controls.',
            'beginner',
            35,
            '[]'::jsonb,
            'draft'
        )
        RETURNING lesson_id INTO v_lesson_id;

    END IF;

    -- Prevent duplicate sections or quizzes.
    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION
            'Lesson 9 already has sections. No duplicate content was inserted.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION
            'Lesson 9 already has a quiz. No duplicate quiz was inserted.';
    END IF;

    -- Create Lesson 9 quiz.
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
        9,
        'Lesson 9 Knowledge Check',
        'Answer all three multiple-choice questions to test your understanding of HTML forms and user input.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: 9.1 Introduction
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 1, 'introduction',
        'Introduction to HTML Forms',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'HTML forms allow websites to collect information from users. Forms are commonly used for registration, login, contact pages, search, surveys, feedback, applications and booking systems.'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'A form contains controls that allow users to enter or select information. HTML provides several elements for creating forms.'
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Common uses of HTML forms',
                'items', jsonb_build_array(
                    'Registration.',
                    'Login.',
                    'Contact pages.',
                    'Search.',
                    'Surveys.',
                    'Feedback.',
                    'Applications.',
                    'Booking systems.'
                )
            )

        ))
    );


    -- SECTION 2: 9.2 Creating a basic form
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 2, 'text',
        'Creating a Basic Form',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The <form> element defines an HTML form. It acts as a container for form controls that allow users to enter or select information.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Basic HTML Form',
                'language', 'html',
                'code', $code$
<form>

    <label for="username">Username:</label>

    <input type="text" id="username" name="username">

    <button type="submit">Submit</button>

</form>
$code$::text
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'The form contains',
                'items', jsonb_build_array(
                    'A label describing the input.',
                    'A text input where the user enters information.',
                    'A submit button used to submit the form.'
                )
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The <form> element can also contain many other controls, including checkboxes, radio buttons, dropdown lists and text areas.'
            )

        ))
    );


    -- SECTION 3: 9.3 Understanding ACTION
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 3, 'text',
        'Understanding the ACTION Attribute',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The action attribute specifies where the form data should be sent when the form is submitted.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Form Action Example',
                'language', 'html',
                'code', $code$
<form action="/register" method="post">

    <input type="text" name="username">

    <button type="submit">Register</button>

</form>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'In this example, the form submits its data to /register. The destination must be handled by an appropriate server-side endpoint for the data to be processed.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Important',
                'text', 'Without a configured destination and server-side handling, the form does not automatically create an account or save information to a database.'
            )

        ))
    );


    -- SECTION 4: 9.4 Understanding METHOD
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 4, 'text',
        'Understanding the METHOD Attribute',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The method attribute specifies how the form data is submitted. The two commonly used methods are GET and POST.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'GET'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'GET sends form data as part of the URL.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'GET Form Example',
                'language', 'html',
                'code', $code$
<form action="/search" method="get">

    <input type="text" name="query">

    <button type="submit">Search</button>

</form>
$code$::text
            ),

            jsonb_build_object(
                'type', 'example',
                'title', 'Example Resulting URL',
                'text', '/search?query=HTML'
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'GET is suitable for',
                'items', jsonb_build_array(
                    'Search requests.',
                    'Filtering.',
                    'Retrieving information.',
                    'Shareable search results.'
                )
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Avoid Sensitive Information in GET',
                'text', 'GET values may appear in the URL. Avoid using it for passwords and other sensitive information.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'POST'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'POST sends form data in the request body.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'POST Form Example',
                'language', 'html',
                'code', $code$
<form action="/register" method="post">

    <input type="text" name="username">

    <input type="password" name="password">

    <button type="submit">Register</button>

</form>
$code$::text
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'POST is commonly used for',
                'items', jsonb_build_array(
                    'Registration.',
                    'Login.',
                    'Submitting applications.',
                    'Creating records.',
                    'Updating information.'
                )
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'POST Does Not Encrypt Data',
                'text', 'POST determines how data is sent, not whether it is encrypted. HTTPS is still required to protect information during transmission.'
            )

        ))
    );


    -- SECTION 5: 9.5 Understanding INPUT
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 5, 'text',
        'Understanding INPUT Types',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The <input> element creates different types of form controls. The type attribute determines what kind of input is displayed.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Text Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Text Input',
                'language', 'html',
                'code', '<input type="text" name="fullname">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Allows users to enter ordinary text.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Email Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Email Input',
                'language', 'html',
                'code', '<input type="email" name="email">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Allows users to enter an email address and provides browser-level format validation.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Password Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Password Input',
                'language', 'html',
                'code', '<input type="password" name="password">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Hides the displayed characters as the user types. It does not encrypt or secure the password by itself.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Number Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Number Input',
                'language', 'html',
                'code', '<input type="number" name="age" min="16" max="100">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Allows numeric input.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Date Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Date Input',
                'language', 'html',
                'code', '<input type="date" name="birthdate">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Provides a date input control.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Telephone Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Telephone Input',
                'language', 'html',
                'code', '<input type="tel" name="phone">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Provides an input intended for telephone numbers. Unlike email, tel does not automatically provide a universal telephone-number validation format.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'URL Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'URL Input',
                'language', 'html',
                'code', '<input type="url" name="website">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Provides browser-level validation for URL formatting.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'File Input'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'File Input',
                'language', 'html',
                'code', '<input type="file" name="profile_picture">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Allows the user to select a file.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Checkbox'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Checkbox Input',
                'language', 'html',
                'code', '<input type="checkbox" name="interests" value="HTML">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Allows a user to select an option independently.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Radio Button'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Radio Input',
                'language', 'html',
                'code', '<input type="radio" name="level" value="beginner">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Allows users to select one option from a group of radio buttons that share the same name.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Submit Button'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Submit Input',
                'language', 'html',
                'code', '<input type="submit" value="Submit Form">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Submits the form.'
            )

        ))
    );


    -- SECTION 6: 9.6 Understanding NAME and ID
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 6, 'text',
        'Understanding NAME and ID',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The name and id attributes serve different purposes.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Input with NAME and ID',
                'language', 'html',
                'code', '<input type="text" id="username" name="username">'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'ID'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The id uniquely identifies an element within the document. It can be used by labels, CSS, JavaScript and fragment links.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'NAME'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The name identifies the form field when its value is submitted.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Different ID and NAME Values',
                'language', 'html',
                'code', '<input type="text" id="emailAddress" name="email">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'A label can use emailAddress, while the submitted form field is identified as email.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Important',
                'text', 'A form control without a name is generally not included in the submitted form data, even if it has an ID.'
            )

        ))
    );


    -- SECTION 7: 9.7 Understanding LABEL
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 7, 'text',
        'Understanding LABEL',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The <label> element provides a descriptive label for a form control.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Using LABEL with FOR',
                'language', 'html',
                'code', $code$
<label for="email">Email Address:</label>

<input type="email" id="email" name="email">
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The label''s for value must match the input''s id. Clicking the label can focus or activate its associated form control.'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Labels are important for accessibility and usability.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Wrapping an Input Inside a LABEL'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Alternative LABEL Method',
                'language', 'html',
                'code', $code$
<label>
    Username:
    <input type="text" name="username">
</label>
$code$::text
            )

        ))
    );


    -- SECTION 8: 9.8 Form validation attributes
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 8, 'text',
        'Form Validation Attributes',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'HTML provides built-in validation attributes that help control the information users enter into form fields.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Required'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Required Attribute',
                'language', 'html',
                'code', '<input type="email" name="email" required>'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The user must provide a value before submitting the form.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Minlength'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Minimum Length',
                'language', 'html',
                'code', '<input type="text" name="username" minlength="4">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Requires at least four characters.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Maxlength'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Maximum Length',
                'language', 'html',
                'code', '<input type="text" name="username" maxlength="20">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Limits the input to twenty characters.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Min and MAX'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Minimum and Maximum Values',
                'language', 'html',
                'code', '<input type="number" name="age" min="18" max="60">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Defines the accepted numeric range.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Pattern'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Pattern Validation',
                'language', 'html',
                'code', $code$
<input type="text"
       name="code"
       pattern="[A-Z]{3}[0-9]{2}">
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Requires three uppercase letters followed by two digits. For example, ABC12 matches the pattern.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Placeholder'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Placeholder Attribute',
                'language', 'html',
                'code', $code$
<input type="text"
       name="username"
       placeholder="Enter your username">
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Displays a temporary hint inside the input.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Remember',
                'text', 'A placeholder should not replace a proper label.'
            )

        ))
    );


    -- SECTION 9: 9.9 Checkboxes and radio buttons
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 9, 'text',
        'Checkboxes and Radio Buttons',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'heading',
                'text', 'Checkboxes'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Checkboxes allow users to select multiple independent options.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Checkbox Example',
                'language', 'html',
                'code', $code$
<h3>Select Your Interests</h3>

<label>
    <input type="checkbox" name="interests" value="HTML">
    HTML
</label>

<label>
    <input type="checkbox" name="interests" value="CSS">
    CSS
</label>

<label>
    <input type="checkbox" name="interests" value="JavaScript">
    JavaScript
</label>
$code$::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Radio Buttons'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Radio buttons allow users to choose one option from a group.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Radio Button Example',
                'language', 'html',
                'code', $code$
<h3>Select Your Experience Level</h3>

<label>
    <input type="radio" name="level" value="beginner">
    Beginner
</label>

<label>
    <input type="radio" name="level" value="intermediate">
    Intermediate
</label>

<label>
    <input type="radio" name="level" value="advanced">
    Advanced
</label>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'All three radio buttons share the same name="level". This groups them together so that selecting one deselects the others.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Important',
                'text', 'If the radio buttons have different names, they will not behave as one selection group.'
            )

        ))
    );


    -- SECTION 10: 9.10 SELECT and OPTION
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 10, 'text',
        'SELECT and OPTION',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The <select> element creates a dropdown list. The <option> element defines each available choice.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Dropdown List Example',
                'language', 'html',
                'code', $code$
<label for="course">Choose a course:</label>

<select id="course" name="course">

    <option value="html">HTML</option>

    <option value="css">CSS</option>

    <option value="javascript">JavaScript</option>

</select>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The value attribute determines the value submitted with the form. The visible text and submitted value do not have to be identical.'
            )

        ))
    );


    -- SECTION 11: 9.11 TEXTAREA
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 11, 'text',
        'TEXTAREA',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The <textarea> element allows users to enter longer text.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Textarea Example',
                'language', 'html',
                'code', $code$
<label for="message">Your Message:</label>

<textarea
    id="message"
    name="message"
    rows="5"
    cols="40">
</textarea>
$code$::text
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Textarea is useful for',
                'items', jsonb_build_array(
                    'Feedback.',
                    'Comments.',
                    'Descriptions.',
                    'Messages.',
                    'Application explanations.'
                )
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Unlike a normal input element, the initial text for a textarea is placed between its opening and closing tags.'
            )

        ))
    );


    -- SECTION 12: 9.12 FIELDSET and LEGEND
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 12, 'text',
        'FIELDSET and LEGEND',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The <fieldset> element groups related form controls. The <legend> element provides a heading for the group.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Fieldset and Legend Example',
                'language', 'html',
                'code', $code$
<fieldset>

    <legend>Personal Information</legend>

    <label for="firstname">First Name:</label>

    <input type="text" id="firstname" name="firstname">

    <label for="surname">Surname:</label>

    <input type="text" id="surname" name="surname">

</fieldset>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'This is useful for organising large forms into understandable sections.'
            )

        ))
    );


    -- SECTION 13: 9.13 Complete practical example
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 13, 'code',
        'Complete Practical Example: Registration Form',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The following example combines different form controls to create a student registration form.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Complete Student Registration Form',
                'language', 'html',
                'code', $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Student Registration</title>
</head>

<body>

    <h1>Student Registration</h1>

    <form action="/register" method="post">

        <fieldset>

            <legend>Personal Information</legend>

            <label for="fullname">Full Name:</label>

            <input
                type="text"
                id="fullname"
                name="fullname"
                required
            >

            <br><br>

            <label for="email">Email:</label>

            <input
                type="email"
                id="email"
                name="email"
                required
            >

            <br><br>

            <label for="password">Password:</label>

            <input
                type="password"
                id="password"
                name="password"
                minlength="8"
                required
            >

        </fieldset>

        <br>

        <fieldset>

            <legend>Learning Preferences</legend>

            <p>Select your experience level:</p>

            <label>
                <input type="radio" name="level" value="beginner" required>
                Beginner
            </label>

            <label>
                <input type="radio" name="level" value="intermediate">
                Intermediate
            </label>

            <label>
                <input type="radio" name="level" value="advanced">
                Advanced
            </label>

            <br><br>

            <label for="course">Select a Course:</label>

            <select id="course" name="course">

                <option value="html">HTML</option>

                <option value="python">Python</option>

                <option value="java">Java</option>

            </select>

        </fieldset>

        <br>

        <button type="submit">Register</button>

    </form>

</body>
</html>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'This example demonstrates how different form controls can be combined to collect information.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Server-Side Processing',
                'text', 'The /register endpoint must be implemented on the server before the submitted information can be processed and stored.'
            )

        ))
    );


    -- SECTION 14: 9.14 Important points
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 14, 'summary',
        'Important Points to Remember',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'list',
                'items', jsonb_build_array(
                    '<form> creates a form.',
                    'action specifies the submission destination.',
                    'method specifies how the data is submitted.',
                    'GET is commonly used for retrieving information.',
                    'POST is commonly used for submitting or changing information.',
                    '<input> creates different types of controls.',
                    'name identifies submitted form data.',
                    'id identifies an element in the document.',
                    '<label> describes a form control.',
                    'required makes a field mandatory.',
                    'Checkboxes allow multiple independent selections.',
                    'Radio buttons with the same name form a single-choice group.',
                    '<select> creates dropdown lists.',
                    '<textarea> allows longer text.',
                    '<fieldset> and <legend> organise related controls.'
                )
            )

        ))
    );


    -- SECTION 15: Lesson 9 Quiz section
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
        15,
        'quiz',
        'Lesson 9 Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of HTML forms, form controls, submission methods and validation.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1
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
        'A form contains the following input: <input type="email" id="userEmail" required>. The user enters a valid email address and submits the form. Which statement is correct?',

        '[
            {"label":"A","text":"The value is submitted using userEmail because the ID automatically becomes the field name."},
            {"label":"B","text":"The field can pass its required and email-format checks, but it generally will not be included in the submitted form data because it has no name."},
            {"label":"C","text":"The browser rejects the form because every email input must have an ID and a name with identical values."},
            {"label":"D","text":"The browser automatically creates a name attribute using the ID."}
        ]'::jsonb,

        '{"correct_answer":"B"}'::jsonb,

        'Validation and submission are separate concerns. The required and email-format checks can still occur, but a form control generally needs a name to be included in the submitted form data.',

        3,
        TRUE
    );


    -- QUESTION 2
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
        'A developer wants users to select exactly one experience level from Beginner, Intermediate and Advanced. Which implementation correctly creates a single-choice group?',

        '[
            {"label":"A","text":"Three radio buttons with different names: beginner, intermediate and advanced."},
            {"label":"B","text":"Three checkboxes sharing the name level."},
            {"label":"C","text":"Three radio buttons sharing name=\"level\", with values beginner, intermediate and advanced."},
            {"label":"D","text":"Three text inputs sharing the name level."}
        ]'::jsonb,

        '{"correct_answer":"C"}'::jsonb,

        'All radio buttons share the same name. This makes them one group, allowing only one option to be selected at a time.',

        3,
        TRUE
    );


    -- QUESTION 3
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
        'Which statement about POST requests is most accurate?',

        '[
            {"label":"A","text":"POST automatically encrypts submitted information because it sends data in the request body."},
            {"label":"B","text":"POST sends form data in the request body, but HTTPS is still needed to protect data during transmission."},
            {"label":"C","text":"POST always hides the submitted data from the server''s access logs."},
            {"label":"D","text":"POST can only be used when a form contains password inputs."}
        ]'::jsonb,

        '{"correct_answer":"B"}'::jsonb,

        'POST does not provide encryption. HTTPS protects the connection. POST determines how the data is sent, not whether it is encrypted.',

        3,
        TRUE
    );


    -- Publish the lesson and its quiz.
    UPDATE public.lesson
    SET status = 'published',
        updated_at = NOW()
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;


    RAISE NOTICE 'Lesson 9 inserted successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id, v_quiz_id;

END $$;






-- lesson 10
DO $$
DECLARE
    v_module_id BIGINT;
    v_lesson_id BIGINT;
    v_quiz_id BIGINT;
BEGIN

    -- Confirm Module 2 exists.
    SELECT module_id
    INTO v_module_id
    FROM public.module
    WHERE module_id = 2;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Module 2 does not exist.';
    END IF;

    -- Find Lesson 10 or create it.
    SELECT lesson_id
    INTO v_lesson_id
    FROM public.lesson
    WHERE module_id = v_module_id
      AND lesson_number = 10;

    IF NOT FOUND THEN

        INSERT INTO public.lesson (
            module_id,
            lesson_number,
            title,
            slug,
            summary,
            difficulty,
            estimated_minutes,
            prerequisites,
            status
        )
        VALUES (
            v_module_id,
            10,
            'HTML Tags, Attributes, Element Nesting and File Paths',
            'html-tags-attributes-element-nesting-and-file-paths',
            'Understand HTML tags, attributes, global attributes, element nesting, parent-child relationships, block and inline elements, and how to organise website files using relative and absolute paths.',
            'beginner',
            35,
            '[]'::jsonb,
            'draft'
        )
        RETURNING lesson_id INTO v_lesson_id;

    END IF;

    -- Prevent duplicate content.
    IF EXISTS (
        SELECT 1
        FROM public.lesson_section
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION
            'Lesson 10 already has sections. No duplicate content was inserted.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.quiz
        WHERE lesson_id = v_lesson_id
    ) THEN
        RAISE EXCEPTION
            'Lesson 10 already has a quiz. No duplicate quiz was inserted.';
    END IF;


    -- Create Lesson 10 quiz.
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
        10,
        'Lesson 10 Knowledge Check',
        'Answer all three multiple-choice questions to test your understanding of HTML tags, attributes, nesting and file paths.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: 10.1 Introduction
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 1, 'introduction',
        'Introduction to HTML Tags, Attributes and File Paths',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Understanding HTML requires more than knowing the names of different elements. Developers must also understand how tags are written, how attributes work, how elements are nested, how parent-child relationships are formed and how files and folders are organised.'
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'In this lesson, you will learn',
                'items', jsonb_build_array(
                    'How HTML tags are written.',
                    'How attributes work.',
                    'How elements are nested.',
                    'How parent-child relationships are formed.',
                    'How files and folders are organised.',
                    'How relative and absolute paths work.'
                )
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'These concepts are important when building larger websites.'
            )

        ))
    );


    -- SECTION 2: 10.2 Understanding HTML tags
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 2, 'text',
        'Understanding HTML Tags',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'HTML tags are written using angle brackets.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'HTML Paragraph Element',
                'language', 'html',
                'code', '<p>Hello World</p>'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Opening Tag'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Opening Tag',
                'language', 'html',
                'code', '<p>'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Closing Tag'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Closing Tag',
                'language', 'html',
                'code', '</p>'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The forward slash identifies a closing tag. Most standard HTML elements use opening and closing tags.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Void Elements'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Void elements do not have closing tags.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Examples of Void Elements',
                'language', 'html',
                'code', $code$
<img src="photo.jpg" alt="A photograph">

<br>

<hr>

<input type="text">
$code$::text
            )

        ))
    );


    -- SECTION 3: 10.3 Understanding HTML attributes
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 3, 'text',
        'Understanding HTML Attributes',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Attributes provide additional information about an HTML element. They are generally written inside the opening tag.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Link with an HREF Attribute',
                'language', 'html',
                'code', $code$
<a href="https://www.example.com">
    Visit Example
</a>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Here, href is an attribute and its value is the destination URL.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Attribute Structure'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Attribute and Value',
                'language', 'html',
                'code', 'attribute="value"'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Attributes generally use this structure: an attribute name followed by an equals sign and a value inside quotation marks.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Image with Multiple Attributes',
                'language', 'html',
                'code', $code$
<img src="logo.png"
     alt="Website logo"
     width="200">
$code$::text
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'The image has three attributes',
                'items', jsonb_build_array(
                    'src',
                    'alt',
                    'width'
                )
            )

        ))
    );


    -- SECTION 4: 10.4 Common HTML attributes
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 4, 'text',
        'Common HTML Attributes',
        jsonb_build_array(

            jsonb_build_object(
                'type', 'heading',
                'text', 'ID'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Identifies a unique element.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'ID Attribute',
                'language', 'html',
                'code', '<h1 id="main-heading">Welcome</h1>'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'CLASS'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Groups elements for styling or scripting. Multiple elements can share the same class.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'CLASS Attribute',
                'language', 'html',
                'code', $code$
<p class="description">First paragraph.</p>

<p class="description">Second paragraph.</p>
$code$::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'HREF'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Specifies a link destination.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'HREF Attribute',
                'language', 'html',
                'code', '<a href="about.html">About</a>'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'SRC'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Specifies the location of a resource.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'SRC Attribute',
                'language', 'html',
                'code', '<img src="images/photo.jpg" alt="Photo">'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'ALT'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Provides alternative text for images.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'ALT Attribute',
                'language', 'html',
                'code', '<img src="logo.png" alt="Company logo">'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'TITLE'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Provides additional advisory information, often shown as a tooltip.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'TITLE Attribute',
                'language', 'html',
                'code', '<button title="Save your progress">Save</button>'::text
            ),
            jsonb_build_object(
                'type', 'callout',
                'title', 'Remember',
                'text', 'A title attribute should not replace an accessible name or label.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'STYLE'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Adds inline CSS to an element.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'STYLE Attribute',
                'language', 'html',
                'code', '<p style="color: blue;">Blue text</p>'::text
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Inline styling is useful for small demonstrations, but external CSS is generally better for larger projects.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'DISABLED'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Prevents a form control from being interacted with.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'DISABLED Attribute',
                'language', 'html',
                'code', '<button disabled>Unavailable</button>'::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'REQUIRED'
            ),
            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Makes a form field mandatory.'
            ),
            jsonb_build_object(
                'type', 'code',
                'title', 'REQUIRED Attribute',
                'language', 'html',
                'code', '<input type="text" name="username" required>'::text
            )

        )
    );


    -- SECTION 5: 10.5 Global attributes
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 5, 'text',
        'Global HTML Attributes',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Global attributes can be used on many different HTML elements.'
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Examples of global attributes',
                'items', jsonb_build_array(
                    'id',
                    'class',
                    'style',
                    'title',
                    'hidden',
                    'tabindex',
                    'data-*'
                )
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Using Global Attributes',
                'language', 'html',
                'code', $code$
<p
    id="message"
    class="notice"
    title="Important information"
    data-category="announcement">
    Welcome to the learning platform.
</p>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The data-* attributes allow developers to store custom information on HTML elements. JavaScript can access these values through the element''s dataset.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Accessing DATA Attributes with JavaScript'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'HTML and JavaScript Dataset Example',
                'language', 'html',
                'code', $code$
<button id="courseButton" data-course="HTML">
    Open Course
</button>

<script>
    const button = document.getElementById("courseButton");

    console.log(button.dataset.course);
</script>
$code$::text
            ),

            jsonb_build_object(
                'type', 'example',
                'title', 'Output',
                'text', 'HTML'
            )

        ))
    );


    -- SECTION 6: 10.6 Understanding element nesting
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 6, 'text',
        'Understanding Element Nesting',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Nesting means placing one HTML element inside another.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'HTML Element Nesting Example',
                'language', 'html',
                'code', $code$
<div>
    <h2>HTML Lesson</h2>

    <p>
        Learn how to create
        <strong>structured web pages</strong>.
    </p>
</div>
$code$::text
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Understanding the Parent-Child Relationships',
                'items', jsonb_build_array(
                    'The <div> is the parent element.',
                    'The heading and paragraph are children of the div.',
                    'The <strong> element is a child of the paragraph.'
                )
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'HTML documents are organised using these parent-child relationships.'
            )

        ))
    );


    -- SECTION 7: 10.7 Correct and incorrect nesting
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 7, 'example',
        'Correct and Incorrect Element Nesting',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'heading',
                'text', 'Correct Nesting'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Correct HTML Nesting',
                'language', 'html',
                'code', $code$
<p>
    This is a paragraph containing
    <strong>important text</strong>.
</p>
$code$::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Incorrect Nesting'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Incorrect HTML Nesting',
                'language', 'html',
                'code', $code$
<p>
    This is a paragraph containing
    <strong>important text.
</p>
    </strong>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'In the incorrect example, the elements are closed in the wrong order.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Important Rule',
                'text', 'HTML elements should generally be closed in the reverse order in which they were opened.'
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Think of nesting like opening and closing boxes',
                'items', jsonb_build_array(
                    'Open the first box.',
                    'Open another box inside it.',
                    'Close the inner box.',
                    'Close the outer box.'
                )
            )

        ))
    );


    -- SECTION 8: 10.8 Block-level and inline elements
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 8, 'text',
        'Block-Level and Inline Elements',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'HTML elements have different default display behaviours.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Block-Level Behaviour'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Block elements generally begin on a new line and occupy the available width by default.'
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Examples of block-level elements',
                'items', jsonb_build_array(
                    '<div>',
                    '<p>',
                    '<h1> to <h6>',
                    '<section>',
                    '<article>'
                )
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Inline Behaviour'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Inline elements generally flow within the surrounding text and occupy only the space they need.'
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Examples of inline elements',
                'items', jsonb_build_array(
                    '<span>',
                    '<a>',
                    '<strong>',
                    '<em>'
                )
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Example of an Inline Element'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Strong Element Inside a Paragraph',
                'language', 'html',
                'code', $code$
<p>
    Learning
    <strong>HTML</strong>
    is an important step in web development.
</p>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The strong element appears within the paragraph rather than creating a separate block.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Remember',
                'text', 'Modern CSS can change how elements are displayed, so these are default behaviours rather than permanent restrictions.'
            )

        ))
    );


    -- SECTION 9: 10.9 Understanding file paths
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 9, 'text',
        'Understanding File Paths',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'A file path tells the browser where to find a file. Websites commonly contain multiple folders.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Example Website Folder Structure',
                'language', 'text',
                'code', $code$
website/
│
├── index.html
│
├── about.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── images/
│   ├── logo.png
│   └── profile.jpg
│
└── pages/
    └── contact.html
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The browser uses paths to locate CSS files, JavaScript files, images and other resources.'
            )

        ))
    );


    -- SECTION 10: 10.10 Relative paths
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 10, 'text',
        'Relative Paths',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'A relative path is calculated from the location of the current document.'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'If index.html is in the root folder, the CSS path is:'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Linking a CSS File',
                'language', 'html',
                'code', '<link rel="stylesheet" href="css/style.css">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The image path is:'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Loading an Image',
                'language', 'html',
                'code', '<img src="images/logo.png" alt="Website logo">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The contact page path is:'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Linking a Contact Page',
                'language', 'html',
                'code', '<a href="pages/contact.html">Contact</a>'::text
            )

        ))
    );


    -- SECTION 11: 10.11 Moving to a parent folder
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 11, 'text',
        'Moving to a Parent Folder',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The ../ notation moves one directory level upwards.'
            ),

            jsonb_build_object(
                'type', 'example',
                'title', 'Current File Location',
                'text', 'website/pages/contact.html'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'To access the root-level index.html:'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Linking to the Home Page',
                'language', 'html',
                'code', '<a href="../index.html">Home</a>'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'To access the logo:'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Accessing an Image',
                'language', 'html',
                'code', '<img src="../images/logo.png" alt="Website logo">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'To access the stylesheet:'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Accessing a Stylesheet',
                'language', 'html',
                'code', '<link rel="stylesheet" href="../css/style.css">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The path starts inside the pages folder, moves up to the website folder, and then enters the relevant folder.'
            )

        ))
    );


    -- SECTION 12: 10.12 Moving up more than one directory
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 12, 'text',
        'Moving Up More Than One Directory',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Sometimes a file is located several folders below the website root. In these situations, multiple ../ notations are needed.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Example Folder Structure',
                'language', 'text',
                'code', $code$
website/
│
├── index.html
│
└── pages/
    └── account/
        └── profile.html
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The profile page is two folders below the root. To link to index.html:'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Linking to the Root Index Page',
                'language', 'html',
                'code', '<a href="../../index.html">Home</a>'::text
            ),

            jsonb_build_object(
                'type', 'list',
                'title', 'Understanding the Path',
                'items', jsonb_build_array(
                    'The first ../ moves from account to pages.',
                    'The second ../ moves from pages to website.'
                )
            )

        ))
    );


    -- SECTION 13: 10.13 Absolute paths
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 13, 'text',
        'Absolute Paths and Root-Relative URLs',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'heading',
                'text', 'Absolute URL'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'An absolute URL identifies a complete web address.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Absolute URL Example',
                'language', 'html',
                'code', $code$
<a href="https://www.example.com/about.html">
    About Example
</a>
$code$::text
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Root-Relative URL'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'A root-relative URL starts from the website''s root.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Root-Relative URL Example',
                'language', 'html',
                'code', '<a href="/pages/contact.html">Contact</a>'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'This starts at the website root, rather than depending on the current page''s folder.'
            ),

            jsonb_build_object(
                'type', 'callout',
                'title', 'Important',
                'text', 'Root-relative paths are useful on hosted websites, but the root must be understood in the context of the site''s deployment location. They may behave differently when opening files directly from a computer using file://.'
            )

        ))
    );


    -- SECTION 14: 10.14 File naming and case sensitivity
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 14, 'text',
        'File Naming and Case Sensitivity',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'File and folder names must match the actual names used in the project.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Example Image Path',
                'language', 'html',
                'code', '<img src="images/Logo.png" alt="Logo">'::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The path above may fail if the actual file is named logo.png.'
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'Some development environments may treat these names as different files.'
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Good File Naming Practices'
            ),

            jsonb_build_object(
                'type', 'list',
                'items', jsonb_build_array(
                    'Use lowercase file names.',
                    'Avoid unnecessary spaces.',
                    'Use clear folder names.',
                    'Keep extensions correct.',
                    'Check spelling carefully.'
                )
            ),

            jsonb_build_object(
                'type', 'heading',
                'text', 'Recommended File Names'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Examples of Good File Names',
                'language', 'text',
                'code', $code$
profile-picture.jpg
course-logo.png
learning-path.html
$code$::text
            )

        ))
    );


    -- SECTION 15: 10.15 Practical example
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 15, 'code',
        'Practical Example: Connecting a Complete Website',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'The following example demonstrates how to connect an HTML page to CSS, JavaScript and image files using relative paths.'
            ),

            jsonb_build_object(
                'type', 'code',
                'title', 'Complete Website HTML',
                'language', 'html',
                'code', $code$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>My Website</title>

    <link rel="stylesheet" href="css/style.css">

    <script src="js/script.js" defer></script>
</head>

<body>

    <header id="main-header" class="header">
        <img src="images/logo.png" alt="Website logo" width="100">

        <h1>My Website</h1>
    </header>

    <main>

        <section class="content">

            <h2>Welcome</h2>

            <p>
                This website demonstrates
                <strong>HTML structure</strong>
                and file organisation.
            </p>

            <a href="pages/contact.html">Contact Us</a>

        </section>

    </main>

</body>
</html>
$code$::text
            ),

            jsonb_build_object(
                'type', 'paragraph',
                'text', 'This example connects HTML, CSS, JavaScript and image files using relative paths.'
            )

        ))
    );


    -- SECTION 16: 10.16 Important points
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content
    )
    VALUES (
        v_lesson_id, 16, 'summary',
        'Important Points to Remember',
        jsonb_build_object('blocks', jsonb_build_array(

            jsonb_build_object(
                'type', 'list',
                'items', jsonb_build_array(
                    'Tags define HTML markup.',
                    'Attributes provide additional information.',
                    'id identifies a unique element.',
                    'class groups elements.',
                    'Elements can be nested inside other elements.',
                    'Correct nesting requires closing elements in the proper order.',
                    'Block elements generally start on new lines.',
                    'Inline elements generally flow within surrounding content.',
                    'Relative paths depend on the current document''s location.',
                    '../ moves to a parent directory.',
                    'Root-relative paths start from the website root.',
                    'Absolute URLs contain complete web addresses.',
                    'File and folder names must match their actual names.'
                )
            )

        ))
    );


    -- SECTION 17: Lesson 10 Quiz section
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
        17,
        'quiz',
        'Lesson 10 Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of HTML tags, attributes, element nesting and file paths.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1
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
        'Consider this folder structure: website/ contains index.html and pages/account/profile.html. The developer is editing profile.html and wants to display an image stored at website/images/avatar.png. Which path is correct?',

        '[
            {"label":"A","text":"../images/avatar.png"},
            {"label":"B","text":"../../images/avatar.png"},
            {"label":"C","text":"../../../images/avatar.png"},
            {"label":"D","text":"/pages/images/avatar.png"}
        ]'::jsonb,

        '{"correct_answer":"C"}'::jsonb,

        '../../../images/avatar.png. Starting in account, move up to pages, then to website, and enter the images folder.',

        3,
        TRUE
    );


    -- QUESTION 2
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
        'Which code demonstrates correct element nesting?',

        '[
            {"label":"A","text":"<p> Learn <strong>HTML </p> </strong>"},
            {"label":"B","text":"<p> Learn <strong>HTML</strong> </p>"},
            {"label":"C","text":"<p> Learn <strong>HTML</p></strong>"},
            {"label":"D","text":"<strong> <p>Learn HTML</strong> </p>"}
        ]'::jsonb,

        '{"correct_answer":"B"}'::jsonb,

        'The inner element closes first. The strong element is opened inside the paragraph and must close before the paragraph.',

        3,
        TRUE
    );


    -- QUESTION 3
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
        'A developer creates two paragraph elements with the same class but different IDs. Which statement is correct?',

        '[
            {"label":"A","text":"This is invalid because every HTML element must have a different class."},
            {"label":"B","text":"The elements can share a class, but their IDs should be unique within the document."},
            {"label":"C","text":"The elements must share the same ID if they share a class."},
            {"label":"D","text":"Class attributes are only allowed on block-level elements."}
        ]'::jsonb,

        '{"correct_answer":"B"}'::jsonb,

        'Classes can be shared; IDs should be unique. Classes are useful for grouping elements, while IDs identify individual elements.',

        3,
        TRUE
    );


    -- Publish Lesson 10 and its quiz.
    UPDATE public.lesson
    SET status = 'published',
        updated_at = NOW()
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;


    RAISE NOTICE 'Lesson 10 inserted successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id, v_quiz_id;

END $$;



-- Lesson 11

DO $$
DECLARE
    v_module_id INTEGER;
    v_lesson_id INTEGER;
    v_quiz_id INTEGER;
BEGIN

    -- Verify that Module 2 exists
    SELECT module_id
    INTO v_module_id
    FROM public.module
    WHERE module_id = 2;

    IF v_module_id IS NULL THEN
        RAISE EXCEPTION 'Module 2 does not exist.';
    END IF;

    -- Prevent duplicate lesson insertion
    IF EXISTS (
        SELECT 1
        FROM public.lesson
        WHERE module_id = 2
          AND lesson_number = 11
    ) THEN
        RAISE EXCEPTION 'Lesson 11 already exists in Module 2.';
    END IF;

    -- Insert Lesson 11
    INSERT INTO public.lesson (
        module_id,
        lesson_number,
        title,
        slug,
        summary,
        difficulty,
        estimated_minutes,
        prerequisites,
        status
    )
    VALUES (
        v_module_id,
        11,
        'Accessibility, Labels, Form Controls and Common HTML Errors',
        'accessibility-labels-form-controls-and-common-html-errors',
        'Learn how to make HTML websites more accessible using alternative text, form labels, semantic elements, keyboard navigation and ARIA. Identify and correct common HTML errors and validate markup.',
        'beginner',
        40,
        '[]'::jsonb,
        'draft'
    )
    RETURNING lesson_id INTO v_lesson_id;

    -- Insert Lesson 11 Quiz
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
        11,
        'Lesson 11 Knowledge Check',
        'Test your understanding of HTML accessibility, form controls, button types and semantic HTML.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;


    -- SECTION 1: INTRODUCTION
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to HTML Accessibility',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Building a website is not only about making it look attractive or ensuring that it works on a developer''s computer. A website should also be usable by people with different abilities, devices and methods of interacting with the web.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This is where web accessibility becomes important. Accessibility means designing and developing websites so that as many people as possible can use them, including people who rely on assistive technologies.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'title', 'Examples of assistive technologies and alternative ways of interacting with websites include:',
                    'items', jsonb_build_array(
                        'Screen readers.',
                        'Keyboard navigation.',
                        'Screen magnification.',
                        'Voice control.',
                        'Alternative input devices.'
                    )
                )
            )
        ),
        NULL
    );


    -- SECTION 2: WHY ACCESSIBILITY MATTERS
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        2,
        'text',
        'Why Accessibility Matters',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Consider a student using a screen reader to access a learning platform. If a page contains images without meaningful alternative text, the student may not understand what those images represent.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'If form fields have no labels, the student may struggle to identify what information should be entered. If a website can only be controlled using a mouse, users who navigate with a keyboard may not be able to access important features.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Why it matters',
                    'text', 'Accessibility helps make websites more inclusive and usable by allowing people with different abilities and interaction methods to access information and features.'
                )
            )
        ),
        NULL
    );


    -- SECTION 3: MEANINGFUL ALTERNATIVE TEXT
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        3,
        'example',
        'Providing Meaningful Alternative Text',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Images should have appropriate alternative text when they communicate useful information. The alt attribute describes the relevant information contained in an image.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Meaningful alternative text',
                    'language', 'html',
                    'code', $code$<img src="html-diagram.png"
     alt="Diagram showing the relationship between the head and body elements">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Decorative images do not communicate important information. They should normally use empty alternative text so that screen readers can ignore them.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Decorative image',
                    'language', 'html',
                    'code', $code$<img src="decoration.png" alt="">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Avoid vague descriptions that do not explain the useful information in an image.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Avoid vague alternative text',
                    'language', 'html',
                    'code', $code$<img src="student.jpg" alt="Image">$code$
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'A useful alternative description explains the relevant information rather than simply announcing that an image exists.'
                )
            )
        ),
        NULL
    );


    -- SECTION 4: ACCESSIBLE FORM LABELS
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        4,
        'example',
        'Creating Accessible Form Labels',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Every form control should have an accessible name. A common way to achieve this is with the label element.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Correct approach'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Connecting a label to an input',
                    'language', 'html',
                    'code', $code$<label for="username">Username:</label>

<input type="text" id="username" name="username">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The label''s for attribute connects it to the input element through the input''s id. This association helps screen reader users identify the purpose of the input.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Incorrect approach'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'A paragraph is not a form label',
                    'language', 'html',
                    'code', $code$<p>Username:</p>

<input type="text" name="username">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The paragraph visually describes the field, but it is not programmatically connected to the input. Using a label with a matching for and id provides the required association.'
                )
            )
        ),
        NULL
    );


    -- SECTION 5: FIELDSET AND LEGEND
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        5,
        'example',
        'Using FIELDSET and LEGEND',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'When a form contains related groups of controls, use fieldset and legend. The fieldset groups related controls, while the legend provides a description of the group.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Grouping related radio buttons',
                    'language', 'html',
                    'code', $code$<fieldset>

    <legend>Choose Your Preferred Learning Format</legend>

    <label>
        <input type="radio" name="format" value="video">
        Video Lessons
    </label>

    <label>
        <input type="radio" name="format" value="text">
        Written Lessons
    </label>

    <label>
        <input type="radio" name="format" value="both">
        Both
    </label>

</fieldset>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The legend describes the purpose of the group. This is particularly helpful when several form controls are related because users can understand what the controls represent.'
                )
            )
        ),
        NULL
    );


    -- SECTION 6: KEYBOARD ACCESSIBILITY
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        6,
        'text',
        'Keyboard Accessibility',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Not every user navigates websites using a mouse. Some users rely on a keyboard to move through pages and interact with website features.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'title', 'Common keyboard controls include:',
                    'items', jsonb_build_array(
                        'Tab: Moves focus to the next focusable element.',
                        'Shift + Tab: Moves focus to the previous focusable element.',
                        'Enter: Activates many links and buttons.',
                        'Space: Activates buttons and toggles checkboxes when focused.',
                        'Arrow keys: Navigate within some controls, such as radio groups and menus.'
                    )
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML provides built-in keyboard behaviour for native controls such as buttons, links, inputs and selects.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Native interactive HTML elements',
                    'language', 'html',
                    'code', $code$<a href="courses.html">View Courses</a>

<button type="button">Start Lesson</button>

<input type="text" name="username">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'These elements can normally be reached using keyboard navigation. Avoid replacing native interactive elements with ordinary div elements unless the additional keyboard and accessibility behaviour is implemented correctly.'
                )
            )
        ),
        NULL
    );


    -- SECTION 7: TABINDEX
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        7,
        'text',
        'Understanding TABINDEX',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The tabindex attribute can influence keyboard focus behaviour. It can allow certain elements to receive keyboard focus even when they are not normally interactive.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Making a div focusable',
                    'language', 'html',
                    'code', $code$<div tabindex="0">
    This element can receive keyboard focus.
</div>$code$
                ),
                jsonb_build_object(
                    'type', 'list',
                    'title', 'Common tabindex values:',
                    'items', jsonb_build_array(
                        'tabindex="0": Allows the element to participate in the natural tab order.',
                        'tabindex="-1": Allows programmatic focus but removes the element from normal sequential keyboard navigation.',
                        'Positive values: Specify a custom tab order.'
                    )
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Positive tabindex values are generally discouraged because they can create confusing navigation sequences that do not follow the natural order of the page.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Best practice',
                    'text', 'Use native interactive elements whenever possible instead of adding tabindex to ordinary elements unnecessarily.'
                )
            )
        ),
        NULL
    );


    -- SECTION 8: SEMANTIC HTML FOR ACCESSIBILITY
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        8,
        'example',
        'Using Semantic HTML for Accessibility',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Semantic elements help assistive technologies understand the structure and purpose of different areas of a webpage.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Semantic page structure',
                    'language', 'html',
                    'code', $code$<header>
    <h1>Student Learning Platform</h1>
</header>

<nav aria-label="Main navigation">
    <a href="index.html">Home</a>
    <a href="courses.html">Courses</a>
</nav>

<main>
    <h2>My Courses</h2>

    <p>Continue with your current learning path.</p>
</main>

<footer>
    <p>Student Learning Platform</p>
</footer>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The header, nav, main and footer elements communicate the roles of the different page sections. This helps assistive technologies understand and navigate the page structure.'
                )
            )
        ),
        NULL
    );


    -- SECTION 9: ARIA
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        9,
        'example',
        'Understanding ARIA',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'ARIA stands for Accessible Rich Internet Applications. It provides additional accessibility information for interfaces where native HTML semantics may not be sufficient.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Providing an accessible button name',
                    'language', 'html',
                    'code', $code$<button aria-label="Close menu">
    X
</button>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The aria-label attribute provides an accessible name for the button, allowing assistive technology users to understand its purpose.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Distinguishing navigation areas',
                    'language', 'html',
                    'code', $code$<nav aria-label="Main navigation">
    <a href="index.html">Home</a>
    <a href="courses.html">Courses</a>
</nav>

<nav aria-label="Account navigation">
    <a href="profile.html">Profile</a>
    <a href="settings.html">Settings</a>
</nav>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The labels help distinguish the purpose of the two navigation sections.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important principle',
                    'text', 'Prefer native HTML elements and their built-in accessibility features before adding ARIA. Incorrect ARIA usage can make a page more confusing rather than more accessible.'
                )
            )
        ),
        NULL
    );


    -- SECTION 10: ACCESSIBLE BUTTONS AND LINKS
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        10,
        'example',
        'Accessible Buttons and Links',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Links and buttons have different purposes. Choosing the correct element helps users understand how to interact with a website.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Links'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Use links when navigating to another location or resource.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example of a link',
                    'language', 'html',
                    'code', $code$<a href="profile.html">View Profile</a>$code$
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Buttons'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Use buttons when performing an action on the current page.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Example of a button',
                    'language', 'html',
                    'code', $code$<button type="button">Save Changes</button>$code$
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember the difference',
                    'text', 'Do not use a link when the purpose is to perform an action that does not involve navigation. Do not use a button merely to navigate to another page when a link is appropriate.'
                )
            )
        ),
        NULL
    );


    -- SECTION 11: BUTTON TYPES
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        11,
        'example',
        'Understanding BUTTON Types',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The button element supports different types. Each type determines how the button behaves when activated.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Submit'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Submit button',
                    'language', 'html',
                    'code', $code$<button type="submit">Submit</button>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Submits the form when associated with a form.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Button'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Normal button',
                    'language', 'html',
                    'code', $code$<button type="button">Open Menu</button>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A normal button that does not automatically submit a form.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Reset'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Reset button',
                    'language', 'html',
                    'code', $code$<button type="reset">Clear Form</button>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Resets form controls to their initial values.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'A common mistake'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Button without an explicit type',
                    'language', 'html',
                    'code', $code$<form>
    <button>Open Menu</button>
</form>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A button inside a form generally defaults to the submit type. If it is intended to perform an unrelated action, specify its type explicitly.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Corrected button',
                    'language', 'html',
                    'code', $code$<button type="button">Open Menu</button>$code$
                )
            )
        ),
        NULL
    );


    -- SECTION 12: COMMON HTML ERRORS
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        12,
        'text',
        'Common HTML Errors',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Even a small mistake in HTML can cause unexpected results. Understanding common errors makes it easier to identify problems and write more reliable code.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 1: Missing closing tags'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect',
                    'language', 'html',
                    'code', $code$<p>Welcome to HTML
<p>Start learning today.$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Better',
                    'language', 'html',
                    'code', $code$<p>Welcome to HTML.</p>

<p>Start learning today.</p>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Some HTML elements have optional end tags under specific rules, but explicitly closing elements where required makes code easier to understand and maintain.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 2: Incorrect nesting'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect nesting',
                    'language', 'html',
                    'code', $code$<p>
    This is <strong>important text.
</p>
</strong>$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct nesting',
                    'language', 'html',
                    'code', $code$<p>
    This is <strong>important text.</strong>
</p>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Elements should close in the correct order. An element opened inside another element should normally be closed before its parent element.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 3: Missing quotation marks'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect',
                    'language', 'html',
                    'code', $code$<a href=https://example.com>Visit Website</a>$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Better',
                    'language', 'html',
                    'code', $code$<a href="https://example.com">Visit Website</a>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Quoted attribute values are clearer and help avoid parsing problems, especially when values contain spaces or special characters.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 4: Duplicate IDs'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect duplicate IDs',
                    'language', 'html',
                    'code', $code$<p id="message">First message</p>

<p id="message">Second message</p>$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct unique IDs',
                    'language', 'html',
                    'code', $code$<p id="message-one">First message</p>

<p id="message-two">Second message</p>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'IDs should be unique within the document. If elements need to share a styling rule, use a class instead.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Sharing a class',
                    'language', 'html',
                    'code', $code$<p class="message">First message</p>

<p class="message">Second message</p>$code$
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 5: Missing image alternative text'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect',
                    'language', 'html',
                    'code', $code$<img src="profile.jpg">$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Better',
                    'language', 'html',
                    'code', $code$<img src="profile.jpg" alt="Student profile photograph">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'For decorative images, use alt="".'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 6: Incorrect file paths'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect path',
                    'language', 'html',
                    'code', $code$<img src="logo.png" alt="Logo">$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Corrected path when the image is inside an images folder',
                    'language', 'html',
                    'code', $code$<img src="images/logo.png" alt="Logo">$code$
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 7: Using the wrong element'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect element for a section heading',
                    'language', 'html',
                    'code', $code$<p>About Us</p>$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct heading element',
                    'language', 'html',
                    'code', $code$<h2>About Us</h2>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'If text is intended to be a section heading, use an appropriate heading element rather than a paragraph.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 8: Missing form labels'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect form input',
                    'language', 'html',
                    'code', $code$<input type="email" name="email" placeholder="Email address">$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correctly labelled email input',
                    'language', 'html',
                    'code', $code$<label for="email">Email Address:</label>

<input
    type="email"
    id="email"
    name="email"
    placeholder="Enter your email">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The label is programmatically connected to the input through the matching for and id attributes.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 9: Incorrect radio button grouping'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Incorrect radio group',
                    'language', 'html',
                    'code', $code$<input type="radio" name="beginner" value="beginner">
<input type="radio" name="advanced" value="advanced">$code$
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Correct radio group',
                    'language', 'html',
                    'code', $code$<input type="radio" name="level" value="beginner">
<input type="radio" name="level" value="advanced">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Radio buttons with the same name belong to the same group. Using different names means the browser treats them as separate groups.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Error 10: Forgetting the viewport declaration'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Without the viewport meta element, mobile browsers may use a wider layout viewport than intended.'
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Viewport declaration',
                    'language', 'html',
                    'code', $code$<meta name="viewport"
      content="width=device-width, initial-scale=1.0">$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'This helps the page adapt to the device''s screen width.'
                )
            )
        ),
        NULL
    );


    -- SECTION 13: VALIDATING HTML
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        13,
        'text',
        'Validating HTML',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Developers should check their HTML to identify errors and improve document quality. HTML validation helps identify markup problems that may affect how a page is interpreted by browsers and assistive technologies.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'W3C Markup Validation Service',
                    'text', 'https://validator.w3.org/'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'title', 'Validation can identify issues such as:',
                    'items', jsonb_build_array(
                        'Incorrect element nesting.',
                        'Invalid attributes.',
                        'Missing required information.',
                        'Duplicate IDs.',
                        'Incorrect document structure.'
                    )
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Validation does not automatically guarantee that a website is accessible, secure or usable. It is one part of the development and testing process.'
                )
            )
        ),
        NULL
    );


    -- SECTION 14: PRACTICAL EXERCISE
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        14,
        'code',
        'Practical Exercise: Build an Accessible Student Profile',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Create a student profile page that demonstrates the accessibility and semantic HTML concepts covered in this lesson.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'title', 'Your page should include:',
                    'items', jsonb_build_array(
                        'A semantic header.',
                        'A navigation menu.',
                        'A main content area.',
                        'A profile image with appropriate alternative text.',
                        'A heading and personal description.',
                        'A skills list.',
                        'A table containing course information.',
                        'A contact form with correctly associated labels.',
                        'A footer.'
                    )
                ),
                jsonb_build_object(
                    'type', 'code',
                    'title', 'Complete accessible student profile',
                    'language', 'html',
                    'code', $code$<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Student Profile</title>
</head>

<body>

    <header>

        <h1>Student Profile</h1>

        <nav aria-label="Main navigation">

            <a href="index.html">Home</a>

            <a href="courses.html">Courses</a>

            <a href="profile.html">Profile</a>

        </nav>

    </header>

    <main>

        <section>

            <h2>Personal Information</h2>

            <img
                src="images/student.jpg"
                alt="Student profile photograph"
                width="150"
            >

            <h3>Sarah Johnson</h3>

            <p>
                I am a student learning web development
                and programming.
            </p>

        </section>

        <section>

            <h2>My Skills</h2>

            <ul>
                <li>HTML</li>
                <li>CSS</li>
                <li>JavaScript</li>
            </ul>

        </section>

        <section>

            <h2>My Courses</h2>

            <table>

                <caption>Current Learning Progress</caption>

                <thead>
                    <tr>
                        <th scope="col">Course</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>HTML</td>
                        <td>In Progress</td>
                    </tr>

                    <tr>
                        <td>CSS</td>
                        <td>Not Started</td>
                    </tr>
                </tbody>

            </table>

        </section>

        <section>

            <h2>Contact Me</h2>

            <form action="/contact" method="post">

                <label for="name">Name:</label>

                <input
                    type="text"
                    id="name"
                    name="name"
                    required
                >

                <br><br>

                <label for="email">Email:</label>

                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                >

                <br><br>

                <label for="message">Message:</label>

                <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required>
                </textarea>

                <br><br>

                <button type="submit">Send Message</button>

            </form>

        </section>

    </main>

    <footer>

        <p>&copy; 2026 Student Profile</p>

    </footer>

</body>
</html>$code$
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The example combines semantic page sections, meaningful alternative text, accessible navigation, a structured table and correctly labelled form controls. Use it as a reference when building your own accessible student profile.'
                )
            )
        ),
        NULL
    );


    -- SECTION 15: SUMMARY
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        15,
        'summary',
        'Important Points to Remember',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'list',
                    'title', 'Key points from this lesson:',
                    'items', jsonb_build_array(
                        'Accessibility makes websites usable by a wider range of people.',
                        'Images need meaningful alternative text when they communicate information.',
                        'Decorative images should generally use alt="".',
                        'Form controls need accessible names, commonly provided through labels.',
                        'Fieldset and legend group related form controls.',
                        'Semantic HTML helps assistive technologies understand page structure.',
                        'Keyboard navigation is important.',
                        'Links are used for navigation.',
                        'Buttons are used for actions.',
                        'Native HTML controls should be preferred.',
                        'ARIA provides additional accessibility information when needed.',
                        'HTML validation helps identify markup errors.',
                        'Valid HTML does not automatically guarantee accessibility.'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Final reminder',
                    'text', 'Accessible websites are designed with different users and interaction methods in mind. Good HTML structure, meaningful labels and correct native elements are important foundations of accessible web development.'
                )
            )
        ),
        NULL
    );


    -- SECTION 16: QUIZ
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type,
        section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        16,
        'quiz',
        'Lesson 11 Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Test your understanding of accessibility, form controls, button types and semantic HTML by completing the following questions.'
                )
            )
        ),
        v_quiz_id
    );


    -- QUESTION 1
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
        'A developer places an ordinary div around a group of form controls and gives it the text "Account Information". The controls are related and should be announced as one group. Which improvement is most appropriate?',
        '[
            {"label":"A","text":"Replace the div with a fieldset and place the group description inside a legend."},
            {"label":"B","text":"Replace the div with an article and use a heading as the form label."},
            {"label":"C","text":"Add tabindex=\"1\" to the div so the browser automatically groups the controls."},
            {"label":"D","text":"Replace the div with a footer because it contains information about an account."}
        ]'::jsonb,
        '{"correct_answer":"A"}'::jsonb,
        'Fieldset and legend provide a semantic grouping and description for related form controls. This helps users understand the purpose of the group.',
        3,
        TRUE
    );


    -- QUESTION 2
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
        'A button is placed inside a form. It should open a menu without submitting the form. Which implementation is most appropriate?',
        '[
            {"label":"A","text":"<button type=\"submit\">Open Menu</button>"},
            {"label":"B","text":"<button type=\"reset\">Open Menu</button>"},
            {"label":"C","text":"<button type=\"button\">Open Menu</button>"},
            {"label":"D","text":"<a type=\"button\">Open Menu</a>"}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'The type="button" attribute creates a button that does not automatically submit the form. A button inside a form normally defaults to the submit type, so explicitly specifying button prevents an unintended form submission.',
        3,
        TRUE
    );


    -- QUESTION 3
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
        'A developer has two navigation areas on the same page: one for the main website and another for the user''s account. Which approach helps assistive technology distinguish them?',
        '[
            {"label":"A","text":"Give both navigation areas the same id so they are recognised as one section."},
            {"label":"B","text":"Use separate nav elements with meaningful accessible labels."},
            {"label":"C","text":"Place both navigation areas inside one footer element."},
            {"label":"D","text":"Replace both navigation elements with span elements and add CSS classes."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'Separate navigation elements with meaningful labels help assistive technology users distinguish the purposes of the different navigation areas.',
        3,
        TRUE
    );


    -- Publish the lesson and quiz
    UPDATE public.lesson
    SET status = 'published',
        updated_at = NOW()
    WHERE lesson_id = v_lesson_id;

    UPDATE public.quiz
    SET status = 'published'
    WHERE quiz_id = v_quiz_id;

    RAISE NOTICE 'Lesson 11 inserted successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id,
        v_quiz_id;

END $$;


-- last knowledge check continues for lees 10 questions:

DO $$
DECLARE
    v_quiz_id INTEGER := 25;
    v_existing_count INTEGER;
    v_lesson_id INTEGER;
BEGIN
    -- Confirm that this is the existing Lesson 11 quiz.
    SELECT lesson_id
    INTO v_lesson_id
    FROM public.quiz
    WHERE quiz_id = v_quiz_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quiz 25 was not found.';
    END IF;

    IF v_lesson_id <> 23 THEN
        RAISE EXCEPTION 'Quiz 25 is not attached to Lesson 11.';
    END IF;

    -- Check the existing number of questions.
    SELECT COUNT(*)
    INTO v_existing_count
    FROM public.question
    WHERE quiz_id = v_quiz_id;

    -- Prevent duplicate insertion.
    IF v_existing_count = 13 THEN
        RAISE NOTICE 'All 13 questions already exist. No changes made.';
        RETURN;
    ELSIF v_existing_count <> 3 THEN
        RAISE EXCEPTION
            'Expected 3 existing questions, but found %. No questions inserted.',
            v_existing_count;
    END IF;

    -- QUESTION 4
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        4,
        'multiple_choice',
        $q$A developer creates the following HTML document:

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Learning Portal</title>
</head>
<body>
    <h1>Welcome</h1>
</body>
</html>

Which statement is the most accurate improvement for supporting mobile screen layouts?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'Add width="100%" to the <html> element.'),
            jsonb_build_object('label', 'B', 'text', 'Add a viewport meta element inside the head.'),
            jsonb_build_object('label', 'C', 'text', 'Move the title element into the body.'),
            jsonb_build_object('label', 'D', 'text', 'Add responsive="true" to the body element.')
        ),
        jsonb_build_object('correct_answer', 'B'),
        'The viewport meta element helps the browser adapt the layout viewport to the device width.',
        3,
        TRUE
    );

    -- QUESTION 5
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        5,
        'multiple_choice',
        $q$A page contains a main heading, followed by two sections. The second section has three subsections. Which heading structure is most appropriate?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'Main heading <h1>, sections <h2>, subsections <h3>.'),
            jsonb_build_object('label', 'B', 'text', 'Main heading <h1>, sections <h3>, subsections <h2>.'),
            jsonb_build_object('label', 'C', 'text', 'Main heading <h2>, sections <h1>, subsections <h3>.'),
            jsonb_build_object('label', 'D', 'text', 'Main heading <h1>, sections <p>, subsections <h4>.')
        ),
        jsonb_build_object('correct_answer', 'A'),
        'The heading levels should represent the logical hierarchy of the content.',
        3,
        TRUE
    );

    -- QUESTION 6
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        6,
        'multiple_choice',
        $q$A website has this file structure:

website/
|
|-- index.html
|-- images/
|   |-- logo.png
|
|-- pages/
    |-- about.html

Inside about.html, which path correctly displays the logo?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'images/logo.png'),
            jsonb_build_object('label', 'B', 'text', '../images/logo.png'),
            jsonb_build_object('label', 'C', 'text', '../../images/logo.png'),
            jsonb_build_object('label', 'D', 'text', '/pages/images/logo.png')
        ),
        jsonb_build_object('correct_answer', 'B'),
        'The current file is inside pages, so ../ moves to the website root before entering images.',
        3,
        TRUE
    );

    -- QUESTION 7
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        7,
        'multiple_choice',
        $q$A developer adds an image that communicates an important warning. Which implementation is most appropriate?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', '<img src="warning.png" alt="">'),
            jsonb_build_object('label', 'B', 'text', '<img src="warning.png" alt="Image">'),
            jsonb_build_object('label', 'C', 'text', '<img src="warning.png" alt="Warning: Save your work before continuing.">'),
            jsonb_build_object('label', 'D', 'text', '<img src="warning.png" title="Warning">')
        ),
        jsonb_build_object('correct_answer', 'C'),
        'The alt text should communicate the important information represented by the warning image.',
        3,
        TRUE
    );

    -- QUESTION 8
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        8,
        'multiple_choice',
        $q$A developer is creating a glossary containing programming terms and their definitions. Which HTML structure is most appropriate?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'An ordered list using <ol> and <li>.'),
            jsonb_build_object('label', 'B', 'text', 'An unordered list using <ul> and <li>.'),
            jsonb_build_object('label', 'C', 'text', 'A description list using <dl>, <dt> and <dd>.'),
            jsonb_build_object('label', 'D', 'text', 'A navigation section using <nav> and <a>.')
        ),
        jsonb_build_object('correct_answer', 'C'),
        'Description lists are designed for terms and their corresponding explanations.',
        3,
        TRUE
    );

    -- QUESTION 9
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        9,
        'multiple_choice',
        $q$A table has a cell that must occupy two columns and three rows. Which statement correctly describes the required attributes?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'Use rowspan="2" and colspan="3".'),
            jsonb_build_object('label', 'B', 'text', 'Use colspan="2" and rowspan="3".'),
            jsonb_build_object('label', 'C', 'text', 'Use span="2" and span="3".'),
            jsonb_build_object('label', 'D', 'text', 'Use scope="col" and scope="row".')
        ),
        jsonb_build_object('correct_answer', 'B'),
        'colspan spans columns horizontally, while rowspan spans rows vertically.',
        3,
        TRUE
    );

    -- QUESTION 10
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        10,
        'multiple_choice',
        $q$A website contains a section titled "Recent Community Posts". Each post is independently shareable and contains its own heading and description. Which HTML structure is most appropriate?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'A <section> containing individual <article> elements.'),
            jsonb_build_object('label', 'B', 'text', 'An <article> containing several <footer> elements.'),
            jsonb_build_object('label', 'C', 'text', 'An <aside> containing individual <nav> elements.'),
            jsonb_build_object('label', 'D', 'text', 'A <main> containing only <div> elements because semantic elements cannot be nested.')
        ),
        jsonb_build_object('correct_answer', 'A'),
        'The section groups related posts, and each article represents independent content.',
        3,
        TRUE
    );

    -- QUESTION 11
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        11,
        'multiple_choice',
        $q$Consider this HTML form:

<form action="/register" method="post">
    <label for="username">Username</label>

    <input
        type="text"
        id="username"
        name="account_name"
        required
    >

    <button type="submit">Register</button>
</form>

Which value identifies the field in the submitted form data?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'username, because it is the input''s ID.'),
            jsonb_build_object('label', 'B', 'text', 'account_name, because it is the input''s name.'),
            jsonb_build_object('label', 'C', 'text', 'register, because it is the submit button''s visible text.'),
            jsonb_build_object('label', 'D', 'text', '/register, because it is the form''s action.')
        ),
        jsonb_build_object('correct_answer', 'B'),
        'The name attribute identifies the form field in the submitted data.',
        3,
        TRUE
    );

    -- QUESTION 12
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        12,
        'multiple_choice',
        $q$A registration form allows users to choose one experience level. Which implementation correctly groups the radio buttons?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', '<input type="radio" name="beginner" value="beginner"> <input type="radio" name="intermediate" value="intermediate"> <input type="radio" name="advanced" value="advanced">'),
            jsonb_build_object('label', 'B', 'text', '<input type="radio" name="level" value="beginner"> <input type="radio" name="level" value="intermediate"> <input type="radio" name="level" value="advanced">'),
            jsonb_build_object('label', 'C', 'text', '<input type="checkbox" name="level" value="beginner"> <input type="checkbox" name="level" value="intermediate"> <input type="checkbox" name="level" value="advanced">'),
            jsonb_build_object('label', 'D', 'text', '<input type="text" name="level" value="beginner"> <input type="text" name="level" value="intermediate"> <input type="text" name="level" value="advanced">')
        ),
        jsonb_build_object('correct_answer', 'B'),
        'Radio buttons with the same name form a single-choice group.',
        3,
        TRUE
    );

    -- QUESTION 13
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt,
        options, evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        13,
        'multiple_choice',
        $q$A developer places a button inside a form. The button should open a navigation menu and must not submit the form. What should the developer do?$q$,
        jsonb_build_array(
            jsonb_build_object('label', 'A', 'text', 'Use type="submit" and prevent the form from displaying an error.'),
            jsonb_build_object('label', 'B', 'text', 'Use type="reset" so the form remains open.'),
            jsonb_build_object('label', 'C', 'text', 'Use type="button" and implement the menu interaction separately.'),
            jsonb_build_object('label', 'D', 'text', 'Replace the button with a paragraph and give it a click event.')
        ),
        jsonb_build_object('correct_answer', 'C'),
        'A button with type="button" does not automatically submit the surrounding form.',
        3,
        TRUE
    );

    -- Confirm the final question count.
    SELECT COUNT(*)
    INTO v_existing_count
    FROM public.question
    WHERE quiz_id = v_quiz_id;

    IF v_existing_count <> 13 THEN
        RAISE EXCEPTION
            'Expected 13 questions after insertion, but found %.',
            v_existing_count;
    END IF;

    
RAISE NOTICE 'Successfully added 10 questions to Lesson 11. Total questions: %',
    v_existing_count;

END $$;









