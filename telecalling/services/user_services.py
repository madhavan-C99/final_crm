import logging
from rest_framework.exceptions import APIException
from ..models.collection_query import CollectionQuery
from ..services.query_services import exec_raw_sql

logger = logging.getLogger('django')


def collection_query_service(**data):
    try:
        key_val = data.get('key')
        query_val = data.get('query')
        if not key_val or not query_val:
            return {"message": "key and query parameters are required."}
        query = CollectionQuery.objects.create(
            key=key_val,
            query=query_val,
        )
        query.save()
        return {"message": "collection query created successfully"}
    except Exception as e:
        raise APIException(str(e))


def get_select_options(**data):
    try:
        field = data.get('fields')
        values = exec_raw_sql(field, {})
        return values
    except Exception as e:
        raise APIException(str(e))

