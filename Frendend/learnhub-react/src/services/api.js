const API_BASE_URL = "http://127.0.0.1:8000/api";

const getStoredToken = () => localStorage.getItem("access_token");

export const clearAuthSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("learnhubLoggedIn");
  localStorage.removeItem("learnhubUser");
};

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export class ApiError extends Error {
  constructor(message, { status, fieldErrors = {} } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const flattenErrorValue = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap(flattenErrorValue);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenErrorValue);
  }

  return typeof value === "string" ? [value] : [];
};

const getApiError = (data, status) => {
  const fieldErrors = {};
  const generalMessages = [];

  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      const messages = flattenErrorValue(value);
      if (["detail", "message", "error", "non_field_errors"].includes(key)) {
        generalMessages.push(...messages);
      } else if (messages.length > 0) {
        fieldErrors[key] = messages.join(" ");
      }
    }
  } else if (typeof data === "string") {
    generalMessages.push(data);
  }

  const message =
    generalMessages.join(" ") ||
    (Object.keys(fieldErrors).length > 0
      ? "Please correct the highlighted fields."
      : "Request failed. Please try again.");

  return new ApiError(message, { status, fieldErrors });
};

async function request(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, ...rest } = options;
  const token = getStoredToken();
  const requestHeaders = new Headers(headers);

  if (!(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
      ...rest,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Cannot connect to LearnHub. Check that the backend server is running and try again."
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:error", { detail: "Your session has expired. Please log in again." }));
      }
    }

    throw getApiError(data, response.status);
  }

  return data;
}

export const api = {
  registerUser: (payload) => request("/users/register/", { method: "POST", body: payload }),
  loginUser: (payload) => request("/users/login/", { method: "POST", body: payload }),
  getProfile: () => request("/users/profile/"),
  updateProfile: (payload) => request("/users/profile/", { method: "PATCH", body: payload }),
  getCourses: (search = "") => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/courses/${query}`);
  },
  getCourseBySlug: (slug) => request(`/courses/${slug}/`),
  enrollCourse: (courseId) => request("/enrollments/", { method: "POST", body: { course: courseId } }),
  getMyLearning: () => request("/enrollments/my-learning/"),
  getLessonsForCourse: (courseSlug) => request(`/lessons/course/${courseSlug}/`),
  saveLessonProgress: (lessonId, completed = true) =>
    request("/progress/", {
      method: "POST",
      body: { lesson: lessonId, completed },
    }),
  getLessonProgress: () => request("/progress/"),
  getCourseProgress: (courseId) => request(`/progress/course/${courseId}/`),
  getQuiz: (quizId) => request(`/quizzes/${quizId}/`),
  submitQuiz: (quizId, answers) =>
    request(`/quizzes/${quizId}/submit/`, {
      method: "POST",
      body: { answers },
    }),
  getCertificates: () => request("/certificates/"),
  generateCertificate: (courseId) =>
    request(`/certificates/generate/${courseId}/`, {
      method: "POST",
    }),
};

export default API_BASE_URL;