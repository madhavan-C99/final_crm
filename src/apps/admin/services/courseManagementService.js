import api from "@/shared/services/axios";

// ----------------------------------------------------------------------
// Course APIs (1 - 5)
// ----------------------------------------------------------------------

// API 1: Fetch Courses Sidebar
export const fetchCoursesSidebarAdmin = async (search) => {
  return api.post("/adm/fetch_courses_sidebar_admin", { search });
};

// API 2: Fetch Course Details
export const fetchCourseDetailsAdmin = async (course_id) => {
  return api.post("/adm/fetch_course_details_admin", { course_id });
};

// API 3: Create Course
export const createCourseAdmin = async (data) => {
  return api.post("/adm/create_courses", {
    name: data.name,
    status: data.status,
  });
};

// API 4: Edit Course
export const editCourseAdmin = async (data) => {
  return api.post("/adm/edit_courses", {
    course_id: data.course_id,
    name: data.name,
    status: data.status,
  });
};

// API 5: Delete Course
export const deleteCourseAdmin = async (course_id) => {
  return api.post("/adm/delete_course_admin", { course_id });
};

// ----------------------------------------------------------------------
// Plan / Pricing APIs (6 - 8)
// ----------------------------------------------------------------------

// API 6: Create Course Plan
export const createCoursePlanAdmin = async (data) => {
  return api.post("/adm/create_course_plan_admin", {
    course_id: data.course_id,
    name: data.name,
    price: data.price,
    duration: data.duration,
    hours_per_day: data.hours_per_day,
  });
};

// API 7: Edit Plan
export const editPlanAdmin = async (data) => {
  return api.post("/adm/edit_plans", {
    plan_id: data.plan_id,
    name: data.name,
    price: data.price,
    duration: data.duration,
    hours_per_day: data.hours_per_day,
  });
};

// API 8: Delete Course Plan
export const deleteCoursePlanAdmin = async (plan_id, course_id) => {
  return api.post("/adm/delete_course_plan_admin", {
    plan_id,
    course_id,
  });
};

// ----------------------------------------------------------------------
// Batch / Timing APIs (9 - 11)
// ----------------------------------------------------------------------

// API 9: Create Batch
export const createBatchAdmin = async (data) => {
  return api.post("/adm/create_batches", {
    course_id: data.course_id,
    plan: data.plan,
    name: data.name,
    time: data.time,
    trainer: data.trainer,
    total_seats: data.total_seats,
    start_date: data.start_date,
    closing_date: data.closing_date,
  });
};

// API 10: Edit Course Batch
export const editCourseBatchAdmin = async (data) => {
  return api.post("/adm/edit_course_batch_admin", {
    batch_id: data.batch_id,
    name: data.name,
    plan: data.plan,
    time: data.time,
    trainer: data.trainer,
    total_seats: data.total_seats,
    start_date: data.start_date,
    closing_date: data.closing_date,
  });
};

// API 11: Delete Course Batch
export const deleteCourseBatchAdmin = async (batch_id) => {
  return api.post("/adm/delete_course_batch_admin", { batch_id });
};
