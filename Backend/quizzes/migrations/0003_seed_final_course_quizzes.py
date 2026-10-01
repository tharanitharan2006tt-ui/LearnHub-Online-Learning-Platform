from django.db import migrations


COURSE_QUIZZES = {
    "python-programming": [
        (
            "Which Python keyword is used to define a function?",
            [("func", False), ("def", True), ("function", False), ("lambda", False)],
        ),
        (
            "What is the result of len([4, 8, 12])?",
            [("2", False), ("3", True), ("4", False), ("12", False)],
        ),
        (
            "Which collection stores key-value pairs?",
            [("tuple", False), ("set", False), ("dictionary", True), ("string", False)],
        ),
        (
            "Which statement repeats a block for each item in a sequence?",
            [("for", True), ("case", False), ("define", False), ("switch", False)],
        ),
        (
            "What does a function return when it has no return statement?",
            [("0", False), ("False", False), ("None", True), ("An empty string", False)],
        ),
    ],
    "java-programming": [
        (
            "Which method is the standard entry point of a Java application?",
            [("start()", False), ("main()", True), ("run()", False), ("init()", False)],
        ),
        (
            "Which keyword creates a new object in Java?",
            [("class", False), ("this", False), ("new", True), ("make", False)],
        ),
        (
            "Which type stores a whole number such as 42?",
            [("int", True), ("boolean", False), ("char", False), ("void", False)],
        ),
        (
            "Which collection is designed to store an ordered resizable list?",
            [("HashMap", False), ("ArrayList", True), ("HashSet", False), ("TreeMap", False)],
        ),
        (
            "Which OOP concept lets a subclass reuse behavior from a parent class?",
            [("Compilation", False), ("Inheritance", True), ("Casting", False), ("Iteration", False)],
        ),
    ],
    "javascript": [
        (
            "Which keyword declares a block-scoped variable that can be reassigned?",
            [("var", False), ("let", True), ("const", False), ("static", False)],
        ),
        (
            "Which method selects an element using a CSS selector?",
            [("document.querySelector()", True), ("document.createSelector()", False), ("window.find()", False), ("element.selectAll()", False)],
        ),
        (
            "What does an async function return?",
            [("A Promise", True), ("A callback only", False), ("A DOM node", False), ("A module", False)],
        ),
        (
            "Which array method creates a new array by transforming each item?",
            [("filter()", False), ("map()", True), ("push()", False), ("sort()", False)],
        ),
        (
            "Which keyword prevents reassignment of a variable binding?",
            [("let", False), ("var", False), ("const", True), ("static", False)],
        ),
    ],
    "c-programming": [
        (
            "Which function is the usual entry point of a C program?",
            [("start()", False), ("main()", True), ("init()", False), ("run()", False)],
        ),
        (
            "Which format specifier is commonly used to print an int with printf?",
            [("%s", False), ("%c", False), ("%d", True), ("%f", False)],
        ),
        (
            "Which operator obtains the address of a variable?",
            [("*", False), ("&", True), ("%", False), ("->", False)],
        ),
        (
            "Which loop checks its condition before each iteration?",
            [("do-while", False), ("while", True), ("case", False), ("goto", False)],
        ),
        (
            "What is the index of the first element in a C array?",
            [("-1", False), ("0", True), ("1", False), ("It depends on the array", False)],
        ),
    ],
    "cpp-programming": [
        (
            "Which access specifier makes class members available to all callers?",
            [("private", False), ("protected", False), ("public", True), ("internal", False)],
        ),
        (
            "Which feature lets a derived class provide its own implementation of a virtual method?",
            [("Overriding", True), ("Tokenizing", False), ("Casting", False), ("Linking", False)],
        ),
        (
            "Which standard library container stores elements in a resizable sequence?",
            [("std::vector", True), ("std::mutex", False), ("std::pair", False), ("std::exception", False)],
        ),
        (
            "Which symbol is used to access a member through an object pointer?",
            [(".", False), ("::", False), ("->", True), ("&", False)],
        ),
        (
            "What is the main purpose of a constructor?",
            [("Destroy an object", False), ("Initialize an object", True), ("Include a header", False), ("Catch an exception", False)],
        ),
    ],
    "react-development": [
        (
            "What is a React component commonly used to describe?",
            [("A reusable part of the user interface", True), ("A database table", False), ("A network protocol", False), ("A CSS compiler", False)],
        ),
        (
            "Which hook is used to add local state to a function component?",
            [("useRoute()", False), ("useState()", True), ("useClass()", False), ("useMarkup()", False)],
        ),
        (
            "What are props primarily used for?",
            [("Passing data to a component", True), ("Writing database queries", False), ("Replacing CSS", False), ("Starting a server", False)],
        ),
        (
            "Why should a mapped list of React elements have a stable key?",
            [("To help React identify items between renders", True), ("To encrypt the list", False), ("To sort the list alphabetically", False), ("To make every item clickable", False)],
        ),
        (
            "Which hook is intended for synchronizing a component with an external system?",
            [("useEffect()", True), ("useMarkup()", False), ("useStyle()", False), ("useClass()", False)],
        ),
    ],
}


def seed_final_course_quizzes(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    Lesson = apps.get_model("lessons", "Lesson")
    Quiz = apps.get_model("quizzes", "Quiz")
    Question = apps.get_model("quizzes", "Question")
    Choice = apps.get_model("quizzes", "Choice")

    for course_slug, questions_data in COURSE_QUIZZES.items():
        try:
            course = Course.objects.get(slug=course_slug)
        except Course.DoesNotExist:
            continue

        final_lesson = Lesson.objects.filter(course_id=course.pk).order_by("-order").first()
        if final_lesson is None:
            continue

        quiz, _ = Quiz.objects.get_or_create(
            lesson_id=final_lesson.pk,
            defaults={
                "title": f"{course.title} Final Quiz",
                "passing_score": 60,
            },
        )

        for question_order, (question_text, choices_data) in enumerate(questions_data, start=1):
            question, _ = Question.objects.get_or_create(
                quiz_id=quiz.pk,
                order=question_order,
                defaults={"question_text": question_text},
            )

            for choice_text, is_correct in choices_data:
                choice, _ = Choice.objects.get_or_create(
                    question_id=question.pk,
                    choice_text=choice_text,
                    defaults={"is_correct": is_correct},
                )
                if choice.is_correct != is_correct:
                    choice.is_correct = is_correct
                    choice.save(update_fields=["is_correct"])


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0003_seed_course_lessons_and_images"),
        ("quizzes", "0002_quizattempt"),
    ]

    operations = [
        migrations.RunPython(seed_final_course_quizzes, migrations.RunPython.noop),
    ]
