from django.db import models
from telecalling.models.delete_base_model import SafeDeleteModel


class ReportCatalog(SafeDeleteModel):
    report_name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100)
    report_key = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.CharField(max_length=50, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    updated_by = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.report_name} ({self.category})"

    class Meta:
        db_table = 'adm_report_catalog'
        ordering = ['id']
