from django.db import models
from django.conf import settings

class UserTarget(models.Model):
    # 👤 Individual Telecaller Target (Null when Team Target is set)
    telecaller = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='performance_targets'
    )
    
    # 👥 Team Target (Null when Individual Telecaller Target is set)
    team = models.ForeignKey(
        'adm.Team',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='team_targets'
    )
    
    target_month = models.DateField(null=False)
    target_admissions = models.IntegerField(default=50, null=False)
    
    # Audit trail fields
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    updated_by = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'adm_user_target'

    def __str__(self):
        target_name = self.telecaller.username if self.telecaller else (self.team.name if self.team else "Unknown")
        return f"Target for {target_name} ({self.target_month.strftime('%Y-%m')})"
