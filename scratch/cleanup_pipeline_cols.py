import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crm_api.settings')
django.setup()

from django.db import connection

allowed_tables = {
    'telecalling_loss_reason', 
    'adm_user', 
    'adm_team', 
    'telecalling_lead', 
    'telecalling_campaign_name', 
    'telecalling_pipeline_stage'
}

cur = connection.cursor()
cur.execute("SELECT table_name FROM information_schema.columns WHERE column_name = 'pipeline_id'")
all_tables = [r[0] for r in cur.fetchall()]

dropped = []
for t in all_tables:
    if t not in allowed_tables:
        try:
            cur.execute(f'ALTER TABLE "{t}" DROP COLUMN IF EXISTS pipeline_id CASCADE;')
            dropped.append(t)
        except Exception as e:
            print(f"Error dropping from {t}: {e}")

print(f"Successfully dropped physical pipeline_id column from {len(dropped)} tables in PostgreSQL!")
print("Dropped tables:", dropped)
