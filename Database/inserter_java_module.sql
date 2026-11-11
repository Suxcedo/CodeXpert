
BEGIN;

-- Insert Java Development modules
WITH new_modules AS (
    INSERT INTO public.module (
        path_id,
        module_number,
        module_name,
        description
    )
    VALUES
    (3, 1, 'Introduction to Java',
     'Learn what Java is, its history, features, applications and basic program structure.'),

    (3, 2, 'Java Variables, Data Types and Operators',
     'Learn how Java stores and works with data using variables, data types and operators.'),

    (3, 3, 'Decision Making and Loops',
     'Learn how to control program execution using conditional statements and loops.'),

    (3, 4, 'Methods and Modular Programming',
     'Learn how to create and use reusable methods to organise Java programs.'),

    (3, 5, 'Arrays and String Manipulation',
     'Learn how to store collections of data using arrays and manipulate text using strings.'),

    (3, 6, 'Introduction to Object-Oriented Programming',
     'Learn the fundamentals of object-oriented programming using classes, objects and encapsulation.'),

    (3, 7, 'Advanced Object-Oriented Programming',
     'Explore inheritance, polymorphism, abstract classes, interfaces and other advanced object-oriented concepts.'),

    (3, 8, 'Exception Handling and Debugging',
     'Learn how to identify, handle and debug errors in Java programs.'),

    (3, 9, 'Java Collections and File Handling',
     'Learn how to manage collections of data and read and write files in Java.'),

    (3, 10, 'Java Application Development Project',
     'Apply Java programming concepts by planning, developing, testing and presenting an application.')
    RETURNING module_id, module_number
),

lesson_data (module_number, lesson_number, title, slug) AS (
    VALUES

    -- MODULE 1
    (1, 1, 'What Is Java?', 'what-is-java'),
    (1, 2, 'Features of Java', 'features-of-java'),
    (1, 3, 'Where Is Java Used?', 'where-is-java-used'),
    (1, 4, 'Understanding the JDK, JVM and Bytecode', 'jdk-jvm-and-bytecode'),
    (1, 5, 'Your First Java Program', 'your-first-java-program'),

    -- MODULE 2
    (2, 1, 'Understanding Variables and Constants', 'understanding-variables-and-constants'),
    (2, 2, 'Primitive Data Types', 'primitive-data-types'),
    (2, 3, 'Non-Primitive Data Types', 'non-primitive-data-types'),
    (2, 4, 'Declaring and Initialising Variables', 'declaring-and-initialising-variables'),
    (2, 5, 'Type Casting and Type Conversion', 'type-casting-and-type-conversion'),
    (2, 6, 'Arithmetic Operators', 'arithmetic-operators'),
    (2, 7, 'Relational and Logical Operators', 'relational-and-logical-operators'),
    (2, 8, 'Assignment and Increment Operators', 'assignment-and-increment-operators'),
    (2, 9, 'Working with Strings', 'working-with-strings'),
    (2, 10, 'Receiving User Input Using Scanner', 'receiving-user-input-using-scanner'),

    -- MODULE 3
    (3, 1, 'Introduction to Control Flow', 'introduction-to-control-flow'),
    (3, 2, 'The if Statement', 'the-if-statement'),
    (3, 3, 'if-else Statements', 'if-else-statements'),
    (3, 4, 'Nested if Statements', 'nested-if-statements'),
    (3, 5, 'The switch Statement', 'the-switch-statement'),
    (3, 6, 'Introduction to Loops', 'introduction-to-loops'),
    (3, 7, 'The for Loop', 'the-for-loop'),
    (3, 8, 'The while Loop', 'the-while-loop'),
    (3, 9, 'The do-while Loop', 'the-do-while-loop'),
    (3, 10, 'break and continue Statements', 'break-and-continue-statements'),

    -- MODULE 4
    (4, 1, 'Introduction to Methods', 'introduction-to-methods'),
    (4, 2, 'Creating and Calling Methods', 'creating-and-calling-methods'),
    (4, 3, 'Method Parameters and Arguments', 'method-parameters-and-arguments'),
    (4, 4, 'Return Values', 'return-values'),
    (4, 5, 'Void and Non-Void Methods', 'void-and-non-void-methods'),
    (4, 6, 'Method Overloading', 'method-overloading'),
    (4, 7, 'Variable Scope', 'variable-scope'),
    (4, 8, 'Introduction to Recursion', 'introduction-to-recursion'),

    -- MODULE 5
    (5, 1, 'Introduction to Arrays', 'introduction-to-arrays'),
    (5, 2, 'Declaring and Initialising Arrays', 'declaring-and-initialising-arrays'),
    (5, 3, 'Accessing and Updating Array Elements', 'accessing-and-updating-array-elements'),
    (5, 4, 'Traversing Arrays', 'traversing-arrays'),
    (5, 5, 'Multidimensional Arrays', 'multidimensional-arrays'),
    (5, 6, 'Introduction to String Methods', 'introduction-to-string-methods'),
    (5, 7, 'Comparing Strings', 'comparing-strings'),
    (5, 8, 'StringBuilder and String Manipulation', 'stringbuilder-and-string-manipulation'),

    -- MODULE 6
    (6, 1, 'Understanding Object-Oriented Programming', 'understanding-object-oriented-programming'),
    (6, 2, 'Classes and Objects', 'classes-and-objects'),
    (6, 3, 'Fields and Methods', 'fields-and-methods'),
    (6, 4, 'Constructors', 'constructors'),
    (6, 5, 'The this Keyword', 'the-this-keyword'),
    (6, 6, 'Encapsulation', 'encapsulation'),
    (6, 7, 'Access Modifiers', 'access-modifiers'),
    (6, 8, 'Getters and Setters', 'getters-and-setters'),

    -- MODULE 7
    (7, 1, 'Introduction to Inheritance', 'introduction-to-inheritance'),
    (7, 2, 'Types of Inheritance in Java', 'types-of-inheritance-in-java'),
    (7, 3, 'The super Keyword', 'the-super-keyword'),
    (7, 4, 'Method Overriding', 'method-overriding'),
    (7, 5, 'Polymorphism', 'polymorphism'),
    (7, 6, 'Abstract Classes', 'abstract-classes'),
    (7, 7, 'Interfaces', 'interfaces'),
    (7, 8, 'The final Keyword', 'the-final-keyword'),

    -- MODULE 8
    (8, 1, 'Understanding Programming Errors', 'understanding-programming-errors'),
    (8, 2, 'Introduction to Exceptions', 'introduction-to-exceptions'),
    (8, 3, 'try and catch Blocks', 'try-and-catch-blocks'),
    (8, 4, 'Multiple catch Blocks', 'multiple-catch-blocks'),
    (8, 5, 'The finally Block', 'the-finally-block'),
    (8, 6, 'throw and throws', 'throw-and-throws'),
    (8, 7, 'Creating Custom Exceptions', 'creating-custom-exceptions'),
    (8, 8, 'Debugging Java Programs', 'debugging-java-programs'),

    -- MODULE 9
    (9, 1, 'Introduction to Collections', 'introduction-to-collections'),
    (9, 2, 'Working with ArrayList', 'working-with-arraylist'),
    (9, 3, 'Working with LinkedList', 'working-with-linkedlist'),
    (9, 4, 'Working with HashSet', 'working-with-hashset'),
    (9, 5, 'Working with HashMap', 'working-with-hashmap'),
    (9, 6, 'Introduction to File Handling', 'introduction-to-file-handling'),
    (9, 7, 'Reading Files', 'reading-files'),
    (9, 8, 'Writing Files', 'writing-files'),
    (9, 9, 'Working with Java Packages', 'working-with-java-packages'),

    -- MODULE 10
    (10, 1, 'Understanding Project Requirements', 'understanding-project-requirements'),
    (10, 2, 'Planning the Application', 'planning-the-application'),
    (10, 3, 'Designing Classes and Objects', 'designing-classes-and-objects'),
    (10, 4, 'Implementing Application Features', 'implementing-application-features'),
    (10, 5, 'Working with User Input', 'project-working-with-user-input'),
    (10, 6, 'Handling Errors', 'project-handling-errors'),
    (10, 7, 'Storing and Retrieving Data', 'storing-and-retrieving-data'),
    (10, 8, 'Testing and Debugging', 'project-testing-and-debugging'),
    (10, 9, 'Completing and Presenting the Application', 'completing-and-presenting-the-application')
)

INSERT INTO public.lesson (
    module_id,
    lesson_number,
    title,
    slug,
    status
)
SELECT
    nm.module_id,
    ld.lesson_number,
    ld.title,
    ld.slug,
    'published'
FROM lesson_data ld
JOIN new_modules nm
    ON nm.module_number = ld.module_number
ORDER BY nm.module_number, ld.lesson_number;

COMMIT;




