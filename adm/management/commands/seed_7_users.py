from django.core.management.base import BaseCommand
from telecalling.models import User as TelecallingUser
from adm.models import User as AdmUser, Role


class Command(BaseCommand):
    help = "Seeds the 7 specified users (5 Telecallers, 1 Admin, 1 Developer) into PostgreSQL database"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting 7 Users Seeding Process..."))

        dev_role = Role.objects.filter(code="DEV").first()
        admin_role = Role.objects.filter(code="ADM").first()
        tele_role = Role.objects.filter(code="TEL").first()

        users_list = [
            ("anandhi@gmail.com", "anandhi@123", "Anandhi", tele_role),
            ("Dharunbabu@gmail.com", "dharunbabu@123", "Dharunbabu", tele_role),
            ("priya@gmail.com", "priya@123", "Priya", tele_role),
            ("ajitha@gmail.com", "ajitha@123", "Ajitha", tele_role),
            ("vishalini@gmail.com", "vishalini@123", "Vishalini", tele_role),
            ("admin@gmail.com", "admin@123", "Admin User", admin_role),
            ("developer@gmail.com", "developer@123", "Developer User", dev_role),
        ]

        seeded_count = 0
        for email, pwd, first_name, role_obj in users_list:
            username = email.lower()

            # Seed in telecalling_user
            t_user, created_t = TelecallingUser.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "is_active": True,
                    "role": role_obj,
                }
            )
            t_user.set_password(pwd)
            t_user.role = role_obj
            t_user.save()

            # Seed in adm_user
            a_user, created_a = AdmUser.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "is_active": True,
                    "role": role_obj,
                }
            )
            a_user.set_password(pwd)
            a_user.role = role_obj
            a_user.save()

            seeded_count += 1
            role_title = role_obj.display_value if role_obj else "No Role"
            self.stdout.write(self.style.SUCCESS(f"  [{seeded_count}/7] User: {email} | Role: {role_title} | Status: Success 🟢"))

        self.stdout.write(self.style.SUCCESS(f"COMPLETE! Successfully seeded all 7 users into PostgreSQL DB!"))
