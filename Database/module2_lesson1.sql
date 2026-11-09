
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
          AND lesson_number = 1
    ) THEN
        RAISE EXCEPTION 'Module 2 Lesson 1 already exists. No changes were made.';
    END IF;

    -- Create Lesson 1.
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
        1,
        'Introduction to HTML',
        'introduction-to-html',
        'Learn what HTML is, how it structures web pages, how it works with CSS and JavaScript, and how browsers process HTML documents.',
        'beginner',
        25,
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
        1,
        'Lesson 2.1 Knowledge Check',
        'Answer all three questions about HTML, HTML elements and how browsers process HTML documents.',
        'practice',
        50,
        3,
        5,
        'draft'
    )
    RETURNING quiz_id INTO v_quiz_id;

    -- Section 1: Introduction.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        1,
        'introduction',
        'Introduction to HTML',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Welcome to your first CodeXperts lesson! Before learning how to write code, it is important to understand what HTML is and how it is used to create and structure content on web pages.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'What Is HTML?'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML stands for HyperText Markup Language. It is the standard markup language used to create and structure content on web pages.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML tells a web browser how different pieces of content should be organised. For example, it identifies which content is a heading, paragraph, image, link, list, table or form.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'When a browser opens an HTML file, it reads the HTML instructions and displays the content as a web page.'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML is not a programming language because it does not provide the same logic and decision-making capabilities as languages such as JavaScript, Python or Java. Instead, HTML describes the structure and meaning of web content.'
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Example: Basic HTML content',
                    'text', ($code$
<h1>Welcome to CodeXperts</h1>
<p>Learn programming by building real projects.</p>
<a href="https://www.example.com">Visit our website</a>

The browser displays:
- A large heading.
- A paragraph underneath the heading.
- A clickable link.
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'Without HTML, the browser would not have the same structured instructions for presenting the content of a web page.'
                )
            )
        )
    );

    -- Section 2: HTML, CSS and JavaScript.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        2,
        'heading',
        'Understanding the Role of HTML, CSS and JavaScript',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Modern websites commonly use three main technologies: HTML, CSS and JavaScript. Each technology has a different responsibility, but they work together to create complete websites.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'HTML — Structure'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML defines what appears on the page and gives content its meaning.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Headings and paragraphs.',
                        'Images and links.',
                        'Forms and tables.'
                    )
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'CSS — Presentation'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'CSS stands for Cascading Style Sheets. It controls how HTML content looks.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Text colours and background colours.',
                        'Font sizes and spacing.',
                        'Borders and page layouts.',
                        'Responsive designs.'
                    )
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'JavaScript — Behaviour'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'JavaScript adds functionality and interaction to a web page.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Opening a dropdown menu.',
                        'Checking form input.',
                        'Updating page content.',
                        'Displaying notifications.',
                        'Responding to button clicks.'
                    )
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Example: Combining HTML and JavaScript',
                    'text', ($code$
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My First Website</title>
</head>
<body>
    <h1 id="heading">Welcome!</h1>
    <button onclick="changeHeading()">
        Click Me
    </button>

    <script>
        function changeHeading() {
            document.getElementById("heading").textContent =
                "You clicked the button!";
        }
    </script>
</body>
</html>

Explanation:
- HTML creates the heading and button.
- JavaScript changes the heading when the button is clicked.
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Example: CSS styling',
                    'text', ($code$
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: lightgray;
    }

    h1 {
        color: darkblue;
    }

    button {
        background-color: navy;
        color: white;
        padding: 10px 20px;
        border: none;
    }
</style>

Explanation:
- The body uses Arial as its font.
- The page background is light grey.
- The heading is dark blue.
- The button has a navy background and white text.
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember the difference',
                    'text', 'HTML provides the structure, CSS controls the presentation, and JavaScript provides behaviour and interactivity.'
                )
            )
        )
    );

    -- Section 3: HTML elements.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        3,
        'heading',
        'Understanding HTML Elements',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An HTML element is generally made up of three parts: an opening tag, content and a closing tag.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Opening tag.',
                        'Content.',
                        'Closing tag.'
                    )
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Example: A paragraph element',
                    'text', ($code$
<p>This is a paragraph.</p>

The three parts are:
- <p> is the opening tag.
- This is a paragraph. is the content.
- </p> is the closing tag.

Together, these parts form a paragraph element.
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Void Elements'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Not every HTML element has a closing tag. Some elements are called void elements because they cannot contain content. These elements do not use separate closing tags.'
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Examples of void elements',
                    'text', ($code$
<img src="logo.png" alt="Company logo">
<br>
<hr>
<input type="text">
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important',
                    'text', 'Void elements do not use separate closing tags. Examples include img, br, hr and input.'
                )
            )
        )
    );

    -- Section 4: HTML tags.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        4,
        'heading',
        'Understanding HTML Tags',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An HTML tag is the markup enclosed within angle brackets. Tags tell the browser what type of element is being created.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        '<h1> — a heading tag.',
                        '<p> — a paragraph tag.',
                        '<a> — a link tag.',
                        '<img> — an image tag.'
                    )
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'The Difference Between a Tag and an Element'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'A common mistake is confusing an HTML tag with an HTML element. A tag is the markup itself, while an element includes the complete structure and its content, where applicable.'
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Tag versus element',
                    'text', ($code$
<p>Hello, learner!</p>

In this example:
- <p> is the opening tag.
- </p> is the closing tag.
- The complete paragraph, including its content, is the HTML element.
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Remember',
                    'text', 'A tag is the markup itself. An element is the complete HTML structure and its content, where applicable.'
                )
            )
        )
    );

    -- Section 5: Browser processing and the DOM.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        5,
        'heading',
        'How a Browser Processes HTML',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'When a browser loads an HTML document, it reads the markup and constructs a structured representation called the Document Object Model (DOM).'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'The DOM represents the page as a tree of objects. It organises the HTML elements according to their relationships within the document.'
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Example: A simple HTML structure',
                    'text', ($code$
<body>
    <h1>My Website</h1>
    <section>
        <p>Welcome to my website.</p>
    </section>
</body>

The browser understands:
- body is the parent of the heading and section.
- section is the parent of the paragraph.
- heading and section are children of body.
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Parent and Child Relationships'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'An element that contains another element is called its parent. The element inside it is called its child. These parent-child relationships are important when working with nested HTML elements and JavaScript.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Important term',
                    'text', 'DOM stands for Document Object Model. It is the browser''s structured representation of an HTML document.'
                )
            )
        )
    );

    -- Section 6: Creating the first HTML page.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        6,
        'heading',
        'Creating Your First HTML Page',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Now that you understand the purpose of HTML, you can create a simple HTML page. You will need a text editor, such as Visual Studio Code, and a web browser to view the result.'
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Follow These Steps'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'items',
                    jsonb_build_array(
                        'Open Visual Studio Code or another text editor.',
                        'Create a new folder called my-first-website.',
                        'Inside the folder, create a file called index.html.',
                        'Add the HTML code shown in the example below.',
                        'Save the file.',
                        'Open index.html in a web browser.'
                    )
                ),
                jsonb_build_object(
                    'type', 'example',
                    'title', 'Your first HTML document',
                    'text', ($code$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Web Page</title>
</head>
<body>
    <h1>My First Website</h1>
    <p>I am learning how to build websites using HTML.</p>
</body>
</html>
$code$)::text
                ),
                jsonb_build_object(
                    'type', 'heading',
                    'text', 'Expected Result'
                ),
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'When you open the file in your browser, you should see a heading that says My First Website and a paragraph underneath it.'
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'Practical tip',
                    'text', 'Make sure the file is saved with the .html extension. If you make changes to the file, save it and refresh the browser to view the updated page.'
                )
            )
        )
    );

    -- Section 7: Lesson summary.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content
    )
    VALUES (
        v_lesson_id,
        7,
        'summary',
        'Lesson Summary',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'HTML stands for HyperText Markup Language. It provides the structure of a web page and identifies content such as headings, paragraphs, images, links, lists, tables and forms.'
                ),
                jsonb_build_object(
                    'type', 'list',
                    'title', 'Important points to remember',
                    'items',
                    jsonb_build_array(
                        'HTML stands for HyperText Markup Language.',
                        'HTML provides the structure of a web page.',
                        'CSS controls presentation and appearance.',
                        'JavaScript provides behaviour and interactivity.',
                        'HTML elements are created using tags.',
                        'A tag is the markup itself, while an element is the complete structure and its content, where applicable.',
                        'Browsers interpret HTML and construct the DOM.',
                        'HTML is a markup language, not a programming language.'
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
                        'Can you explain what HTML is and what it is used for?',
                        'Can you describe the different roles of HTML, CSS and JavaScript?',
                        'Can you identify the opening tag, content and closing tag in an HTML element?',
                        'Can you explain the difference between an HTML tag and an HTML element?',
                        'Can you describe what the DOM represents?',
                        'Can you create and open a basic HTML page in a browser?'
                    )
                ),
                jsonb_build_object(
                    'type', 'callout',
                    'title', 'You are ready for the next lesson when...',
                    'text', 'You can explain the purpose of HTML, distinguish it from CSS and JavaScript, identify basic HTML elements and describe how a browser processes an HTML document.'
                )
            )
        )
    );

    -- Section 8: Knowledge Check.
    INSERT INTO public.lesson_section (
        lesson_id, display_order, section_type, section_title, section_content, quiz_id
    )
    VALUES (
        v_lesson_id,
        8,
        'quiz',
        'Knowledge Check',
        jsonb_build_object(
            'blocks',
            jsonb_build_array(
                jsonb_build_object(
                    'type', 'paragraph',
                    'text', 'Check your understanding of HTML, the difference between tags and elements, and how browsers process HTML documents by answering the following questions.'
                )
            )
        ),
        v_quiz_id
    );

    -- Question 1.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        1,
        'multiple_choice',
        'A student creates a web page using HTML and wants a button to change a heading when clicked. Which technology is responsible for implementing that interaction?',
        '[
            {"label":"A","text":"HTML, because it defines the button''s position."},
            {"label":"B","text":"CSS, because it controls how the heading is displayed."},
            {"label":"C","text":"JavaScript, because it handles the click event and changes the content."},
            {"label":"D","text":"The DOM, because it automatically executes user interactions."}
        ]'::jsonb,
        '{"correct_answer":"C"}'::jsonb,
        'JavaScript handles events and changes content. HTML provides the button, while CSS controls its appearance.',
        3,
        TRUE
    );

    -- Question 2.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        2,
        'multiple_choice',
        'Which statement correctly describes the relationship between an HTML tag and an HTML element?',
        '[
            {"label":"A","text":"A tag contains the complete content, while an element only identifies the opening markup."},
            {"label":"B","text":"An element may consist of an opening tag, content and a closing tag, while a tag is the markup itself."},
            {"label":"C","text":"Tags are only used for text, while elements are only used for images."},
            {"label":"D","text":"An HTML element must always contain both an opening and closing tag."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'An element consists of its markup and, where applicable, its content. A void element is an exception to the usual opening-content-closing structure.',
        3,
        TRUE
    );

    -- Question 3.
    INSERT INTO public.question (
        quiz_id, display_order, question_type, prompt, options,
        evaluation, explanation, xp_reward, is_required
    )
    VALUES (
        v_quiz_id,
        3,
        'multiple_choice',
        'What happens when a browser processes an HTML document?',
        '[
            {"label":"A","text":"It automatically converts all HTML into JavaScript."},
            {"label":"B","text":"It creates a DOM representation of the document that the browser can work with."},
            {"label":"C","text":"It converts every HTML element into a separate CSS file."},
            {"label":"D","text":"It stores all HTML elements permanently in the browser''s database."}
        ]'::jsonb,
        '{"correct_answer":"B"}'::jsonb,
        'The browser constructs a structured representation of the document, allowing it to display and manipulate page content.',
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
        'Module 2 Lesson 1 created successfully. Lesson ID: %, Quiz ID: %',
        v_lesson_id, v_quiz_id;

END $$;












DO $do$
DECLARE
    v_lesson_id BIGINT;
BEGIN
    -- Find Module 2, Lesson 1.
    SELECT lesson_id
    INTO v_lesson_id
    FROM public.lesson
    WHERE module_id = 2
      AND lesson_number = 1;

    IF v_lesson_id IS NULL THEN
        RAISE EXCEPTION 'Module 2, Lesson 1 was not found.';
    END IF;

    -- Convert the existing example blocks into code blocks.
    -- Explanations are moved into separate paragraphs and lists.
    UPDATE public.lesson_section AS ls
    SET section_content = jsonb_set(
        ls.section_content,
        '{blocks}',
        (
            SELECT jsonb_agg(
                expanded.new_block
                ORDER BY original.ordinality, expanded.sub_order
            )
            FROM jsonb_array_elements(
                ls.section_content->'blocks'
            ) WITH ORDINALITY AS original(block, ordinality)

            CROSS JOIN LATERAL jsonb_array_elements(
                CASE original.block->>'title'

                    -- Section 1: Basic HTML content.
                    WHEN 'Example: Basic HTML content' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'Basic HTML content',
                                'language', 'html',
                                'code', $snippet$
<h1>Welcome to CodeXperts</h1>
<p>Learn programming by building real projects.</p>
<a href="https://www.example.com">Visit our website</a>
$snippet$
                            ),
                            jsonb_build_object(
                                'type', 'paragraph',
                                'text', 'The browser displays:'
                            ),
                            jsonb_build_object(
                                'type', 'list',
                                'items', jsonb_build_array(
                                    'A large heading.',
                                    'A paragraph underneath the heading.',
                                    'A clickable link.'
                                )
                            )
                        )

                    -- Section 2: HTML and JavaScript.
                    WHEN 'Example: Combining HTML and JavaScript' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'Combining HTML and JavaScript',
                                'language', 'html',
                                'code', $snippet$
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My First Website</title>
</head>
<body>
    <h1 id="heading">Welcome!</h1>
    <button onclick="changeHeading()">
        Click Me
    </button>

    <script>
        function changeHeading() {
            document.getElementById("heading").textContent =
                "You clicked the button!";
        }
    </script>
</body>
</html>
$snippet$
                            ),
                            jsonb_build_object(
                                'type', 'paragraph',
                                'text', 'Explanation:'
                            ),
                            jsonb_build_object(
                                'type', 'list',
                                'items', jsonb_build_array(
                                    'HTML creates the heading and button.',
                                    'JavaScript changes the heading when the button is clicked.'
                                )
                            )
                        )

                    -- Section 2: CSS styling.
                    WHEN 'Example: CSS styling' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'CSS styling',
                                'language', 'css',
                                'code', $snippet$
body {
    font-family: Arial, sans-serif;
    background-color: lightgray;
}

h1 {
    color: darkblue;
}

button {
    background-color: navy;
    color: white;
    padding: 10px 20px;
    border: none;
}
$snippet$
                            ),
                            jsonb_build_object(
                                'type', 'paragraph',
                                'text', 'Explanation:'
                            ),
                            jsonb_build_object(
                                'type', 'list',
                                'items', jsonb_build_array(
                                    'The body uses Arial as its font.',
                                    'The page background is light grey.',
                                    'The heading is dark blue.',
                                    'The button has a navy background and white text.'
                                )
                            )
                        )

                    -- Section 3: Paragraph element.
                    WHEN 'Example: A paragraph element' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'A paragraph element',
                                'language', 'html',
                                'code', $snippet$
<p>This is a paragraph.</p>
$snippet$
                            ),
                            jsonb_build_object(
                                'type', 'paragraph',
                                'text', 'The three parts are:'
                            ),
                            jsonb_build_object(
                                'type', 'list',
                                'items', jsonb_build_array(
                                    '<p> is the opening tag.',
                                    'This is a paragraph. is the content.',
                                    '</p> is the closing tag.'
                                )
                            ),
                            jsonb_build_object(
                                'type', 'paragraph',
                                'text', 'Together, these parts form a paragraph element.'
                            )
                        )

                    -- Section 3: Void elements.
                    WHEN 'Examples of void elements' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'Examples of void elements',
                                'language', 'html',
                                'code', $snippet$
<img src="logo.png" alt="Company logo">
<br>
<hr>
<input type="text">
$snippet$
                            )
                        )

                    -- Section 4: Tag versus element.
                    WHEN 'Tag versus element' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'Tag versus element',
                                'language', 'html',
                                'code', $snippet$
<p>Hello, learner!</p>
$snippet$
                            ),
                            jsonb_build_object(
                                'type', 'paragraph',
                                'text', 'In this example:'
                            ),
                            jsonb_build_object(
                                'type', 'list',
                                'items', jsonb_build_array(
                                    '<p> is the opening tag.',
                                    '</p> is the closing tag.',
                                    'The complete paragraph, including its content, is the HTML element.'
                                )
                            )
                        )

                    -- Section 5: Simple HTML structure.
                    WHEN 'Example: A simple HTML structure' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'A simple HTML structure',
                                'language', 'html',
                                'code', $snippet$
<body>
    <h1>My Website</h1>
    <section>
        <p>Welcome to my website.</p>
    </section>
</body>
$snippet$
                            ),
                            jsonb_build_object(
                                'type', 'paragraph',
                                'text', 'The browser understands:'
                            ),
                            jsonb_build_object(
                                'type', 'list',
                                'items', jsonb_build_array(
                                    'body is the parent of the heading and section.',
                                    'section is the parent of the paragraph.',
                                    'heading and section are children of body.'
                                )
                            )
                        )

                    -- Section 6: First HTML document.
                    WHEN 'Your first HTML document' THEN
                        jsonb_build_array(
                            jsonb_build_object(
                                'type', 'code',
                                'title', 'Your first HTML document',
                                'language', 'html',
                                'code', $snippet$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Web Page</title>
</head>
<body>
    <h1>My First Website</h1>
    <p>I am learning how to build websites using HTML.</p>
</body>
</html>
$snippet$
                            )
                        )

                    -- Leave all other blocks unchanged.
                    ELSE
                        jsonb_build_array(original.block)

                END
            ) WITH ORDINALITY AS expanded(new_block, sub_order)
        ),
        TRUE
    )
    WHERE ls.lesson_id = v_lesson_id
      AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(
              ls.section_content->'blocks'
          ) AS existing(block)
          WHERE existing.block->>'type' = 'example'
            AND existing.block->>'title' IN (
                'Example: Basic HTML content',
                'Example: Combining HTML and JavaScript',
                'Example: CSS styling',
                'Example: A paragraph element',
                'Examples of void elements',
                'Tag versus element',
                'Example: A simple HTML structure',
                'Your first HTML document'
            )
      );

    RAISE NOTICE
        'Code examples updated successfully for Module 2, Lesson 1. Lesson ID: %',
        v_lesson_id;

END $do$;
