import logging
from rest_framework.exceptions import APIException
from ..models.collection_query import CollectionQuery
from ..models.dropdown import DropdownCategory, Dropdown
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


def drop_cate(user, **data):
    try:
        drop = DropdownCategory.objects.filter(category_name=data.get("category")).first()
        if drop is not None:
            raise APIException(f"{drop.category_name} Category is already existing")

        drop_category = DropdownCategory.objects.create(
            category_name=data.get("category"),
            created_by=user
        )
        return f"{drop_category.category_name} category is created successfully"
    except Exception as e:
        raise APIException(str(e))


def drop_sub(user, **data):
    try:
        drop_sub = Dropdown.objects.create(
            name=data.get("name"),
            category_id=data.get("category_id"),
            sub_name=data.get("sub_name"),
            created_by=user
        )
        return f"{drop_sub.name} sub-category is created successfully"
    except Exception as e:
        raise APIException(str(e))
