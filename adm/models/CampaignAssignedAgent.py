from django.db import models
from django.conf import settings
from telecalling.models.delete_base_model import SafeDeleteModel


class CampaignAssignedAgent(models.Model):
    campaign = models.ForeignKey('telecalling.CampaignName', on_delete=models.CASCADE, db_column='campaign_id')
    agent_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='agent_user_id')
    max_leads_count = models.IntegerField(null=True, blank=True, default=None)  # Optional Lead limit
    is_active = models.BooleanField(default=True)  # Active / Paused Agent
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'adm_campaign_assigned_agents'
        unique_together = ('campaign', 'agent_user')