"""
Pydantic schemas package
"""

from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserProfile,
    ClerkWebhookUser,
)

from app.schemas.chat import (
    MessageRole,
    ChatMessageBase,
    ChatSessionBase,
    ChatSessionCreate,
    ChatMessageCreate,
    SendMessageRequest,
    ChatSessionUpdate,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatSessionWithMessagesResponse,
    ExtractLearningRequest,
    ExtractedLearning,
    ExtractLearningResponse,
    StreamChunk,
    OpenFreeExport,
)

from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
)

from app.schemas.milestone import (
    MilestoneCreate,
    MilestoneUpdate,
    MilestoneResponse,
)

from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
)

from app.schemas.deployment import (
    DeploymentMetricsCreate,
    DeploymentMetricsResponse,
    DeploymentCreate,
    DeploymentUpdate,
    DeploymentResponse,
)

from app.schemas.learning import (
    LearningCreate,
    LearningUpdate,
    LearningResponse,
    LearningSearchParams,
)

from app.schemas.dashboard import (
    DashboardStats,
    ActivityFeedItem,
    ActivityFeedResponse,
)

__all__ = [
    # User
    "UserBase", "UserCreate", "UserUpdate", "UserResponse",
    "UserProfile", "ClerkWebhookUser",
    # Chat
    "MessageRole", "ChatMessageBase", "ChatSessionBase",
    "ChatSessionCreate", "ChatMessageCreate", "SendMessageRequest",
    "ChatSessionUpdate", "ChatMessageResponse", "ChatSessionResponse",
    "ChatSessionWithMessagesResponse",
    "ExtractLearningRequest", "ExtractedLearning", "ExtractLearningResponse",
    "StreamChunk", "OpenFreeExport",
    # Project
    "ProjectCreate", "ProjectUpdate", "ProjectResponse", "ProjectListResponse",
    # Milestone
    "MilestoneCreate", "MilestoneUpdate", "MilestoneResponse",
    # Task
    "TaskCreate", "TaskUpdate", "TaskResponse",
    # Deployment
    "DeploymentMetricsCreate", "DeploymentMetricsResponse",
    "DeploymentCreate", "DeploymentUpdate", "DeploymentResponse",
    # Learning
    "LearningCreate", "LearningUpdate", "LearningResponse", "LearningSearchParams",
    # Dashboard
    "DashboardStats", "ActivityFeedItem", "ActivityFeedResponse",
]
