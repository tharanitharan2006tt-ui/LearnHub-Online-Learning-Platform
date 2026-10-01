# LearnHub – Code Documentation

Indha document repository-la irukkira source code-ai padichu, current implementation-ai explain pannudhu. Frontend folder repository-la `Frendend` nu spell pannirukku; commands-um paths-um adhe spelling use pannum.

## 1. Project overview

LearnHub is a course learning application. React frontend Django REST API-kku requests anuppum; Django MySQL database-la users, courses, lessons, enrollments, lesson progress, quizzes, attempts, certificates-ai store pannum. Login JWT token use pannudhu. Chatbot Gemini API-ai backend moolama use pannudhu.

```text
Browser (React/Vite) -- HTTP + JWT --> Django REST API -- ORM --> MySQL
                                                |
                                                +-- Gemini API (chatbot)
```

## 2. Folder structure

### Frontend: `Frendend/learnhub-react/`

- `src/main.jsx` – React root create panni `HashRouter`-kulla app mount pannudhu. Hash routing GitHub Pages static hosting-kku suitable.
- `src/App.jsx` – Navbar, routes, footer, chatbot-oda app shell. Backend `401` event vandhaal login page-kku redirect pannum. Quiz page-la chatbot hide pannum.
- `src/routes/AppRoutes.jsx` – URL paths-ai page components-oda connect pannum.
- `src/routes/ProtectedRoute.jsx`, `PublicRoute.jsx` – login-required pages-um public auth pages-um gate pannum.
- `src/context/AuthContext.jsx` – logged-in state, user info, login/logout actions-ai app-wide share pannum. Token/user details `localStorage`-la irukkum.
- `src/services/api.js` – API base URL, bearer token header, request/response parsing, common error handling, endpoint helper functions.
- `src/pages/` – Home, courses, details, login/register, dashboard, profile, My Learning, lesson, quiz, certificate screens.
- `src/components/` – Navbar, footer, course card, buttons, chatbot pondra reusable UI.
- `src/*.css`, page/component CSS – app styling.
- `.env.example` – frontend API base URL example.

### Backend: `Backend/`

- `learnhub_backend/settings.py` – Django apps, middleware, MySQL, CORS, JWT authentication settings.
- `learnhub_backend/urls.py` – `/api/...` app routes-oda root mapping.
- Ovvoru feature app-layum `models.py` database structures, `serializers.py` JSON conversion/validation, `views.py` request behavior, `urls.py` routes define pannum.
- `migrations/` – schema changes-um initial course/lesson/quiz content seeding-um.
- `tests.py` files – tests irukkira idangal; indha documentation task-la tests execute pannala.

## 3. Browser-la irundhu database vara request flow

1. Page/component `src/services/api.js`-la irukkira helper-ai call pannum; example `api.getCourses()`.
2. `request()` API URL build pannum, JSON header set pannum, token irundhaal `Authorization: Bearer <token>` add pannum.
3. Django `learnhub_backend/urls.py` request-ai feature URL-kku route pannum; feature `urls.py` adhai view-kku route pannum.
4. View permission check panni serializer/model moolama database-ai read/write pannum.
5. Response JSON frontend-kku thirumbi varum; component state update aagi UI render aagum.
6. `401` vandhaal API helper local auth data clear panni `auth:error` event dispatch pannum. `AuthContext` state reset pannum; `App.jsx` login page-kku navigate pannum.

## 4. Main user journey

### A. Home and course catalog

- `Home.jsx` load aagumbodhu `api.getCourses()` call panni first three courses kaattum. Loading/error/empty cases-kku UI states irukku.
- `Courses.jsx` catalog-a kaattum; API `?search=` query support backend `SearchFilter`-la irukku.
- `CourseDetails.jsx` route slug use panni `/courses/<slug>/` fetch pannum; intro, topics, duration, price, image display pannum.
- Enroll click unauthenticated user-ai login-kku anuppum. Authenticated user-kku enrollment create panni My Learning-kku navigate pannum.

Backend `courses` app public-a course read/search allow pannum; course create/update/delete admin user-kku mattum. Course `slug` detail lookup key.

### B. Register, login, profile

- Register endpoint email duplicate check pannum; Django User create panni associated `UserProfile`-la full name save pannum. Password `create_user()` use pannuvadhaal Django hashing apply aagum.
- Login email/password-ai authenticate panni JWT access/refresh tokens-um user info-um return pannum.
- Frontend AuthContext access token-ai local storage-la vaikkum. Protected routes `isLoggedIn` state-ai base panni page access decide pannum.
- Profile API logged-in user-oda profile retrieve/update pannum. Email change pannumbodhu duplicate email/username check aagum.

### C. Enrollment and My Learning

- `POST /api/enrollments/` request body `{ "course": <course_id> }`.
- Backend course irukka-nu check panni `(user, course)` pair-ku enrollment create pannum. Already enrolled-na existing record return pannum.
- `GET /api/enrollments/my-learning/` current user's enrollments mattum return pannum.
- Enrollment model-la user, course, enrolled time, completed flag irukku; oru user/course pair unique.

### D. Lesson and progress

- Lesson route `/lesson/:courseSlug/:lessonId` protected. Lesson page course lessons-um current user progress-um fetch pannum.
- Video URL YouTube watch/share/embed URL-na embed URL convert pannum; `.mp4`, `.webm`, `.ogv`, `.ogg` file-na native video player use pannum. Other/invalid URL-na unavailable message.
- `Mark as Completed` `POST /api/progress/` call panni lesson completion save pannum. Backend `update_or_create(user, lesson)` use pannuvadhaal same lesson-ai meendum complete pannina duplicate record varadhu.
- `GET /api/progress/course/<course_id>/` completed lessons / total lessons vachu percentage calculate pannum. Lesson count zero-na percentage zero.
- Lesson serializer response-la related quiz irundhaal `quiz_id` include aagum; completion aanaal quiz link kaattalaam.

### E. Quiz

- Quiz page `GET /api/quizzes/<id>/` call pannum. Nested questions/choices serialize aagum. Choice serializer `is_correct` field-ai expose pannaadhu.
- Frontend ella questions-kum answer select panniyirukkanum-nu check panni `POST /api/quizzes/<id>/submit/`-kku `{ "answers": { "<question_id>": <choice_id> } }` anuppum.
- Backend correct answer-ai database-la irundhu compare panni score percentage, pass status calculate pannum. Passing threshold quiz `passing_score` (seeded final quiz-kku 60) moolama decide aagum.
- Ovvoru submission-kum `QuizAttempt` record create aagum; response correct count, total count, score, pass status return pannum. Pass aana frontend certificate page link kaattum.

### F. Certificate

- `POST /api/certificates/generate/<course_id>/` authenticated request.
- Backend course lessons count-um user completed lessons count-um compare pannum. Lessons illa-na, all lessons complete aagala-na error return pannum.
- Completion complete aana unique `CERT-...` identifier create pannum. Same user/course certificate already irundhaal existing certificate thiruppi kodukkum.
- `GET /api/certificates/` current user's certificates list-ai return pannum.

### G. Chatbot

- Logged-in UI message-ai `POST /api/chatbot/`-kku anuppum.
- `chatbot/views.py` request serializer validation pannitu `chatbot/services.py`-ai call pannum.
- Service `GEMINI_API_KEY` environment variable eduthu Gemini model-kku request anuppum; configured first model transient failure/429/5xx/timeout-na next model try pannum. Missing key/service errors meaningful status/message-oda API-kku thirumbum.

## 5. Data model relationships

| Model | Relationship / purpose |
|---|---|
| Django `User` + `UserProfile` | Oru user-kku oru profile; profile full name store pannum. |
| `Course` | Catalog details: title, slug, description, image, topics, price, lesson count. |
| `Lesson` | Oru course-kku pala ordered lessons; title, description, video URL, duration. Course/order unique. |
| `Enrollment` | User-course join record; user/course pair unique. |
| `LessonProgress` | User-lesson completion; user/lesson pair unique. |
| `Quiz` | Oru lesson-kku one-to-one quiz. |
| `Question`, `Choice` | Quiz-kku pala questions; question-kku pala answer choices; correct flag backend-la mattum. |
| `QuizAttempt` | User-oda quiz score, pass status, submitted time. |
| `Certificate` | User/course certificate; unique certificate ID; user/course pair unique. |

## 6. API endpoint reference

Base URL default `http://127.0.0.1:8000/api`.

| Method | Endpoint | Auth | Use |
|---|---|---|---|
| POST | `/users/register/` | Public | Create account/profile |
| POST | `/users/login/` | Public | Validate credentials, issue JWT |
| GET/PATCH | `/users/profile/` | Required | Read/update own profile |
| GET | `/courses/` | Public | List/search courses |
| GET | `/courses/<slug>/` | Public | Course details |
| POST | `/courses/`, write detail methods | Admin | Manage catalog |
| POST | `/enrollments/` | Required | Enroll current user |
| GET | `/enrollments/my-learning/` | Required | List own enrollments |
| GET | `/lessons/course/<slug>/` | Required | List course lessons |
| GET/POST | `/progress/` | Required | List/save own lesson progress |
| GET | `/progress/course/<id>/` | Required | Get course completion percentage |
| GET | `/quizzes/<id>/` | Required | Read quiz/questions/choices |
| POST | `/quizzes/<id>/submit/` | Required | Submit answers and save attempt |
| GET | `/certificates/` | Required | List own certificates |
| POST | `/certificates/generate/<course_id>/` | Required | Generate/retrieve completed-course certificate |
| POST | `/chatbot/` | Required | Send chat message to Gemini service |

`Required` endpoints use JWT authentication. Global permission is `AllowAny`; individual views set `IsAuthenticated` where needed. Course write endpoints separately require admin.

## 7. Seeded learning content

- `courses/migrations/0003_seed_course_lessons_and_images.py`: Python, Java, JavaScript, C, C++, React courses irundhaal, ovvoru course-kku image URL-um five ordered lesson records-um set/create pannum.
- `quizzes/migrations/0003_seed_final_course_quizzes.py`: ovvoru course-oda last lesson-kku final quiz create pannum; five questions with four choices each; passing score 60.
- Migrations `update_or_create` / `get_or_create` use pannugindrana; deployment/database-la migrate aana piragu seeded content available aagum.

## 8. Local setup

### Backend

1. MySQL server run aagattum; `learnhub_db` database create pannavum.
2. `Backend/requirements.txt` dependencies install pannavum.
3. Repository root `.env.example`-ai `.env`-a copy panni DB values, `DJANGO_SECRET_KEY`, thevai-na `GEMINI_API_KEY` set pannavum. `.env` secrets-ai source control-la commit panna koodadhu.
4. `Backend` directory-la irundhu `python manage.py migrate` run pannavum; optional admin user-kku `python manage.py createsuperuser`.
5. `python manage.py runserver` start pannavum. API default-a `http://127.0.0.1:8000/api`.

### Frontend

1. `Frendend/learnhub-react` directory-la `npm install` run pannavum.
2. `.env.example`-ai `.env`-a copy pannalaam. Local default `VITE_API_BASE_URL` `http://127.0.0.1:8000/api`.
3. `npm run dev` start pannina Vite frontend local development server-la open aagum.

Backend CORS config-la localhost:5173 matrum GitHub Pages origin allow pannirukku. Production API URL-ai frontend build time-la `VITE_API_BASE_URL` moolama set pannanum.

## 9. Deployment configuration

`.github/workflows/deploy.yml` `main` branch push / manual dispatch-la frontend build pannum: Node 20 setup → `npm ci` → `npm run build` → GitHub Pages artifact upload/deploy. Indha workflow React static site-ai deploy pannudhu; Django backend/MySQL hosting-ai idhu deploy pannaadhu.

## 10. Configuration notes visible in source

- `Backend/learnhub_backend/settings.py`-la `DEBUG = True`; production deployment-kku mun `DEBUG`, secret key, allowed hosts, database credentials, CORS origins-ai environment-specific-a configure seyyanum.
- MySQL defaults local convenience values-a irukku; production-la env vars use pannanum.
- Course images/hero images external Unsplash URLs; video playback lesson record-la irukkira URL depend pannum.
- Frontend quiz submit success-kku appuram `pythonQuizScore` localStorage-la set pannudhu; API-yin quiz attempt record dhaan persisted quiz result.
- Seed quiz migration-la final lesson quiz seed aagudhu; frontend individual lesson response-la quiz link kaattum. Quiz content/data database-la irukkiradhu migration apply aanadhai poruthadhu.

## 11. Source file quick index

| Feature | Frontend | Backend |
|---|---|---|
| App/bootstrap/navigation | `src/main.jsx`, `src/App.jsx`, `src/routes/` | `learnhub_backend/urls.py` |
| Authentication/profile | `src/context/AuthContext.jsx`, `src/pages/Login.jsx`, `Register.jsx`, `Profile.jsx` | `users/models.py`, `serializers.py`, `views.py`, `urls.py` |
| Course catalog | `src/pages/Home.jsx`, `Courses.jsx`, `CourseDetails.jsx`, `src/components/CourseCard.jsx` | `courses/models.py`, `serializers.py`, `views.py`, `urls.py` |
| Enrollment | `src/pages/CourseDetails.jsx`, `MyLearning.jsx` | `enrollments/` |
| Lessons/progress | `src/pages/Lesson.jsx`, `MyLearning.jsx` | `lessons/`, `progress/` |
| Quiz | `src/pages/Quiz.jsx` | `quizzes/` |
| Certificate | `src/pages/Certificate.jsx` | `certificates/` |
| Chatbot | `src/components/Chatbot.jsx` | `chatbot/views.py`, `services.py`, `serializers.py` |
| Request handling | `src/services/api.js` | Django REST Framework views/serializers |
