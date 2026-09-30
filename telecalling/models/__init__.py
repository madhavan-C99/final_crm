from .call_details import CallDetails
from .collection_query import CollectionQuery
from .courses import Course,CoursePlan,CourseName,CourseTiming
from .disconnectdetails import DisconnectedDetails
from .leads import *
from .paymentinfo import PaymentInfo,PaymentFollowUp,PaymentHistory
# from .perm import Perm
# from .role import Role
from adm.models import User
from .follow_up import FollowUp
from .user_settings import UserSettings
from .notification import Notification,MissedFollowUpHistory
from .lose_lead import LossLeadDetail
from .loss_reason import LossReason
from .api_log import ApiLog
from .delete_base_model import SafeDeleteModel
from .deleted_data_log import DeletedDataLog
from .daily_report_history import DailyReport