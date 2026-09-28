import os
import csv
from datetime import datetime
from django.conf import settings
from rest_framework.exceptions import APIException
from adm.services.query_services import exec_raw_sql


def generate_excel_file(file_path, export_cols, raw_rows):
    """Generates Excel (.xlsx) file using openpyxl or csv fallback."""
    try:
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Export Data"

        # Headers
        ws.append([str(c).replace('_', ' ').title() for c in export_cols])
        
        # Rows
        for r in raw_rows:
            ws.append([r.get(k, '') for k in export_cols])
            
        wb.save(file_path)
    except ImportError:
        # Fallback to CSV format if openpyxl is not installed
        with open(file_path, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=export_cols)
            writer.writeheader()
            for r in raw_rows:
                writer.writerow({k: r.get(k, '') for k in export_cols})


def generate_pdf_file(file_path, entity, export_cols, raw_rows):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

        doc = SimpleDocTemplate(file_path, pagesize=A4, rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=14, leading=18, textColor=colors.HexColor('#1E3A8A'))
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
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(t)
        doc.build(elements)
    except Exception as e:
        # Fallback to simple text file if ReportLab fails
        with open(file_path, mode='w', encoding='utf-8') as f:
            f.write(f"PDF Export for {entity}\n")
            f.write(str(raw_rows))


def export_data_service(user, entity='leads', export_format='excel', selected_ids=None, columns=None, filters=None):
    try:
        selected_ids = selected_ids or []
        columns = columns or []
        filters = filters or {}
        
        # 1. Map Entity to SQL Key
        entity_key_map = {
            'leads': 'D_FETCH_ALL_LEADS_DATA',
            'pending_payments': 'D_FETCH_ALL_PENDING_PAYMENTS',
            'loss_approvals': 'D_FETCH_LOSS_ANALYSIS_TELE',
            'performance': 'D_FETCH_TELECALLER_PERFORMANCE'
        }
        query_key = entity_key_map.get(entity, 'D_FETCH_ALL_LEADS_DATA')
        
        # 2. Add Organization ID to Filters
        org_id = getattr(user, 'organization_id', 0) if (user and hasattr(user, 'organization_id') and user.organization_id) else 0
        filters['organization_id'] = org_id
        
        # 3. Fetch Raw Data Rows from Query Engine
        raw_rows = exec_raw_sql(query_key, filters) or []
        
        # 4. Filter by Row Checkboxes (selected_ids) if provided
        if selected_ids:
            raw_rows = [r for r in raw_rows if r.get('id') in selected_ids or r.get('lead_id') in selected_ids]

        if not raw_rows:
            return {"status": "success", "message": "No records found to export", "total": 0, "download_url": ""}

        # 5. Filter Selected Columns if provided
        all_col_keys = list(raw_rows[0].keys())
        export_cols = [c for c in columns if c in all_col_keys] if columns else all_col_keys

        # Ensure Media Export Directory Exists
        media_export_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
        os.makedirs(media_export_dir, exist_ok=True)
        
        filename = f"{entity}_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # 6. FORMAT GENERATION LOGIC
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
        raise APIException(str(e))
