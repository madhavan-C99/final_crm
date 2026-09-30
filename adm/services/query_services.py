from django.db import connection
from adm.models import CollectionQuery
from rest_framework.exceptions import APIException
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
    'campaign_manager_list': 'L_CAMPAIGN_MANAGERS',
    'lead_source_list': 'L_LEAD_SOURCES',
    'team_list': 'L_TEAMS',
    'team_lead_list': 'L_UNASSIGNED_TEAM_LEADS',
    'team_lead': 'L_UNASSIGNED_TEAM_LEADS',
    'team_leads': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_team_leads': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_team_lead': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_leads': 'L_UNASSIGNED_TEAM_LEADS',
    'category_list': 'L_CATEGORIES',
    'unassigned_tl': 'L_UNASSIGNED_TEAM_LEADS',
    'unassigned_team_members': 'L_UNASSIGNED_TELECALLERS',
    'unassigned_telecallers': 'L_UNASSIGNED_TELECALLERS',
    'unassigned_users': 'L_UNASSIGNED_TELECALLERS',
    'unassigned_members': 'L_UNASSIGNED_TELECALLERS',
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


def replace_query(qry, qry_vars):
    replquery = qry

    # 🔒 DYNAMIC MULTI-TENANCY PROTECTION: Auto-inject organization_id filter if missing in CollectionQuery template
    org_id = qry_vars.get('organization_id')
    if org_id is not None and str(org_id) != "" and '@_organization_id' not in qry:
        org_tables = [
            'adm_pipeline_category', 'telecalling_lead_source', 'telecalling_lead', 'adm_team',
            'telecalling_campaign', 'telecalling_pipeline_stage', 'telecalling_call_details',
            'telecalling_user_settings', 'adm_user'
        ]
        # Sort by length descending so longer table names (e.g. telecalling_lead_source) match before substrings (e.g. telecalling_lead)
        org_tables_sorted = sorted(org_tables, key=len, reverse=True)
        query_lower = qry.lower()
        matched_table = next((tbl for tbl in org_tables_sorted if tbl in query_lower), None)

        if matched_table:
            filter_clause = f" ({matched_table}.organization_id = @_organization_id OR @_organization_id IS NULL OR @_organization_id = 0) "
            if 'where' in query_lower:
                if 'order by' in query_lower:
                    idx = query_lower.find('order by')
                    qry = qry[:idx] + f" AND {filter_clause} " + qry[idx:]
                elif 'group by' in query_lower:
                    idx = query_lower.find('group by')
                    qry = qry[:idx] + f" AND {filter_clause} " + qry[idx:]
                else:
                    qry = qry + f" AND {filter_clause} "
            else:
                if 'order by' in query_lower:
                    idx = query_lower.find('order by')
                    qry = qry[:idx] + f" WHERE {filter_clause} " + qry[idx:]
                elif 'group by' in query_lower:
                    idx = query_lower.find('group by')
                    qry = qry[:idx] + f" WHERE {filter_clause} " + qry[idx:]
                else:
                    qry = qry + f" WHERE {filter_clause} "
            replquery = qry

    for key in qry_vars:
        raw_val = qry_vars[key]
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
                t_color = u_obj.team.badge_color if (u_obj and u_obj.team and u_obj.team.badge_color) else "#505AF2"

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