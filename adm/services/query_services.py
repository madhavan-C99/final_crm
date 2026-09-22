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
    'category_list': 'L_CATEGORIES',
    'pipeline_list': 'L_PIPELINES',
    'stage_list': 'L_STAGES',
    'loss_reason_list': 'L_LOSS_REASONS',
    'priority_list': 'L_PRIORITIES',
    'disconnect_tags': 'L_DISCONNECT_TAGS',
    'roles_list': 'L_ROLES',
}


def exec_raw_sql(qry_key, qry_vars=dict()):
    try:
        real_key = ALIAS_MAP.get(qry_key, qry_key)
        coll_qry = CollectionQuery.objects.filter(key=real_key).first()
        if coll_qry is not None:
            print(f"Executing SQL Query for key: {real_key} with variables: {qry_vars}")  # Debugging line to log the query key and variables
            replaced_query = replace_query(coll_qry.query, qry_vars)
            print(f"Executing SQL Query: {replaced_query}")  # Debugging line to log the executed query
            cursor = connection.cursor()
            print(f"Executing SQL Query: {replaced_query}")  # Debugging line to log the executed query
            cursor.execute(replaced_query)
            res_vals = dict_fetch_all(cursor)
            cursor.close()
            print(f"Query Result: {res_vals}")  # Debugging line to log the query result
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
    for key in qry_vars:
        raw_val = qry_vars[key]
        if raw_val is None or raw_val == "" or raw_val == "0":
            val = "0"
        elif isinstance(raw_val, (int, float)):
            val = str(raw_val)
        else:
            # Sanitize string input to prevent SQL injection
            val = str(raw_val).replace("'", "''")
        replquery = replquery.replace("@_" + key, val)
    
    # Safely replace any unsupplied @_placeholder variables (e.g. @_organization_id) with 0
    replquery = re.sub(r'@[_a-zA-Z0-9]+', '0', replquery)
    return replquery 


def make_serializable(obj):
    if isinstance(obj, list):
        return [make_serializable(item) for item in obj]
    if isinstance(obj, dict):
        return {key: make_serializable(value) for key, value in obj.items()}
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj