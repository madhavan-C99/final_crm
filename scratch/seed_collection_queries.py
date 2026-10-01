import os
import sys
import django

sys.path.append(r'C:\Users\sivar\OneDrive\Desktop\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_api.settings')
django.setup()

from adm.models import CollectionQuery

def register_user_collection_queries():
    users_query = """SELECT 
    ROW_NUMBER() OVER (ORDER BY u.created_at DESC, u.id DESC) AS s_no,
    u.id,
    COALESCE(u.employee_id, CONCAT('EMP-', LPAD(u.id::text, 4, '0'))) AS emp_id,
    TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS name,
    u.first_name,
    COALESCE(u.last_name, '') AS last_name,
    COALESCE(u.mobile, '') AS mobile_no,
    COALESCE(u.address, '') AS location,
    u.email,
    COALESCE(
        NULLIF(
            CASE 
                WHEN r.display_value ILIKE '%tele%' OR r.name ILIKE '%tele%' THEN 'Executive'
                ELSE COALESCE(r.display_value, r.name)
            END, ''
        ),
        'Executive'
    ) AS role,
    TRIM(CONCAT(rep.first_name, ' ', rep.last_name)) AS reporting_to,
    rep.id AS reporting_to_id,
    CASE WHEN u.is_active = TRUE THEN 'Active' ELSE 'Inactive' END AS status,
    u.is_active,
    TO_CHAR(u.created_at, 'YYYY-MM-DD') AS joined_date,
    COALESCE(t.name, '') AS team,
    u.team_id,
    COALESCE(u.disable_lead_assignment, FALSE) AS disable_lead_assignment
FROM adm_user u
LEFT JOIN adm_team t ON u.team_id = t.id
LEFT JOIN adm_user rep ON u.reporting_to_id = rep.id
LEFT JOIN adm_user_role ur ON ur.user_id = u.id
LEFT JOIN adm_role r ON ur.role_id = r.id
WHERE (u.organization_id = @_organization_id OR @_organization_id IS NULL OR @_organization_id = 0)
  AND (r.name NOT ILIKE '%developer%' OR r.name IS NULL)
  AND (
    '@_search' = '' OR '@_search' = '0' OR
    u.first_name ILIKE '%@_search%' OR
    u.last_name ILIKE '%@_search%' OR
    u.email ILIKE '%@_search%' OR
    u.mobile ILIKE '%@_search%' OR
    u.employee_id ILIKE '%@_search%'
  )
ORDER BY u.created_at DESC, u.id DESC"""

    obj, created = CollectionQuery.objects.update_or_create(
        key='D_FETCH_ALL_USERS_ADMIN',
        defaults={'query': users_query}
    )
    print(f"Registered CollectionQuery 'D_FETCH_ALL_USERS_ADMIN': Created={created}, ID={obj.id}")

if __name__ == "__main__":
    register_user_collection_queries()
