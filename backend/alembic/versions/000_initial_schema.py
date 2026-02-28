"""Create all tables - initial schema

Revision ID: 000_initial
Revises:
Create Date: 2026-02-14
"""
from typing import Sequence, Union

from alembic import op # type: ignore
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "000_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Users ---
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("email", sa.String(), unique=True, nullable=False, index=True),
        sa.Column("first_name", sa.String(), nullable=True),
        sa.Column("last_name", sa.String(), nullable=True),
        sa.Column("username", sa.String(), unique=True, nullable=True, index=True),
        sa.Column("profile_image_url", sa.String(), nullable=True),
        sa.Column("timezone", sa.String(50), server_default="UTC", nullable=False),
        sa.Column("preferences", sa.JSON(), server_default="{}", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("email_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
    )

    # --- User Stats ---
    op.create_table(
        "user_stats",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("total_projects", sa.Integer(), server_default="0", nullable=False),
        sa.Column("active_projects", sa.Integer(), server_default="0", nullable=False),
        sa.Column("completed_projects", sa.Integer(), server_default="0", nullable=False),
        sa.Column("total_milestones", sa.Integer(), server_default="0", nullable=False),
        sa.Column("completed_milestones", sa.Integer(), server_default="0", nullable=False),
        sa.Column("total_tasks", sa.Integer(), server_default="0", nullable=False),
        sa.Column("completed_tasks", sa.Integer(), server_default="0", nullable=False),
        sa.Column("total_deployments", sa.Integer(), server_default="0", nullable=False),
        sa.Column("total_learnings", sa.Integer(), server_default="0", nullable=False),
        sa.Column("current_streak", sa.Integer(), server_default="0", nullable=False),
        sa.Column("longest_streak", sa.Integer(), server_default="0", nullable=False),
        sa.Column("last_activity_date", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )

    # --- Projects ---
    ai_branch = postgresql.ENUM(
        "GENAI_LLM", "ML_TRADITIONAL", "COMPUTER_VISION", "NLP",
        "REINFORCEMENT_LEARNING", "MLOPS", "DATA_ENGINEERING", "OTHER",
        name="aibranch", create_type=True,
    )
    project_status = postgresql.ENUM(
        "PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "ARCHIVED",
        name="projectstatus", create_type=True,
    )
    priority = postgresql.ENUM(
        "LOW", "MEDIUM", "HIGH", "CRITICAL",
        name="priority", create_type=True,
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("display_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("team_name", sa.String(255), nullable=True),
        sa.Column("ai_branch", ai_branch, nullable=False),
        sa.Column("sub_domain", sa.String(255), nullable=True),
        sa.Column("problem_statement", sa.Text(), nullable=False),
        sa.Column("target_user", sa.Text(), nullable=False),
        sa.Column("target_user_persona", sa.JSON(), nullable=True),
        sa.Column("technologies", postgresql.ARRAY(sa.String()), server_default="{}", nullable=True),
        sa.Column("tech_stack", sa.JSON(), nullable=True),
        sa.Column("status", project_status, server_default="PLANNED", nullable=False, index=True),
        sa.Column("priority", priority, server_default="MEDIUM", nullable=False),
        sa.Column("progress", sa.Float(), server_default="0.0", nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=True),
        sa.Column("target_date", sa.DateTime(), nullable=True),
        sa.Column("completed_date", sa.DateTime(), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String()), server_default="{}", nullable=True),
        sa.Column("external_links", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("user_id", "display_id", name="uq_user_display_id"),
    )

    # --- Milestones ---
    deliverable_type = postgresql.ENUM(
        "MVP", "FEATURE", "INTEGRATION", "DEPLOYMENT", "DOCUMENTATION", "RESEARCH", "OTHER",
        name="deliverabletype", create_type=True,
    )
    milestone_status = postgresql.ENUM(
        "PLANNED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "SKIPPED",
        name="milestonestatus", create_type=True,
    )

    op.create_table(
        "milestones",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("milestone_number", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("deliverable", sa.Text(), nullable=False),
        sa.Column("deliverable_type", deliverable_type, nullable=False),
        sa.Column("success_criteria", sa.Text(), nullable=False),
        sa.Column("metrics", sa.JSON(), nullable=True),
        sa.Column("status", milestone_status, server_default="PLANNED", nullable=False),
        sa.Column("progress", sa.Float(), server_default="0.0", nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=True),
        sa.Column("target_date", sa.DateTime(), nullable=True),
        sa.Column("completed_date", sa.DateTime(), nullable=True),
        sa.Column("depends_on", postgresql.ARRAY(sa.String()), server_default="{}", nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("project_id", "milestone_number", name="uq_project_milestone_number"),
    )

    # --- Tasks ---
    task_type = postgresql.ENUM(
        "DEVELOPMENT", "PROMPT_ENGINEERING", "FRONTEND", "BACKEND", "DEPLOYMENT",
        "RESEARCH", "TESTING", "DOCUMENTATION", "DESIGN", "DATA_WORK", "INTEGRATION", "OTHER",
        name="tasktype", create_type=True,
    )
    complexity = postgresql.ENUM(
        "TRIVIAL", "EASY", "MEDIUM", "HARD", "COMPLEX",
        name="complexity", create_type=True,
    )
    task_status = postgresql.ENUM(
        "PLANNED", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "COMPLETED", "CANCELLED",
        name="taskstatus", create_type=True,
    )

    op.create_table(
        "tasks",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("milestone_id", sa.String(), sa.ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("task_number", sa.String(20), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("task_type", task_type, nullable=False),
        sa.Column("tech_component", sa.String(255), nullable=False),
        sa.Column("complexity", complexity, server_default="MEDIUM", nullable=False),
        sa.Column("estimated_hours", sa.Float(), nullable=True),
        sa.Column("actual_hours", sa.Float(), nullable=True),
        sa.Column("status", task_status, server_default="PLANNED", nullable=False, index=True),
        sa.Column("blockers", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("due_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )

    # --- Deployments ---
    environment = postgresql.ENUM(
        "DEVELOPMENT", "STAGING", "PRODUCTION",
        name="environment", create_type=True,
    )
    deployment_status = postgresql.ENUM(
        "PREPARING", "DEPLOYING", "ACTIVE", "DEPRECATED", "ROLLED_BACK", "FAILED",
        name="deploymentstatus", create_type=True,
    )

    op.create_table(
        "deployments",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("version", sa.String(50), nullable=False),
        sa.Column("version_major", sa.Integer(), nullable=False),
        sa.Column("version_minor", sa.Integer(), nullable=False),
        sa.Column("version_patch", sa.Integer(), server_default="0", nullable=False),
        sa.Column("release_notes", sa.Text(), nullable=True),
        sa.Column("deploy_date", sa.DateTime(), nullable=False),
        sa.Column("environment", environment, server_default="STAGING", nullable=False),
        sa.Column("access_url", sa.String(500), nullable=True),
        sa.Column("github_repo", sa.String(500), nullable=True),
        sa.Column("commit_hash", sa.String(40), nullable=True),
        sa.Column("testers_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("tester_emails", postgresql.ARRAY(sa.String()), server_default="{}", nullable=True),
        sa.Column("feedback_summary", sa.Text(), nullable=True),
        sa.Column("feedback_items", sa.JSON(), nullable=True),
        sa.Column("critical_bugs", sa.Text(), nullable=True),
        sa.Column("bug_items", sa.JSON(), nullable=True),
        sa.Column("next_improvements", sa.Text(), nullable=True),
        sa.Column("improvements", sa.JSON(), nullable=True),
        sa.Column("status", deployment_status, server_default="ACTIVE", nullable=False, index=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("deprecated_at", sa.DateTime(), nullable=True),
    )

    # --- Deployment Metrics ---
    op.create_table(
        "deployment_metrics",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("deployment_id", sa.String(), sa.ForeignKey("deployments.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("avg_response_time", sa.Float(), nullable=True),
        sa.Column("p95_response_time", sa.Float(), nullable=True),
        sa.Column("uptime_percentage", sa.Float(), nullable=True),
        sa.Column("accuracy_rate", sa.Float(), nullable=True),
        sa.Column("error_rate", sa.Float(), nullable=True),
        sa.Column("total_requests", sa.Integer(), nullable=True),
        sa.Column("unique_users", sa.Integer(), nullable=True),
        sa.Column("user_satisfaction", sa.Float(), nullable=True),
        sa.Column("nps_score", sa.Integer(), nullable=True),
        sa.Column("custom_metrics", sa.JSON(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )

    # --- Learnings ---
    learning_category = postgresql.ENUM(
        "PROMPT_ENGINEERING", "RAG_RETRIEVAL", "FINE_TUNING", "MODEL_SELECTION",
        "EMBEDDINGS", "AGENTS", "EVALUATION", "DATA_PROCESSING", "MLOPS",
        "DEPLOYMENT", "UX_PATTERNS", "ARCHITECTURE", "PERFORMANCE", "SECURITY",
        "COST_OPTIMIZATION", "OTHER",
        name="learningcategory", create_type=True,
    )
    confidence_level = postgresql.ENUM(
        "EXPLORING", "LEARNING", "PRACTICING", "CONFIDENT", "EXPERT",
        name="confidencelevel", create_type=True,
    )

    op.create_table(
        "learnings",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("milestone_number", sa.Integer(), nullable=True),
        sa.Column("concept", sa.String(255), nullable=False),
        sa.Column("category", learning_category, nullable=False, index=True),
        sa.Column("subcategory", sa.String(255), nullable=True),
        sa.Column("what_learned", sa.Text(), nullable=False),
        sa.Column("when_to_use", sa.Text(), nullable=False),
        sa.Column("when_not_to_use", sa.Text(), nullable=False),
        sa.Column("implemented_in", sa.String(255), nullable=False),
        sa.Column("code_snippets", sa.JSON(), nullable=True),
        sa.Column("resources", sa.JSON(), nullable=True),
        sa.Column("related_concepts", postgresql.ARRAY(sa.String()), server_default="{}", nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String()), server_default="{}", nullable=True),
        sa.Column("confidence_level", confidence_level, server_default="LEARNING", nullable=False),
        sa.Column("date_learned", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_reviewed", sa.DateTime(), nullable=True),
        sa.Column("next_review_date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )

    # --- Chat Sessions ---
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), server_default="active", nullable=False),
        sa.Column("session_type", sa.String(50), server_default="general", nullable=False),
        sa.Column("total_messages", sa.Integer(), server_default="0", nullable=False),
        sa.Column("total_tokens", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_message_at", sa.DateTime(), nullable=True),
    )

    # --- Chat Messages ---
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("session_id", sa.String(), sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("model_used", sa.String(50), nullable=True),
        sa.Column("tokens_used", sa.Integer(), server_default="0", nullable=False),
        sa.Column("teaching_method", sa.String(50), nullable=True),
        sa.Column("sequence_number", sa.Integer(), nullable=False),
        sa.Column("parent_message_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )

    # --- Activity Logs ---
    op.create_table(
        "activity_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.String(), nullable=True),
        sa.Column("previous_value", sa.JSON(), nullable=True),
        sa.Column("new_value", sa.JSON(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False, index=True),
    )


def downgrade() -> None:
    op.drop_table("activity_logs")
    op.drop_table("chat_messages")
    op.drop_table("chat_sessions")
    op.drop_table("learnings")
    op.drop_table("deployment_metrics")
    op.drop_table("deployments")
    op.drop_table("tasks")
    op.drop_table("milestones")
    op.drop_table("projects")
    op.drop_table("user_stats")
    op.drop_table("users")

    # Drop enum types
    for enum_name in [
        "confidencelevel", "learningcategory", "deploymentstatus", "environment",
        "taskstatus", "complexity", "tasktype", "milestonestatus", "deliverabletype",
        "priority", "projectstatus", "aibranch",
    ]:
        op.execute(f"DROP TYPE IF EXISTS {enum_name}")
