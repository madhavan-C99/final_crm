from django.core.management.base import BaseCommand
import os
import re


class Command(BaseCommand):
    help = "Injects authorize_request('api_xxx', request.user) as line #1 into all APIView post/get methods across adm and telecalling apps"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting authorize_request line injection across all view files..."))

        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

        updated_files_count = 0
        injected_methods_count = 0

        for app in ['adm', 'telecalling']:
            views_dir = os.path.join(backend_dir, app, 'views')
            if os.path.exists(views_dir):
                for f in sorted(os.listdir(views_dir)):
                    if f.endswith('.py') and not f.startswith('__'):
                        filepath = os.path.join(views_dir, f)
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                            content = fp.read()

                        # Ensure import statement exists
                        import_stmt = "from adm.services.permission_services import authorize_request\n"
                        has_import = "authorize_request" in content

                        lines = content.split('\n')
                        new_lines = []
                        current_class = None
                        modified_in_file = False

                        for idx, line in enumerate(lines):
                            new_lines.append(line)
                            
                            # Detect APIView class definition
                            class_match = re.search(r'class\s+([A-Za-z0-9_]+)\s*\(\s*APIView\s*\)', line)
                            if class_match:
                                current_class = class_match.group(1)

                            # Detect def post(self, request) / get / put / delete
                            def_match = re.search(r'def\s+(post|get|put|delete)\s*\(\s*self\s*,\s*request', line)
                            if def_match and current_class:
                                # Check if next line already has authorize_request
                                next_line = lines[idx + 1] if idx + 1 < len(lines) else ''
                                if 'authorize_request' not in next_line:
                                    snake = re.sub(r'(?<!^)(?=[A-Z])', '_', current_class).lower()
                                    perm_name = f"api_{snake}"
                                    indent = line[:len(line) - len(line.lstrip())] + "    "
                                    auth_line = f"{indent}authorize_request('{perm_name}', request.user)"
                                    new_lines.append(auth_line)
                                    modified_in_file = True
                                    injected_methods_count += 1

                        if modified_in_file:
                            final_content = '\n'.join(new_lines)
                            if not has_import:
                                final_content = import_stmt + final_content

                            with open(filepath, 'w', encoding='utf-8') as fp:
                                fp.write(final_content)
                            
                            updated_files_count += 1
                            self.stdout.write(self.style.SUCCESS(f"  [Injected] {app}/views/{f}"))

        self.stdout.write(self.style.SUCCESS(f"COMPLETE! Successfully injected authorize_request line into {injected_methods_count} API methods across {updated_files_count} view files!"))
