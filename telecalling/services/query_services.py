from django.db import connection
from ..models.collection_query import CollectionQuery
from rest_framework.exceptions import APIException
from datetime import date, datetime


def exec_raw_sql(qry_key, qry_vars=dict()):
    try:
        coll_qry = CollectionQuery.objects.filter(key=qry_key).first()
        if coll_qry is not None:
            replaced_query = replace_query(coll_qry.query, qry_vars)
            # print("replaced",replaced_query)
            # logger.info("replaced_query" + replaced_query)
        
            cursor = connection.cursor()
            cursor.execute(replaced_query)
            #cursor.execute("select * from adm_fileupload where tmp_file_name = 'storage/tmp/OdoQxBNoFmFo_bootstrapnavbar.txt' ")
            # print("cursor",cursor)
            res_vals = dict_fetch_all(cursor)
            # print("res_vals",res_vals)
            cursor.close()
            
            return make_serializable(res_vals)
        else:
            raise TypeError('Unable to find option key.')

    except Exception as e:
        raise APIException(e)


def dict_fetch_all(cursor):
    columns = [col[0] for col in cursor.description]
    # print("columns",columns)
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

   

def delete_exec_raw_sql(qry_key, qry_vars=dict()):
    try:
        coll_qry = CollectionQuery.objects.filter(key=qry_key).first()
        if coll_qry is not None:
            replaced_query = replace_query(coll_qry.query, qry_vars)
            # logger.info("replaced_query" + replaced_query)
        
            cursor = connection.cursor()
            cursor.execute(replaced_query)
            cursor.close()
    except Exception as e:
        raise APIException(e)

import re

from adm.services.query_services import replace_query



def make_serializable(obj):
    if isinstance(obj, list):
        return [make_serializable(item) for item in obj]
    if isinstance(obj, dict):
        return {key: make_serializable(value) for key, value in obj.items()}
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj