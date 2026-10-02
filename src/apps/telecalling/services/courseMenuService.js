import api from "@/shared/services/axios";

export const getCourseMenu = async () => {
  try {
    const [namesRes, plansRes, timesRes] = await Promise.all([
      api.post("/adm/get_select_options", { field: "L_COURSE_NAMES" }).catch(() => null),
      api.post("/adm/get_select_options", { field: "L_COURSE_PLANS" }).catch(() => null),
      api.post("/adm/get_select_options", { field: "L_COURSE_TIMES" }).catch(() => null),
    ]);

    const courseNames = namesRes?.data?.data || namesRes?.data || [];
    const coursePlans = plansRes?.data?.data || plansRes?.data || [];
    const courseTimes = timesRes?.data?.data || timesRes?.data || [];

    if (courseNames.length > 0 || coursePlans.length > 0 || courseTimes.length > 0) {
      return {
        data: {
          status: true,
          data: {
            course_names: courseNames,
            course_plans: coursePlans,
            course_times: courseTimes,
            courses: courseNames,
            plans: coursePlans,
            timings: courseTimes,
          },
        },
      };
    }
    return api.post("/telecalling/get_select_option", {
      fields: "L_FETCH_COURSE_NAME_AND_COURSE_PLAN",
    });
  } catch (err) {
    return api.post("/telecalling/get_select_option", {
      fields: "L_FETCH_COURSE_NAME_AND_COURSE_PLAN",
    });
  }
};