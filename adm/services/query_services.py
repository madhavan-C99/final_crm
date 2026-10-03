from django.db import connection
from adm.models import CollectionQuery
from rest_framework.exceptions import APIException
from utils.constants import UITheme
from datetime import date, datetime
import re



ALIAS_MAP = {
    'course_list': 'L_COURSE_NAMES',
    'course_name_list': 'L_COURSE_NAMES',
    'course_names': 'L_COURSE_NAMES',
    'course_name': 'L_COURSE_NAMES',
    'course_plan_list': 'L_COURSE_PLANS',
    'course_plans': 'L_COURSE_PLANS',
    'course_plan': 'L_COURSE_PLANS',
    'course_time_list': 'L_COURSE_TIMES',
    'course_timing_list': 'L_COURSE_TIMES',
    'telecaller_list': 'L_TELECALLERS',
    'employee_list': 'L_TELECALLERS',
    'employees': 'L_TELECALLERS',
    'employee': 'L_TELECALLERS',
    'employees_list': 'L_TELECALLERS',
    'target_dropdowns': 'L_TELECALLERS',
    'campaign_manager_list': 'L_CAMPAIGN_MANAGERS',
    'lead_source_list': 'L_LEAD_SOURCES',
    'team_list': 'L_TEAMS',
    'team_lead_list': 'L_UNASSIGNED_TEAM_LEADS',
    'team_lead': 'L_UNASSIGNED_TEAM_LEADS',
    'team_leads': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_team_leads': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_team_lead': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_leads': 'L_UNASSIGNED_TEAM_LEADS',
    'reporting_to': 'L_REPORTING_MANAGERS',
    'category_list': 'L_CATEGORIES',
    'unassigned_tl': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_team_members': 'L_UNASSIGNED_TELECALLERS',
    'unassigned_telecallers': 'L_UNASSIGNED_TELECALLERS',
    'unassigned_users': 'L_REPORTING_MANAGERS',
    'unassigned_members': 'L_UNASSIGNED_TELECALLERS',
}

TENANT_SCOPED_TABLES = {
    'adm_user',
    'telecalling_lead',
    'adm_team',
    'adm_pipeline_category',
    'telecalling_lead_source',
    'telecalling_campaign_name',
    'telecalling_pipeline_stage',
    'telecalling_call_details',
    'telecalling_user_settings',
}


def exec_raw_sql(qry_key, qry_vars=dict()):
    try:
        real_key = ALIAS_MAP.get(qry_key, qry_key)
        if real_key == 'L_TELECALLERS':
            qry_vars = dict(qry_vars) if qry_vars else {}
            if qry_vars.get('campaign_id') in (None, ''):
                qry_vars['campaign_id'] = 0

        coll_qry = CollectionQuery.objects.filter(key=real_key).first()
        if coll_qry is not None:
            # print(f"Executing SQL Query for key: {real_key} with variables: {qry_vars}")  # Debugging line to log the query key and variables
            replaced_query = replace_query(coll_qry.query, qry_vars)
            # print(f"Executing SQL Query: {replaced_query}")  # Debugging line to log the executed query
            cursor = connection.cursor()
            # print(f"Executing SQL Query: {replaced_query}")  # Debugging line to log the executed query
            cursor.execute(replaced_query)
            res_vals = dict_fetch_all(cursor)
            cursor.close()
            if real_key in ['L_TELECALLERS', 'L_UNASSIGNED_TELECALLERS']:
                res_vals = enrich_telecallers_data(res_vals)
            return make_serializable(res_vals)
        else:
            # Fallback for dynamic dependent options (e.g. get_selected_option, course_time)
            try:
                from telecalling.services.lead_services import get_selected_option
                return get_selected_option(dropdown_category=qry_key, **qry_vars)
            except Exception:
                return []

    except Exception as e:
        raise APIException(e)


def dict_fetch_all(cursor):
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


def delete_exec_raw_sql(qry_key, qry_vars=dict()):
    try:
        coll_qry = CollectionQuery.objects.filter(key=qry_key).first()
        if coll_qry is not None:
            replaced_query = replace_query(coll_qry.query, qry_vars)
            cursor = connection.cursor()
            cursor.execute(replaced_query)
            cursor.close()
    except Exception as e:
        raise APIException(e)


def _get_table_alias_or_name(query, table_name):
    sql_keywords = {
        'where', 'on', 'join', 'set', 'using', 'left', 'right', 'inner', 'full', 'cross',
        'group', 'order', 'limit', 'having', 'select', 'from', 'as', 'and', 'or'
    }
    pattern = re.compile(rf'\b{re.escape(table_name)}\s+(?:AS\s+)?([a-zA-Z0-9_]+)\b', re.IGNORECASE)
    matches = pattern.findall(query)
    for alias in matches:
        if alias.lower() not in sql_keywords:
            return alias
    return table_name


def replace_query(qry, qry_vars):
    replquery = qry

    # Add a non-bypassable tenant predicate even when a collection template
    # already uses organization_id in its own filters.
    org_id = qry_vars.get('organization_id')
    if org_id is not None and str(org_id) != "":
        # Skip injecting duplicate organization predicate if already present in the SQL query
        if 'organization_id' not in qry.lower():
            main_table_match = re.search(r'\bFROM\s+([a-zA-Z0-9_]+)', qry, re.IGNORECASE)
            main_table = main_table_match.group(1).lower() if main_table_match else None
            if main_table in TENANT_SCOPED_TABLES:
                target_alias = _get_table_alias_or_name(qry, main_table)
                filter_clause = f"{target_alias}.organization_id = @_organization_id"
                replquery = _add_tenant_predicate(qry, filter_clause)

    for key, raw_val in qry_vars.items():
        if raw_val is None:
            val = ""
        elif isinstance(raw_val, (int, float)):
            val = str(raw_val)
        else:
            # Sanitize string input to prevent SQL injection
            val = str(raw_val).replace("'", "''")
        replquery = replquery.replace("@_" + key, val)
    
    # Safely replace any unsupplied @_placeholder variables (e.g. @_from_date) with empty string
    replquery = re.sub(r'@[_a-zA-Z0-9]+', '', replquery)
    return replquery 


def _add_tenant_predicate(query, predicate):
    clause_patterns = (
        (re.compile(r'\bWHERE\b', re.IGNORECASE), 'where'),
        (re.compile(r'\bGROUP\s+BY\b', re.IGNORECASE), 'boundary'),
        (re.compile(r'\bORDER\s+BY\b', re.IGNORECASE), 'boundary'),
        (re.compile(r'\bHAVING\b', re.IGNORECASE), 'boundary'),
        (re.compile(r'\bLIMIT\b', re.IGNORECASE), 'boundary'),
        (re.compile(r'\bOFFSET\b', re.IGNORECASE), 'boundary'),
        (re.compile(r'\bUNION\b', re.IGNORECASE), 'union'),
        (re.compile(r'\bFOR\s+(?:UPDATE|SHARE)\b', re.IGNORECASE), 'boundary'),
    )
    clauses = []
    depth = 0
    index = 0

    while index < len(query):
        char = query[index]
        if char in ("'", '"', '`'):
            quote = char
            index += 1
            while index < len(query):
                if query[index] == '\\':
                    index += 2
                    continue
                if query[index] == quote:
                    if index + 1 < len(query) and query[index + 1] == quote:
                        index += 2
                        continue
                    index += 1
                    break
                index += 1
            continue
        if query.startswith('--', index):
            newline = query.find('\n', index + 2)
            index = len(query) if newline < 0 else newline + 1
            continue
        if query.startswith('/*', index):
            comment_end = query.find('*/', index + 2)
            index = len(query) if comment_end < 0 else comment_end + 2
            continue
        if char == '(':
            depth += 1
            index += 1
            continue
        if char == ')':
            depth = max(0, depth - 1)
            index += 1
            continue
        if char == ';' and depth == 0:
            clauses.append((index, index + 1, 'boundary'))
            index += 1
            continue
        if depth == 0:
            for pattern, clause_type in clause_patterns:
                match = pattern.match(query, index)
                if match:
                    clauses.append((match.start(), match.end(), clause_type))
                    index = match.end()
                    break
            else:
                index += 1
            continue
        index += 1

    if any(clause_type == 'union' for _, _, clause_type in clauses):
        raise ValueError("Organization-scoped collection queries cannot use UNION.")

    where_clause = next(
        ((start, end) for start, end, clause_type in clauses if clause_type == 'where'),
        None,
    )
    boundary = next(
        (start for start, _, clause_type in clauses if clause_type == 'boundary'),
        len(query),
    )

    if where_clause:
        where_start, where_end = where_clause
        predicate_end = min(
            (start for start, _, clause_type in clauses
             if clause_type == 'boundary' and start > where_end),
            default=boundary,
        )
        existing_predicate = query[where_end:predicate_end].strip()
        if not existing_predicate:
            raise ValueError("Organization-scoped collection query has an empty WHERE clause.")
        return (
            query[:where_end]
            + f" ({existing_predicate}) AND {predicate} "
            + query[predicate_end:]
        )

    return query[:boundary].rstrip() + f" WHERE {predicate} " + query[boundary:]



def make_serializable(obj):
    if isinstance(obj, list):
        return [make_serializable(item) for item in obj]
    if isinstance(obj, dict):
        return {key: make_serializable(value) for key, value in obj.items()}
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj



# --------------------------- No Generic needed for fetching --------------------------------

def exec_paginated_raw_sql(qry_key, qry_vars=dict(), page=1, page_size=50):
    try:
        page = max(1, int(page or 1))
        page_size = max(1, int(page_size or 50))
        offset = (page - 1) * page_size

        qry_vars = dict(qry_vars) if qry_vars else {}
        qry_vars['offset'] = offset
        qry_vars['limit'] = page_size

        coll_qry = CollectionQuery.objects.filter(key=qry_key).first()
        raw_sql = coll_qry.query if coll_qry else ""

        if "limit" in raw_sql.lower():
            sliced_rows = exec_raw_sql(qry_key, qry_vars) or []
            total_count = len(sliced_rows) + offset
        else:
            all_rows = exec_raw_sql(qry_key, qry_vars) or []
            total_count = len(all_rows)
            sliced_rows = all_rows[offset:offset + page_size] if len(all_rows) > page_size else all_rows

        return {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "rows": sliced_rows
        }
    except Exception as e:
        raise APIException(str(e))


def enrich_telecallers_data(res_vals):
    try:
        if not isinstance(res_vals, list) or not res_vals:
            return res_vals

        from telecalling.models import Lead, User
        from django.db.models import Count

        user_ids = [r['value'] for r in res_vals if isinstance(r, dict) and 'value' in r and r['value']]
        if not user_ids:
            return res_vals

        users_map = {u.id: u for u in User.objects.filter(id__in=user_ids).select_related('team')}

        lead_counts = Lead.objects.filter(assigned_to_id__in=user_ids).values('assigned_to_id', 'pipeline_stage_id').annotate(cnt=Count('id'))

        stats = {u_id: {'total': 0, 'new': 0, 'followup': 0, 'won': 0, 'lost': 0} for u_id in user_ids}
        for item in lead_counts:
            uid = item['assigned_to_id']
            stg = item['pipeline_stage_id']
            cnt = item['cnt']
            stats[uid]['total'] += cnt
            if stg == 1:
                stats[uid]['new'] += cnt
            elif stg == 2:
                stats[uid]['followup'] += cnt
            elif stg == 3:
                stats[uid]['won'] += cnt
            elif stg == 4:
                stats[uid]['lost'] += cnt

        for r in res_vals:
            if isinstance(r, dict) and 'value' in r:
                uid = r['value']
                st = stats.get(uid, {'total': 0, 'new': 0, 'followup': 0, 'won': 0, 'lost': 0})
                u_obj = users_map.get(uid)
                t_color = u_obj.team.badge_color if (u_obj and u_obj.team and u_obj.team.badge_color) else UITheme.DEFAULT_PRIMARY_COLOR

                full_name = r.get('label') or (u_obj.get_full_name() if u_obj else '') or (u_obj.username if u_obj else '')
                emp_code = (u_obj.employee_id if u_obj else None) or f"EMP{uid:02d}"

                r['id'] = uid
                r['name'] = full_name
                r['emp_id'] = emp_code
                r['total_leads'] = st['total']
                r['current_leads'] = st['total']
                r['total_lead_count'] = st['total']
                r['leads_count'] = st['total']
                r['new_leads'] = st['new']
                r['followup_leads'] = st['followup']
                r['won_leads'] = st['won']
                r['lost_leads'] = st['lost']
                r['stage_counts'] = st
                r['segments'] = [t_color, t_color, t_color]
                r['team_name'] = u_obj.team.name if (u_obj and u_obj.team) else None
                r['badge_color'] = t_color
        return res_vals
    except Exception:
        return res_vals