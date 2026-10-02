import api from "@/shared/services/axios";

const dropdownCache = new Map();

export const getDropdownOptions = async (data) => {
  const category = String(data?.dropdown_category || "").toLowerCase();
  const filterId = String(data?.filter_id || "");
  const courseNameId = String(data?.course_name_id || "");
  const cacheKey = `${category}_${filterId}_${courseNameId}`;

  if (dropdownCache.has(cacheKey)) {
    return dropdownCache.get(cacheKey);
  }

  if (category === "course_time" || category === "course_timing" || category === "l_course_times" || category === "course_times") {
    try {
      const res = await api.post("/adm/get_select_options", { field: "L_COURSE_TIMES" });
      if (res?.data?.data || res?.data) {
        dropdownCache.set(cacheKey, res);
        return res;
      }
    } catch (e) {
      // Fallback below
    }
  }

  const response = await api.post(
    "/telecalling/get_selected_option",
    data
  );
  if (response?.data) {
    dropdownCache.set(cacheKey, response);
  }
  return response;
};


