import api from "@/shared/services/axios";

export const fetchAdminPendingPayments = (payload = {}) => {
    return api.post("/adm/fetch_all_pending_payments_admin", payload);
};

import { getSelectOptions } from "@/apps/admin/services/dropdownService";

export const fetchPendingPaymentFilterDropdowns = async () => {
  const [statuses, courseNames, coursePlans, users, amounts, courseTimes] = await Promise.all([
    getSelectOptions("L_PAYMENT_STATUSES"),
    getSelectOptions("L_COURSE_NAMES"),
    getSelectOptions("L_COURSE_PLANS"),
    getSelectOptions("L_TELECALLERS"),
    getSelectOptions("L_AMOUNT_STAGES"),
    getSelectOptions("L_COURSE_TIMES"),
  ]);

  let courses = courseNames.length > 0 ? courseNames : await getSelectOptions("L_COURSES").catch(() => []);
  let plans = coursePlans.length > 0 ? coursePlans : courses;

  return {
    data: {
      statuses,
      payment_stages: statuses,
      payment_stage: statuses,
      courses,
      course_names: courses,
      course_name: courses,
      course_plans: plans,
      course_plan: plans,
      plans,
      telecallers: users,
      assigned_to: users,
      pending_amounts: amounts,
      amount_stages: amounts,
      course_times: courseTimes,
      course_time: courseTimes,
      timings: courseTimes,
      course_timings: courseTimes,
    },
  };
};

export const exportAdminPendingPaymentsFile = (payload = {}) => {
    return api.post("/adm/export_pending_payments_admin", payload, {
        responseType: "blob"
    });
};

export const exportToCSV = (data, filename = "Pending_Payments.csv") => {
    if (!data || !data.length) return false;

    const headers = [
        "S.No",
        "Name",
        "Contact",
        "Assign To",
        "Pipeline",
        "Campaign",
        "Course Plan",
        "Course",
        "Joining Date",
        "Batch & Timing",
        "Amount Paid",
        "Pending Amount",
        "Status",
        "Next Follow up",
        "Last Conversation"
    ];

    const rows = data.map((item, index) => [
        item.s_no ?? (index + 1),
        `"${(item.name || item.full_name || "").replace(/"/g, '""')}"`,
        `"${(item.contact || item.mobile_no || "").replace(/"/g, '""')}"`,
        `"${(item.assigned_to || "").replace(/"/g, '""')}"`,
        `"${(item.pipeline || "").replace(/"/g, '""')}"`,
        `"${(item.campaign || "").replace(/"/g, '""')}"`,
        `"${(item.course_plan || "").replace(/"/g, '""')}"`,
        `"${(item.course || item.course_name || "").replace(/"/g, '""')}"`,
        `"${(item.joining_date || item.enquiry_date || "").replace(/"/g, '""')}"`,
        `"${(item.batch_timing || item.course_timing || "").replace(/"/g, '""')}"`,
        item.amount_paid ?? 0,
        item.pending_amount ?? item.payment_amount ?? 0,
        `"${(item.status || item.due_status || "Active").replace(/"/g, '""')}"`,
        `"${(item.next_followup || item.next_follow_up || "").replace(/"/g, '""')}"`,
        `"${(item.last_conversation || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
};
