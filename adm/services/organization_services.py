import base64
from django.core.files.base import ContentFile
from rest_framework.exceptions import APIException
from adm.models import Organization

def get_logo_url(org_obj, request=None):
    if not org_obj or not org_obj.logo:
        return ""
    try:
        url = org_obj.logo.url
        if request:
            return request.build_absolute_uri(url)
        return url
    except Exception:
        return str(org_obj.logo)


def create_organization_profile_admin_service(data, admin_user=None, request=None):
    try:
        org_name = str(data.get('org_name', '')).strip()
        display_name = str(data.get('display_name', '')).strip()
        
        if not org_name:
            return {
                "status": False,
                "message": "Organization name is required"
            }

        address_line_1 = data.get('address_line1') or data.get('address_lane1') or data.get('address_line_1') or ""
        address_line_2 = data.get('address_line2') or data.get('address_lane2') or data.get('address_line_2') or ""
        gstin = data.get('gst_in') or data.get('gstin') or ""

        created_by_user = getattr(admin_user, 'username', 'admin') if admin_user else 'admin'

        new_org = Organization(
            organization_name=org_name,
            display_name=display_name,
            industry_type=data.get('industry_type', ''),
            company_website=data.get('company_website', ''),
            company_description=data.get('company_description', ''),
            address_line_1=address_line_1,
            address_line_2=address_line_2,
            city=data.get('city', ''),
            state=data.get('state', ''),
            country=data.get('country', 'India'),
            pincode=data.get('pincode', ''),
            official_email=data.get('official_email', ''),
            official_contact=data.get('official_contact', ''),
            gstin=gstin,
            company_pan=data.get('company_pan', ''),
            date_format=data.get('date_format', 'DD/MM/YYYY'),
            time_format=data.get('time_format', '12hrs'),
            created_by=created_by_user
        )

        if data.get('logo'):
            new_org.logo = data.get('logo')

        new_org.save()

        return {
            "status": True,
            "message": "Organization Profile created successfully",
            "data": {
                "id": new_org.id,
                "logo_url": get_logo_url(new_org, request=request)
            }
        }
    except Exception as e:
        raise APIException(str(e))


def get_organization_profile_admin_service(request=None):
    try:
        org = Organization.objects.order_by('-id').first()
        if not org:
            return {
                "status": False,
                "message": "No organization profile found",
                "data": None
            }

        data = {
            "id": org.id,
            "logo_url": get_logo_url(org, request=request),
            "org_name": org.organization_name or "",
            "display_name": org.display_name or "",
            "industry_type": org.industry_type or "",
            "company_website": org.company_website or "",
            "company_description": org.company_description or "",
            "address_line1": org.address_line_1 or "",
            "address_line2": org.address_line_2 or "",
            "city": org.city or "",
            "state": org.state or "",
            "country": org.country or "India",
            "pincode": org.pincode or "",
            "official_email": org.official_email or "",
            "official_contact": org.official_contact or "",
            "gst_in": org.gstin or "",
            "company_pan": org.company_pan or "",
            "date_format": org.date_format or "DD/MM/YYYY",
            "time_format": org.time_format or "12hrs"
        }

        return {
            "status": True,
            "data": data
        }
    except Exception as e:
        raise APIException(str(e))


def edit_organization_profile_admin_service(data, admin_user=None, org_id=None, request=None):
    try:
        t_id = org_id or data.get('id')
        org = None
        if t_id:
            org = Organization.objects.filter(id=t_id).first()
        if not org:
            org = Organization.objects.order_by('-id').first()

        if not org:
            return {
                "status": False,
                "message": "Organization Profile not found"
            }

        if 'org_name' in data and data.get('org_name'):
            org.organization_name = str(data.get('org_name')).strip()
        if 'display_name' in data and data.get('display_name'):
            org.display_name = str(data.get('display_name')).strip()
        if 'industry_type' in data:
            org.industry_type = data.get('industry_type') or ""
        if 'company_website' in data:
            org.company_website = data.get('company_website') or ""
        if 'company_description' in data:
            org.company_description = data.get('company_description') or ""
        if any(k in data for k in ('address_line1', 'address_lane1', 'address_line_1')):
            val1 = data.get('address_line1') if 'address_line1' in data else (data.get('address_lane1') if 'address_lane1' in data else data.get('address_line_1'))
            org.address_line_1 = str(val1).strip() if val1 is not None else ""
        if any(k in data for k in ('address_line2', 'address_lane2', 'address_line_2')):
            val2 = data.get('address_line2') if 'address_line2' in data else (data.get('address_lane2') if 'address_lane2' in data else data.get('address_line_2'))
            org.address_line_2 = str(val2).strip() if val2 is not None else ""
        if 'city' in data:
            org.city = data.get('city') or ""
        if 'state' in data:
            org.state = data.get('state') or ""
        if 'country' in data:
            org.country = data.get('country') or "India"
        if 'pincode' in data:
            org.pincode = data.get('pincode') or ""
        if 'official_email' in data:
            org.official_email = data.get('official_email') or ""
        if 'official_contact' in data:
            org.official_contact = data.get('official_contact') or ""
        if 'gst_in' in data or 'gstin' in data:
            gst_val = data.get('gst_in') if 'gst_in' in data else data.get('gstin')
            org.gstin = str(gst_val).strip() if gst_val is not None else ""
        if 'company_pan' in data:
            org.company_pan = data.get('company_pan') or ""
        if 'date_format' in data:
            org.date_format = data.get('date_format') or "DD/MM/YYYY"
        if 'time_format' in data:
            org.time_format = data.get('time_format') or "12hrs"

        if data.get('logo'):
            org.logo = data.get('logo')

        org.updated_by = getattr(admin_user, 'username', 'admin') if admin_user else 'admin'
        org.save()

        return {
            "status": True,
            "message": "Organization Profile updated successfully",
            "data": {
                "id": org.id,
                "logo_url": get_logo_url(org, request=request)
            }
        }
    except Exception as e:
        raise APIException(str(e))
