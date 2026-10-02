import os
import csv
import uuid
from datetime import datetime
from django.conf import settings
from rest_framework.exceptions import APIException
from utils.constants import UITheme


def generate_excel_file(file_path, export_cols, raw_rows):
    """Create a styled workbook with readable, bounded column widths."""
    import openpyxl
    from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
    from openpyxl.utils import get_column_letter

    workbook = openpyxl.Workbook()
    worksheet = workbook.active
    worksheet.title = "Export Data"

    headers = [str(column).replace("_", " ").title() for column in export_cols]
    worksheet.append(headers)
    for row in raw_rows:
        worksheet.append([row.get(column, "") for column in export_cols])

    header_fill = PatternFill(fill_type="solid", fgColor="84C225")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    data_font = Font(name="Calibri", size=10)
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    data_alignment = Alignment(vertical="top", wrap_text=True)
    border_side = Side(style="thin", color="D9D9D9")
    cell_border = Border(
        left=border_side,
        right=border_side,
        top=border_side,
        bottom=border_side,
    )

    worksheet.row_dimensions[1].height = 30
    for cell in worksheet[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = header_alignment
        cell.border = cell_border

    for row in worksheet.iter_rows(min_row=2):
        worksheet.row_dimensions[row[0].row].height = 24
        for cell in row:
            cell.font = data_font
            cell.alignment = data_alignment
            cell.border = cell_border

    for column_cells in worksheet.columns:
        max_length = max(
            (len(str(cell.value or "")) for cell in column_cells),
            default=0,
        )
        column_letter = get_column_letter(column_cells[0].column)
        worksheet.column_dimensions[column_letter].width = min(
            max(max_length + 6, 18),
            60,
        )

    worksheet.freeze_panes = "A2"
    worksheet.auto_filter.ref = worksheet.dimensions
    workbook.save(file_path)


def generate_pdf_file(file_path, entity, export_cols, raw_rows):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

        doc = SimpleDocTemplate(file_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=14, leading=18, textColor=colors.HexColor(UITheme.PDF_HEADER_TITLE))
        th_style = ParagraphStyle('TH', parent=styles['Normal'], fontSize=7.5, leading=9.5, fontName='Helvetica-Bold', textColor=colors.white)
        td_style = ParagraphStyle('TD', parent=styles['Normal'], fontSize=7, leading=9)

        elements = []
        elements.append(Paragraph(f"{entity.replace('_', ' ').title()} Export Report", title_style))
        elements.append(Spacer(1, 10))

        # Limit columns for readable PDF layout
        display_cols = export_cols[:7] if len(export_cols) > 7 else export_cols

        table_data = [[Paragraph(str(c).replace('_', ' ').title(), th_style) for c in display_cols]]
        for r in raw_rows[:500]: # Cap PDF rows at 500 for performance
            row_cells = [Paragraph(str(r.get(k, '-')), td_style) for k in display_cols]
            table_data.append(row_cells)

        t = Table(table_data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(UITheme.PDF_TABLE_HEADER_BG)),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor(UITheme.PDF_TABLE_GRID)),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        doc.build(elements)
    except Exception as e:
        raise APIException(f"Unable to generate PDF export: {e}") from e


EXPORT_COLUMNS = {
    "leads": [
        "id", "full_name", "mobile_no", "assigned_to", "stage", "tag",
        "campaign", "source", "course_plan", "course", "next_followup",
        "amount", "pending_amount", "last_contacted",
        "last_conversation_outcome", "created",
    ],
    "pending_payments": [
        "s_no", "id", "payment_id", "name", "contact", "email",
        "assigned_to", "pipeline", "campaign", "course_plan", "course",
        "joining_date", "batch_timing", "amount_paid", "pending_amount",
        "status", "due_date", "next_followup", "last_conversation",
    ],
    "loss_approvals": [
        "s_no", "lead_id", "name", "contact", "email", "assigned_to",
        "assigned_to_id", "campaign_id", "campaign_name", "effort_summary",
        "total_calls", "loss_reason", "last_conversation_outcome",
        "last_contacted", "inquiry_date", "lead_age", "course",
        "lead_source", "approval_status",
    ],
    "performance": [
        "rank", "telecaller_id", "telecaller_name", "team_id", "team_name",
        "leads_assigned", "calls_made", "target_calls", "followups_done",
        "admissions", "target_admissions", "pending_followups",
        "performance_score", "rating_label", "special_badge",
        "conversion_rate", "followup_completion_rate", "avg_calling_duration",
    ],
}

ENTITY_ID_FIELDS = {
    "leads": "id",
    "pending_payments": "id",
    "loss_approvals": "lead_id",
    "performance": "telecaller_id",
}


def _fetch_export_rows(entity, user, filters):
    if entity == "leads":
        from .lead_services import fetch_all_leads_admin

        filters["page_size"] = "all"
        return fetch_all_leads_admin(user=user, **filters).get("leads", [])

    if entity == "pending_payments":
        from .payment_services import fetch_all_pending_payments_admin

        filters.pop("all_rows", None)
        filters["page"] = 1
        return fetch_all_pending_payments_admin(
            user=user,
            all_rows=True,
            **filters,
        ).get("leads", [])

    if entity == "loss_approvals":
        from .loss_lead_approval_services import fetch_loss_lead_approval_requests_admin

        filters["page_size"] = "all"
        return fetch_loss_lead_approval_requests_admin(
            user=user,
            **filters,
        ).get("data", {}).get("leads", [])

    if entity == "performance":
        from .performance_services import fetch_performance_overview_admin

        filters["page"] = 1
        filters["page_size"] = 1
        return fetch_performance_overview_admin(
            filters,
            user=user,
            all_rows=True,
        ).get("data", {}).get("performance_list", [])

    raise APIException(f"Unsupported export entity: {entity}")


def export_data_service(user, entity='leads', export_format='excel', selected_ids=None, columns=None, filters=None):
    try:
        if entity not in EXPORT_COLUMNS:
            raise APIException(f"Unsupported export entity: {entity}")

        if export_format not in {"excel", "csv", "pdf"}:
            raise APIException(f"Unsupported export format: {export_format}")

        selected_ids = selected_ids or []
        columns = columns or []
        filters = dict(filters or {})
        raw_rows = _fetch_export_rows(entity, user, filters)

        if selected_ids:
            id_field = ENTITY_ID_FIELDS[entity]
            selected_id_set = {int(selected_id) for selected_id in selected_ids}
            raw_rows = [
                row for row in raw_rows
                if row.get(id_field) is not None and int(row[id_field]) in selected_id_set
            ]

        if not raw_rows:
            return {"status": "success", "message": "No records found to export", "total": 0, "download_url": ""}

        available_columns = list(EXPORT_COLUMNS[entity])
        if columns:
            invalid_columns = [column for column in columns if column not in available_columns]
            if invalid_columns:
                raise APIException(f"Unknown export columns: {', '.join(invalid_columns)}")
            export_cols = list(dict.fromkeys(columns))
        else:
            export_cols = available_columns

        media_export_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
        os.makedirs(media_export_dir, exist_ok=True)

        filename = f"{entity}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"

        if export_format == 'csv':
            file_name = f"{filename}.csv"
            file_path = os.path.join(media_export_dir, file_name)
            with open(file_path, mode='w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=export_cols)
                writer.writeheader()
                for r in raw_rows:
                    writer.writerow({k: r.get(k, '') for k in export_cols})

        elif export_format == 'pdf':
            file_name = f"{filename}.pdf"
            file_path = os.path.join(media_export_dir, file_name)
            generate_pdf_file(file_path, entity, export_cols, raw_rows)

        else: # Default Excel
            file_name = f"{filename}.xlsx"
            file_path = os.path.join(media_export_dir, file_name)
            generate_excel_file(file_path, export_cols, raw_rows)

        download_url = f"{settings.MEDIA_URL}exports/{file_name}"

        return {
            "status": "success",
            "message": f"Successfully exported {len(raw_rows)} records in {export_format.upper()} format!",
            "export_format": export_format,
            "total_exported": len(raw_rows),
            "file_name": file_name,
            "download_url": download_url
        }

    except Exception as e:
        if isinstance(e, APIException):
            raise
        raise APIException(str(e)) from e
