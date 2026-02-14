"""
Services package
"""

from app.services.user_service import UserService
from app.services.ai_service import AIService
from app.services.chat_service import ChatService
from app.services.project_service import ProjectService
from app.services.milestone_service import MilestoneService
from app.services.task_service import TaskService
from app.services.deployment_service import DeploymentService
from app.services.learning_service import LearningService
from app.services.dashboard_service import DashboardService
from app.services.activity_service import ActivityService

__all__ = [
    "UserService",
    "AIService",
    "ChatService",
    "ProjectService",
    "MilestoneService",
    "TaskService",
    "DeploymentService",
    "LearningService",
    "DashboardService",
    "ActivityService",
]
