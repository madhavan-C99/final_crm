import api from "@/shared/services/axios";

/**
 * Convert base64 data URI to Blob
 */
function dataURItoBlob(dataURI) {
  if (!dataURI || typeof dataURI !== "string" || !dataURI.startsWith("data:")) return null;
  try {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    return null;
  }
}

/**
 * Helper to build FormData matching backend ImageField requirements
 */
const buildOrgFormData = (data = {}) => {
  const formData = new FormData();

  // Handle binary logo file attachment
  if (data.logoFile instanceof File) {
    formData.append("logo", data.logoFile, data.logoFile.name);
  } else if (typeof data.logo === "string" && data.logo.startsWith("data:")) {
    const blob = dataURItoBlob(data.logo);
    if (blob) {
      const ext = blob.type.split("/")[1] || "png";
      formData.append("logo", blob, `org_logo.${ext}`);
    }
  }
  // Note: Existing URL strings (e.g. http://... or /media/...) are not appended as logo
  // to avoid Django ImageField rejecting string text as non-file.

  const appendIfPresent = (key, val) => {
    if (val !== undefined && val !== null && val !== "") {
      formData.append(key, String(val));
    }
  };

  appendIfPresent("org_name", data.orgName || data.org_name);
  appendIfPresent("display_name", data.displayName || data.display_name);
  appendIfPresent("industry_type", data.industryType || data.industry_type);
  appendIfPresent("company_website", data.companyWebsite || data.company_website);
  appendIfPresent("company_description", data.companyDesc || data.company_description);
  appendIfPresent("address_line1", data.addressLine1 || data.address_line1);
  appendIfPresent("address_line2", data.addressLine2 || data.address_line2);
  appendIfPresent("city", data.city);
  appendIfPresent("state", data.stateVal || data.state);
  appendIfPresent("country", data.countryVal || data.country || "India");
  appendIfPresent("pincode", data.pincode);
  appendIfPresent("official_email", data.officialEmail || data.official_email);
  appendIfPresent("official_contact", data.officialContact || data.official_contact);
  appendIfPresent("gst_in", data.gstIn || data.gst_in);
  appendIfPresent("company_pan", data.companyPan || data.company_pan);
  appendIfPresent("date_format", data.dateFormat || data.date_format || "DD/MM/YYYY");
  appendIfPresent("time_format", data.timeFormat || data.time_format || "24hrs");

  if (data.id) {
    formData.append("id", String(data.id));
  }

  return formData;
};

/**
 * Get Organization Profile
 * Endpoint: GET /adm/get_organization_profile_admin
 */
export const getOrganizationProfileAdmin = async () => {
  try {
    return await api.get("/adm/get_organization_profile_admin");
  } catch (err) {
    if (err?.response?.status === 405 || err?.response?.status === 404) {
      return await api.post("/adm/get_organization_profile_admin");
    }
    throw err;
  }
};

/**
 * Create Organization Profile
 * Endpoint: POST /adm/create_organization_profile_admin
 */
export const createOrganizationProfileAdmin = async (data) => {
  const formData = buildOrgFormData(data);
  return await api.post("/adm/create_organization_profile_admin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Edit / Update Organization Profile
 * Endpoint: POST /adm/edit_organization_profile_admin
 */
export const editOrganizationProfileAdmin = async (data) => {
  const formData = buildOrgFormData(data);
  return await api.post("/adm/edit_organization_profile_admin", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
