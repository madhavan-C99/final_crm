import math
from rest_framework.exceptions import APIException
from adm.services.query_services import exec_raw_sql


def fetch_reports_service(search=None):
    qry_vars = {}
    if search and str(search).strip():
        qry_vars['search'] = str(search).strip()

    return exec_raw_sql('D_FETCH_ALL_REPORTS_CATALOG', qry_vars) or []


def execute_report_service(data: dict):
    """
    Unified Generic Report Execution Engine for ALL reports.
    Supports report_key, date_filter, from_date, to_date, search, user_id, page, limit,
    and returns full pagination metadata (total_records, total_pages, current_page, limit).
    """
    report_key = str(data.get("report_key") or "").strip().lower()
    if not report_key:
        raise APIException("report_key is required.")

    query_key = f"R_{report_key.upper()}"

    date_filter = str(data.get("date_filter") or "All").strip()
    from_date = str(data.get("from_date") or data.get("start_date") or "").strip()
    to_date = str(data.get("to_date") or data.get("end_date") or "").strip()
    search = str(data.get("search") or "").strip()

    raw_user_id = data.get("user_id")
    if raw_user_id is None or str(raw_user_id).strip().lower() in ["", "all", "none", "null", "0"]:
        user_id = "All"
    else:
        user_id = str(raw_user_id).strip()

    try:
        page = max(1, int(data.get("page") or 1))
    except (ValueError, TypeError):
        page = 1

    try:
        limit = max(1, int(data.get("limit") or 50))
    except (ValueError, TypeError):
        limit = 50

    qry_vars = {
        "date_filter": date_filter,
        "from_date": from_date,
        "to_date": to_date,
        "start_date": from_date,
        "end_date": to_date,
        "search": search,
        "user_id": user_id,
        "page": page,
        "limit": limit
    }

    rows = exec_raw_sql(query_key, qry_vars) or []
    total_records = int(rows[0]["full_count"]) if rows and "full_count" in rows[0] else len(rows)

    formatted_data = []
    for r in rows:
        row_dict = dict(r)
        row_dict.pop("full_count", None)

        # Format avg_seconds into "MMm SSs" if present
        if "avg_seconds" in row_dict:
            avg_sec = int(row_dict.pop("avg_seconds") or 0)
            mins = avg_sec // 60
            secs = avg_sec % 60
            row_dict["avgCallingTime"] = f"{mins:02d}m {secs:02d}s"

        formatted_data.append(row_dict)

    total_pages = math.ceil(total_records / limit) if total_records > 0 else 0

    return {
        "success": True,
        "message": f"Report '{report_key}' retrieved successfully",
        "total_records": total_records,
        "total_pages": total_pages,
        "current_page": page,
        "limit": limit,
        "data": formatted_data
    }
