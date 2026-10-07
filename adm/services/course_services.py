from telecalling.models.courses import CourseName, Course, CoursePlan, CourseTiming
from adm.services.query_services import exec_raw_sql
from rest_framework.exceptions import APIException
from django.db import models
import re


def generate_avatar_text(name):
    if not name:
        return ""
    words = name.strip().split()
    if len(words) >= 2:
        return (words[0][0] + words[1][0]).upper()
    return name[:2].upper()


def fetch_courses_sidebar_service(search=None):
    queryset = CourseName.objects.all().order_by('-id')
    if search:
        queryset = queryset.filter(coursename__icontains=search)

    result = []
    for course_obj in queryset:
        courses = Course.objects.filter(name=course_obj)
        enrolled_count = sum(c.admission_count or 0 for c in courses)
        active_batches = courses.filter(is_active=True).count() if courses.filter(is_active=True).exists() else courses.count()

        result.append({
            "id": course_obj.id,
            "name": course_obj.coursename or "",
            "status": "Active" if course_obj.is_active else "Draft",
            "avatar_text": generate_avatar_text(course_obj.coursename or ""),
            "enrolled_count": enrolled_count,
            "active_batches": active_batches
        })
    return result


def fetch_course_details_service(course_id):
   
    course_obj = CourseName.objects.filter(id=course_id).first()
    if not course_obj:
        return None

    stats_list = exec_raw_sql('D_COURSE_STATS', {'course_id': course_id})
    plans_list = exec_raw_sql('L_COURSE_PLANS_BY_COURSE', {'course_id': course_id})
    batches_list = exec_raw_sql('D_COURSE_BATCHES_BY_COURSE', {'course_id': course_id})

    default_stats = {"plans": 0, "batches": 0, "enrolled": 0, "seats_left": 0}

    return {
        "id": course_obj.id,
        "name": course_obj.coursename or "",
        "status": "Active" if course_obj.is_active else "Draft",
        "avatar_text": generate_avatar_text(course_obj.coursename or ""),
        "stats": stats_list[0] if (stats_list and isinstance(stats_list, list) and len(stats_list) > 0) else default_stats,
        "plans": plans_list or [],
        "batches": batches_list or []
    }


def create_course_service(user, data):
    try:
        name = data.get("name", "").strip()
        status_str = data.get("status", "Active").strip()
        is_active = (status_str.lower() == "active")

        created_by_str = (user.get_full_name() or user.username) if user and hasattr(user, 'username') else "Admin"

        if CourseName.objects.filter(coursename__iexact=name).exists():
            raise APIException("A course with this name already exists.")

        course_obj = CourseName.objects.create(
            coursename=name,
            is_active=is_active,
            created_by=created_by_str,
            updated_by=created_by_str
        )

        return fetch_course_details_service(course_obj.id)
    except Exception as e:
        raise APIException(str(e))


def edit_course_service(user, data):
    course_id = data.get("course_id") or data.get("id")
    if not course_id:
        raise APIException("course_id is required.")

    course_obj = CourseName.objects.filter(id=course_id).first()
    if not course_obj:
        raise APIException("Course not found.")

    name = data.get("name")
    if name is not None:
        name = name.strip()
        if CourseName.objects.filter(coursename__iexact=name).exclude(id=course_id).exists():
            raise APIException("A course with this name already exists.")
        course_obj.coursename = name

    status_str = data.get("status")
    if status_str is not None:
        course_obj.is_active = (status_str.strip().lower() == "active")

    updated_by_str = (user.get_full_name() or user.username) if user and hasattr(user, 'username') else "Admin"
    course_obj.updated_by = updated_by_str
    course_obj.save()

    return fetch_course_details_service(course_obj.id)


def create_course_plan_service(user, data):
    course_id = data.get("course_id")
    name = data.get("name", "").strip()
    price = data.get("price", "").strip()
    duration = data.get("duration", "6 months")
    hours_per_day = data.get("hours_per_day", "2 hrs")

    created_by_str = (user.get_full_name() or user.username) if user and hasattr(user, 'username') else "Admin"

    course_obj = CourseName.objects.filter(id=course_id).first()
    if not course_obj:
        raise APIException("Course not found.")

    existing_in_course = Course.objects.filter(name=course_obj, plan__courseplan__iexact=name).exists()
    if existing_in_course:
        raise APIException("A plan with this name already exists in this course.")

    plan_obj = CoursePlan.objects.filter(courseplan__iexact=name).first()
    if not plan_obj:
        plan_obj = CoursePlan.objects.create(
            courseplan=name,
            created_by=created_by_str,
            updated_by=created_by_str
        )

    # Link Plan to CourseName in Course model if not already linked
    clean_price = re.sub(r'[^\d.]', '', price)
    numeric_fees = float(clean_price) if clean_price else 45000.0

    from datetime import date
    Course.objects.create(
        name=course_obj,
        plan=plan_obj,
        course_fees=numeric_fees,
        starting_date=date.today(),
        closing_date=date.today(),
        total_seats=0,
        admission_count=0,
        seats_left=0,
        created_by=created_by_str,
        updated_by=created_by_str
    )

    return {
        "id": plan_obj.id,
        "name": plan_obj.courseplan,
        "badge": "Installments",
        "price": price,
        "duration": duration,
        "hours_per_day": duration if "hrs" in duration else hours_per_day,
        "installments": "3",
        "after_offer": None,
        "students_count": 0,
        "is_highlighted": False
    }


def edit_plan_service(user, plan_id, name=None, price=None, duration=None, hours_per_day=None, **kwargs):
    plan_obj = CoursePlan.objects.filter(id=plan_id).first()
    if not plan_obj:
        raise APIException("Plan not found.")

    if name is not None:
        name = name.strip()
        if CoursePlan.objects.filter(courseplan__iexact=name).exclude(id=plan_id).exists():
            raise APIException("A plan with this name already exists.")
        plan_obj.courseplan = name

    updated_by_str = (user.get_full_name() or user.username) if user and hasattr(user, 'username') else "Admin"
    plan_obj.updated_by = updated_by_str
    plan_obj.save()

    p_courses = Course.objects.filter(plan=plan_obj)
    if price is not None:
        clean_price = re.sub(r'[^\d.]', '', price)
        if clean_price:
            p_courses.update(course_fees=float(clean_price))

    students_count = sum(c.admission_count or 0 for c in p_courses)
    fees = p_courses[0].course_fees if p_courses and p_courses[0].course_fees else 45000.0

    return {
        "id": plan_obj.id,
        "name": plan_obj.courseplan,
        "badge": "Installments",
        "price": price or f"₹{int(fees):,}",
        "duration": duration or "6 months",
        "hours_per_day": hours_per_day or "2 hrs",
        "installments": "3",
        "after_offer": None,
        "students_count": students_count,
        "is_highlighted": False
    }


def delete_course_plan_service(plan_id, course_id=None, **kwargs):
    plan_obj = CoursePlan.objects.filter(id=plan_id).first()
    if not plan_obj:
        raise APIException("Plan not found.")

    # Count batches using this plan
    using_batches_count = Course.objects.filter(plan=plan_obj).exclude(batch__isnull=True).exclude(batch='').count()

    if using_batches_count > 0:
        raise APIException(f"This plan is used by {using_batches_count} batch(es). Delete or change those batches first.")

    Course.objects.filter(plan=plan_obj).delete()
    plan_obj.delete()
    return True


def edit_course_batch_service(user, data):
    batch_id = data.get("batch_id")
    batch_obj = Course.objects.filter(id=batch_id).first()
    if not batch_obj:
        raise APIException("Batch not found.")

    filled = batch_obj.admission_count or 0

    # 1. Total Seats Validation (Cannot be less than filled_seats)
    new_total_seats = data.get("total_seats")
    if new_total_seats is not None:
        if new_total_seats < filled:
            raise APIException(f"Cannot be less than the {filled} seats already filled.")
        batch_obj.total_seats = new_total_seats

    # 2. Update optional fields if provided
    if "name" in data and data["name"] is not None:
        batch_obj.batch = data["name"].strip()

    if "plan" in data and data["plan"] is not None:
        plan_obj = CoursePlan.objects.filter(id=data["plan"]).first()
        if plan_obj:
            batch_obj.plan = plan_obj

    if "time" in data and data["time"] is not None:
        timing_str = data["time"].strip()
        timing_obj, _ = CourseTiming.objects.get_or_create(coursetime=timing_str)
        batch_obj.time = timing_obj

    if "start_date" in data and data["start_date"] is not None:
        batch_obj.starting_date = data["start_date"]

    if "closing_date" in data and data["closing_date"] is not None:
        batch_obj.closing_date = data["closing_date"]

    updated_by_str = (user.get_full_name() or user.username) if user and hasattr(user, 'username') else "Admin"
    batch_obj.updated_by = updated_by_str
    batch_obj.save()

    # 3. Recalculate 'almost full' note
    total = batch_obj.total_seats or 0
    is_almost_full = (filled >= (total - 2)) if total > 0 else False

    return {
        "id": batch_obj.id,
        "name": batch_obj.batch or (batch_obj.time.coursetime if batch_obj.time else f"Batch #{batch_obj.id}"),
        "plan": batch_obj.plan.id if batch_obj.plan else 101,
        "plan_name": batch_obj.plan.courseplan.title() if batch_obj.plan and batch_obj.plan.courseplan else "General",
        "days": "Mon–Fri",
        "time": batch_obj.time.coursetime if batch_obj.time else "9:00–11:00 AM",
        "trainer": data.get("trainer", "Divya"),
        "filled_seats": filled,
        "total_seats": total,
        "start_date": str(batch_obj.starting_date) if batch_obj.starting_date else None,
        "closing_date": str(batch_obj.closing_date) if batch_obj.closing_date else None,
        "note": "almost full" if is_almost_full else None
    }


def delete_course_batch_service(batch_id):
    batch_qs = Course.objects.filter(id=batch_id)
    if not batch_qs.exists():
        raise APIException("Batch not found.")

    # QuerySet delete for clean DB deletion
    batch_qs.delete()
    return True


def delete_course_service(course_id):
    course_qs = CourseName.objects.filter(id=course_id)
    if not course_qs.exists():
        return False

    course_obj = course_qs.first()

    # QuerySet delete to remove CourseName record
    course_qs.delete()
    return True


def create_batch_service(user, data):
    from datetime import date
    try:
        course_id = data.get("course_id")
        plan_id = data.get("plan")
        batch_name = data.get("name", "").strip()
        time_str = data.get("time", "").strip()
        trainer_str = data.get("trainer", "").strip() or "Karthik"
        total_seats = data.get("total_seats", 20)
        start_date = data.get("start_date") or date.today()
        closing_date = data.get("closing_date") or date.today()

        if start_date and closing_date and closing_date < start_date:
            raise APIException("Closing date cannot be before starting date.")

        course_name_obj = CourseName.objects.filter(id=course_id).first()
        if not course_name_obj:
            raise APIException("Course not found.")

        plan_obj = CoursePlan.objects.filter(id=plan_id).first()
        if not plan_obj:
            raise APIException("Plan not found.")

        plan_belongs = Course.objects.filter(name=course_name_obj, plan=plan_obj).exists()
        if not plan_belongs and not Course.objects.filter(name=course_name_obj).exists():
            pass
        elif not plan_belongs:
            raise APIException("This plan does not belong to this course.")

        timing_obj = CourseTiming.objects.filter(coursetime=time_str).first()
        if not timing_obj:
            timing_obj = CourseTiming.objects.create(
                coursetime=time_str,
                is_active=True
            )

        created_by_str = user.get_full_name() if (user and hasattr(user, 'get_full_name') and user.get_full_name()) else "Admin"

        batch_obj = Course.objects.create(
            name=course_name_obj,
            plan=plan_obj,
            time=timing_obj,
            batch=batch_name,
            total_seats=total_seats,
            admission_count=0,
            starting_date=start_date,
            closing_date=closing_date,
            is_active=True,
            created_by=created_by_str,
            updated_by=created_by_str
        )

        is_almost_full = (batch_obj.admission_count >= (batch_obj.total_seats - 2)) if batch_obj.total_seats > 0 else False

        return {
            "id": batch_obj.id,
            "name": batch_obj.batch,
            "plan": plan_obj.id,
            "plan_name": plan_obj.courseplan.title() if plan_obj.courseplan else "General",
            "days": "Mon–Fri",
            "time": timing_obj.coursetime if timing_obj else time_str,
            "trainer": trainer_str,
            "filled_seats": batch_obj.admission_count,
            "total_seats": batch_obj.total_seats,
            "start_date": str(batch_obj.starting_date),
            "closing_date": str(batch_obj.closing_date),
            "note": "almost full" if is_almost_full else None
        }
    except Exception as e:
        raise APIException(str(e))


def edit_batch_service(user, batch_id, name=None, plan=None, time=None, trainer=None, total_seats=None, start_date=None, closing_date=None, **kwargs):
    batch_obj = Course.objects.filter(id=batch_id).first()
    if not batch_obj:
        raise APIException("Batch not found.")

    filled_seats = batch_obj.admission_count or 0

    # 1. Validation: total_seats cannot be lower than already filled seats
    if total_seats is not None:
        if total_seats < filled_seats:
            raise APIException(f"Cannot be less than the {filled_seats} seats already filled.")
        batch_obj.total_seats = total_seats

    # 2. Validation: closing_date cannot be before start_date
    s_date = start_date or batch_obj.starting_date
    c_date = closing_date or batch_obj.closing_date
    if s_date and c_date and c_date < s_date:
        raise APIException("Closing date cannot be before starting date.")

    if start_date is not None:
        batch_obj.starting_date = start_date
    if closing_date is not None:
        batch_obj.closing_date = closing_date

    # 3. Update batch name if provided
    if name is not None:
        batch_obj.batch = name.strip()

    # 4. Update associated plan if provided
    if plan is not None:
        plan_obj = CoursePlan.objects.filter(id=plan).first()
        if not plan_obj:
            raise APIException("Plan not found.")
        if batch_obj.name and not Course.objects.filter(name=batch_obj.name, plan=plan_obj).exists():
            raise APIException("This plan does not belong to this course.")
        batch_obj.plan = plan_obj

    # 5. Update batch time using CourseTiming lookup / create
    if time is not None:
        time_str = time.strip()
        timing_obj = CourseTiming.objects.filter(coursetime=time_str).first()
        if not timing_obj:
            timing_obj = CourseTiming.objects.create(
                coursetime=time_str,
                is_active=True
            )
        batch_obj.time = timing_obj

    # 6. Audit tracking using user.get_full_name()
    updated_by_str = user.get_full_name() if (user and hasattr(user, 'get_full_name') and user.get_full_name()) else "Admin"
    batch_obj.updated_by = updated_by_str
    batch_obj.save()

    # 7. Recalculate note ("almost full")
    current_total = batch_obj.total_seats or 0
    is_almost_full = (filled_seats >= (current_total - 2)) if current_total > 0 else False

    return {
        "id": batch_obj.id,
        "name": batch_obj.batch or "Morning",
        "plan": batch_obj.plan.id if batch_obj.plan else None,
        "plan_name": batch_obj.plan.courseplan.title() if (batch_obj.plan and batch_obj.plan.courseplan) else "General",
        "days": "Mon–Fri",
        "time": batch_obj.time.coursetime if batch_obj.time else (time or "9:00–11:00 AM"),
        "trainer": trainer,
        "filled_seats": filled_seats,
        "total_seats": batch_obj.total_seats,
        "start_date": str(batch_obj.starting_date) if batch_obj.starting_date else None,
        "closing_date": str(batch_obj.closing_date) if batch_obj.closing_date else None,
        "note": "almost full" if is_almost_full else None
    }
