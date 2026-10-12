from adm.models import CollectionQuery

sql = """SELECT 
    u.id AS "id",
    ROW_NUMBER() OVER(ORDER BY COALESCE(followup_stats.due_today, 0) DESC, u.first_name ASC)::integer AS "s_no",
    TRIM(CONCAT(u.first_name, ' ', COALESCE(u.last_name, ''))) AS "user_name",
    COALESCE(
        NULLIF(TRIM(CONCAT(rm.first_name, ' ', COALESCE(rm.last_name, ''))), ''),
        rm.username,
        NULLIF(TRIM(CONCAT(tl.first_name, ' ', COALESCE(tl.last_name, ''))), ''),
        tl.username,
        '-'
    ) AS "reporting_manager",
    COALESCE(followup_stats.due_today, 0)::integer AS "followups_due_today",
    CASE 
        WHEN COALESCE(lead_stats.total, 0) > 0 THEN 
            CONCAT(ROUND((COALESCE(lead_stats.won, 0)::numeric / lead_stats.total::numeric) * 100, 2)::text, '%')
        ELSE '0.00%'
    END AS "conversion_percentage",
    COALESCE(followup_stats.avg_tat, '00:00:00') AS "average_tat",
    COUNT(*) OVER()::integer AS "full_count"
FROM adm_user u
LEFT JOIN adm_team t ON u.team_id = t.id
LEFT JOIN adm_user tl ON t.leader_id = tl.id
LEFT JOIN adm_user rm ON u.reporting_to_id = rm.id
LEFT JOIN (
    SELECT 
        f.telecaller_id,
        COUNT(CASE WHEN f.scheduled_at::date = CURRENT_DATE AND f.is_attended = FALSE THEN 1 END) AS due_today,
        TO_CHAR(
            INTERVAL '1 second' * COALESCE(
                AVG(CASE WHEN f.is_attended = TRUE AND f.attended_at IS NOT NULL AND f.scheduled_at IS NOT NULL 
                         THEN ABS(EXTRACT(EPOCH FROM (f.attended_at - f.scheduled_at))) 
                    END), 0
            ), 'HH24:MI:SS'
        ) AS avg_tat
    FROM telecalling_follow_up f
    GROUP BY f.telecaller_id
) followup_stats ON followup_stats.telecaller_id = u.id
LEFT JOIN (
    SELECT 
        l.assigned_to_id,
        COUNT(l.id) AS total,
        COUNT(CASE WHEN ps.stage_type IN ('closed_won', 'terminal_joined') OR ps.name ILIKE '%won%' THEN 1 END) AS won
    FROM telecalling_lead l
    JOIN telecalling_pipeline_stage ps ON l.pipeline_stage_id = ps.id
    GROUP BY l.assigned_to_id
) lead_stats ON lead_stats.assigned_to_id = u.id
WHERE u.is_active = TRUE
  AND ('@_user_id' = 'All' OR '@_user_id' = '' OR u.id::text = '@_user_id')
  AND ('@_reporting_manager_id' = 'All' OR '@_reporting_manager_id' = '' 
       OR u.reporting_to_id::text = '@_reporting_manager_id' 
       OR t.leader_id::text = '@_reporting_manager_id'
       OR rm.username ILIKE '@_reporting_manager_id'
       OR tl.username ILIKE '@_reporting_manager_id'
       OR CONCAT(rm.first_name, ' ', COALESCE(rm.last_name, '')) ILIKE '%' || '@_reporting_manager_id' || '%'
       OR CONCAT(tl.first_name, ' ', COALESCE(tl.last_name, '')) ILIKE '%' || '@_reporting_manager_id' || '%')
ORDER BY COALESCE(followup_stats.due_today, 0) DESC, u.first_name ASC
LIMIT @_limit OFFSET (@_page - 1) * @_limit;"""

CollectionQuery.objects.update_or_create(key='R_USER_FOLLOWUP_REPORT', defaults={'query': sql})
CollectionQuery.objects.update_or_create(key='R_USER_FOLLOWUP', defaults={'query': sql})
print("CollectionQueries R_USER_FOLLOWUP_REPORT saved successfully!")
