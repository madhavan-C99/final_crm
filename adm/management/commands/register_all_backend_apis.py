from django.core.management.base import BaseCommand
from adm.models import Role, Perm
import os
import re


class Command(BaseCommand):
    help = "Registers ALL 96 Backend API View names across adm & telecalling apps into adm_perm with perm_group='perm_apis'"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Scanning all API View classes across adm and telecalling apps..."))

        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        
        api_list = []
        for app in ['adm', 'telecalling']:
            views_dir = os.path.join(backend_dir, app, 'views')
            if os.path.exists(views_dir):
                for f in sorted(os.listdir(views_dir)):
                    if f.endswith('.py') and not f.startswith('__'):
                        filepath = os.path.join(views_dir, f)
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                            content = fp.read()
                            classes = re.findall(r'class\s+([A-Za-z0-9_]+)\s*\(\s*APIView\s*\)', content)
                            for cls in classes:
                                snake = re.sub(r'(?<!^)(?=[A-Z])', '_', cls).lower()
                                perm_name = f"api_{snake}"
                                display_title = re.sub(r'(?<!^)(?=[A-Z])', ' ', cls)
                                code_val = f"AP{len(api_list)+1:03d}"
                                api_list.append((cls, perm_name, display_title, code_val, app, f))

        dev_role = Role.objects.filter(code="DEV").first()
        
        count = 0
        for cls, perm_name, display_title, code_val, app, fname in api_list:
            perm_obj, created = Perm.objects.get_or_create(
                name=perm_name,
                defaults={
                    "display_value": display_title,
                    "code": code_val,
                    "perm_group": "perm_apis",
                    "created_by": "system_scanner",
                }
            )
            count += 1
            if dev_role:
                dev_role.perms.add(perm_obj)

        self.stdout.write(self.style.SUCCESS(f"COMPLETE! Successfully registered all {count} backend API permissions into adm_perm table with perm_group='perm_apis' and auto-linked to Developer role!"))
