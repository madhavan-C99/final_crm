from django.db import models


class Perm(models.Model):
    
    name = models.CharField(max_length=100, unique=True)
    display_value = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    perm_group = models.CharField(max_length=50, default="perm_apis")
    
    # Audit & Timestamp Fields
    created_by = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.CharField(max_length=100, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "adm_perm"
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
        indexes = [
            models.Index(fields=["code"]),
            models.Index(fields=["name"]),
            models.Index(fields=["perm_group"]),
        ]

    def __str__(self):
        return f"{self.display_value} ({self.code})"