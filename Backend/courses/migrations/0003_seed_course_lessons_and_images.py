from django.db import migrations


COURSE_CONTENT = {
    "python-programming": {
        "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
        "lessons": [
            ("Python Fundamentals", "Understand Python syntax, how programs run, and how to write clear first programs."),
            ("Variables and Data Types", "Work with strings, numbers, booleans, lists, and dictionaries."),
            ("Conditionals and Loops", "Control program flow with if/else statements, for loops, and while loops."),
            ("Functions and Modules", "Create reusable functions and organize code into modules."),
            ("Build a Python Project", "Combine core Python concepts to plan, build, and debug a small project."),
        ],
    },
    "java-programming": {
        "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        "lessons": [
            ("Java Setup and Syntax", "Set up a Java development environment and write your first program."),
            ("Variables, Types, and Operators", "Use Java primitive types, variables, and common operators."),
            ("Control Flow in Java", "Build program logic with conditionals, loops, and switch statements."),
            ("Object-Oriented Programming", "Model a problem with classes, objects, methods, and encapsulation."),
            ("Collections and a Java Project", "Use Java collections to organize data in a small application."),
        ],
    },
    "javascript": {
        "image_url": "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=1200&q=80",
        "lessons": [
            ("JavaScript Foundations", "Learn JavaScript syntax, values, variables, and execution flow."),
            ("Functions and Scope", "Write reusable functions and understand scope and closures."),
            ("Arrays and Objects", "Represent and transform data with arrays and objects."),
            ("DOM and Events", "Update page content and respond to user actions with browser events."),
            ("Asynchronous JavaScript", "Work with promises and async/await for asynchronous tasks."),
        ],
    },
    "c-programming": {
        "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        "lessons": [
            ("C Programming Essentials", "Understand the structure of a C program and compile a first example."),
            ("Variables and Operators", "Use C data types, variables, expressions, and operators."),
            ("Conditions and Loops", "Write branching logic and repeat tasks with loops."),
            ("Arrays and Functions", "Organize data in arrays and divide programs into functions."),
            ("Pointers and Memory", "Learn pointer basics and how addresses relate to program memory."),
        ],
    },
    "cpp-programming": {
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        "lessons": [
            ("C++ Overview", "Explore C++ syntax, development tools, and how a C++ program is built."),
            ("Classes and Objects", "Create classes and objects to represent program concepts."),
            ("Inheritance and Polymorphism", "Reuse and extend class behavior with core object-oriented techniques."),
            ("Templates and the Standard Library", "Use generic templates and common standard library containers."),
            ("Build a C++ Project", "Apply object-oriented design and standard library tools in a small project."),
        ],
    },
    "react-development": {
        "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
        "lessons": [
            ("React Fundamentals", "Build a user interface with React components and JSX."),
            ("Props and State", "Pass data through components and manage interactive state."),
            ("React Hooks", "Use state and effect hooks to manage component behavior."),
            ("Forms and Events", "Handle user input and browser events in React components."),
            ("Routing and App Structure", "Organize a multi-page React application with routes."),
        ],
    },
}


def seed_course_content(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    Lesson = apps.get_model("lessons", "Lesson")

    for slug, content in COURSE_CONTENT.items():
        try:
            course = Course.objects.get(slug=slug)
        except Course.DoesNotExist:
            continue

        course.image_url = content["image_url"]
        course.lessons = len(content["lessons"])
        course.save(update_fields=["image_url", "lessons"])

        for order, (title, description) in enumerate(content["lessons"], start=1):
            Lesson.objects.update_or_create(
                course_id=course.pk,
                order=order,
                defaults={
                    "title": title,
                    "description": description,
                    "duration": 12.0,
                },
            )


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0002_course_image_url"),
        ("lessons", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_course_content, migrations.RunPython.noop),
    ]
