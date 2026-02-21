// ============================================
// ENUMS
// ============================================

export type AIBranch =
  | "GENAI_LLM"
  | "ML_TRADITIONAL"
  | "COMPUTER_VISION"
  | "NLP"
  | "REINFORCEMENT_LEARNING"
  | "MLOPS"
  | "DATA_ENGINEERING"
  | "OTHER";

export type ProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED"
  | "DELETED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MilestoneStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "SKIPPED";

export type DeliverableType =
  | "MVP"
  | "FEATURE"
  | "INTEGRATION"
  | "DEPLOYMENT"
  | "DOCUMENTATION"
  | "RESEARCH"
  | "OTHER";

export type TaskStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "BLOCKED"
  | "COMPLETED"
  | "CANCELLED";

export type TaskType =
  | "DEVELOPMENT"
  | "PROMPT_ENGINEERING"
  | "FRONTEND"
  | "BACKEND"
  | "DEPLOYMENT"
  | "RESEARCH"
  | "TESTING"
  | "DOCUMENTATION"
  | "DESIGN"
  | "DATA_WORK"
  | "INTEGRATION"
  | "OTHER";

export type Complexity = "TRIVIAL" | "EASY" | "MEDIUM" | "HARD" | "COMPLEX";

export type Environment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export type DeploymentStatus =
  | "PREPARING"
  | "DEPLOYING"
  | "ACTIVE"
  | "DEPRECATED"
  | "ROLLED_BACK"
  | "FAILED";

export type LearningCategory =
  | "PROMPT_ENGINEERING"
  | "RAG_RETRIEVAL"
  | "FINE_TUNING"
  | "MODEL_SELECTION"
  | "EMBEDDINGS"
  | "AGENTS"
  | "EVALUATION"
  | "DATA_PROCESSING"
  | "MLOPS"
  | "DEPLOYMENT"
  | "UX_PATTERNS"
  | "ARCHITECTURE"
  | "PERFORMANCE"
  | "SECURITY"
  | "COST_OPTIMIZATION"
  | "OTHER";

export type ConfidenceLevel =
  | "EXPLORING"
  | "LEARNING"
  | "PRACTICING"
  | "CONFIDENT"
  | "EXPERT";

// ============================================
// PROJECTS
// ============================================

export interface Project {
  id: string;
  display_id: string;
  name: string;
  description?: string;
  team_name?: string;
  ai_branch: AIBranch;
  sub_domain?: string;
  problem_statement: string;
  target_user: string;
  technologies: string[];
  tech_stack?: Record<string, unknown>;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  start_date?: string;
  target_date?: string;
  completed_date?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  team_name?: string;
  ai_branch: AIBranch;
  sub_domain?: string;
  problem_statement: string;
  target_user: string;
  technologies?: string[];
  tech_stack?: Record<string, unknown>;
  priority?: Priority;
  start_date?: string;
  target_date?: string;
  tags?: string[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  team_name?: string;
  ai_branch?: AIBranch;
  sub_domain?: string;
  problem_statement?: string;
  target_user?: string;
  technologies?: string[];
  status?: ProjectStatus;
  priority?: Priority;
  start_date?: string;
  target_date?: string;
  tags?: string[];
}

// ============================================
// MILESTONES
// ============================================

export interface Milestone {
  id: string;
  project_id: string;
  order_index: number;
  milestone_number: number;
  name: string;
  description?: string;
  deliverable: string;
  deliverable_type: DeliverableType;
  success_criteria: string;
  status: MilestoneStatus;
  progress: number;
  start_date?: string;
  target_date?: string;
  completed_date?: string;
  depends_on: string[];
  created_at: string;
  updated_at: string;
}

export interface MilestoneCreate {
  name: string;
  description?: string;
  deliverable: string;
  deliverable_type?: DeliverableType;
  success_criteria: string;
  start_date?: string;
  target_date?: string;
  depends_on?: string[];
}

export interface MilestoneUpdate {
  name?: string;
  description?: string;
  deliverable?: string;
  deliverable_type?: DeliverableType;
  success_criteria?: string;
  status?: MilestoneStatus;
  progress?: number;
  start_date?: string;
  target_date?: string;
}

// ============================================
// TASKS
// ============================================

export interface Task {
  id: string;
  milestone_id: string;
  order_index: number;
  task_number: string;
  title: string;
  description?: string;
  task_type: TaskType;
  tech_component: string;
  complexity: Complexity;
  estimated_hours?: number;
  actual_hours?: number;
  status: TaskStatus;
  blockers?: string;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  task_type: TaskType;
  tech_component: string;
  complexity?: Complexity;
  estimated_hours?: number;
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  task_type?: TaskType;
  tech_component?: string;
  complexity?: Complexity;
  estimated_hours?: number;
  actual_hours?: number;
  status?: TaskStatus;
  blockers?: string;
  notes?: string;
  due_date?: string;
}

// ============================================
// DEPLOYMENTS
// ============================================

export interface DeploymentMetrics {
  id: string;
  deployment_id: string;
  avg_response_time?: number;
  p95_response_time?: number;
  uptime_percentage?: number;
  accuracy_rate?: number;
  error_rate?: number;
  total_requests?: number;
  unique_users?: number;
  user_satisfaction?: number;
  nps_score?: number;
}

export interface Deployment {
  id: string;
  project_id: string;
  version: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
  release_notes?: string;
  deploy_date: string;
  environment: Environment;
  access_url?: string;
  github_repo?: string;
  commit_hash?: string;
  testers_count: number;
  tester_emails: string[];
  feedback_summary?: string;
  critical_bugs?: string;
  next_improvements?: string;
  status: DeploymentStatus;
  metrics?: DeploymentMetrics;
  created_at: string;
  updated_at: string;
}

export interface DeploymentCreate {
  version: string;
  version_major: number;
  version_minor: number;
  version_patch?: number;
  release_notes?: string;
  deploy_date?: string;
  environment?: Environment;
  access_url?: string;
  github_repo?: string;
  commit_hash?: string;
}

export interface DeploymentUpdate {
  release_notes?: string;
  environment?: Environment;
  access_url?: string;
  feedback_summary?: string;
  critical_bugs?: string;
  next_improvements?: string;
  status?: DeploymentStatus;
  tester_emails?: string[];
}

// ============================================
// LEARNINGS
// ============================================

export interface Learning {
  id: string;
  user_id: string;
  project_id?: string;
  milestone_number?: number;
  concept: string;
  category: LearningCategory;
  subcategory?: string;
  what_learned: string;
  when_to_use: string;
  when_not_to_use: string;
  implemented_in: string;
  code_snippets?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  related_concepts: string[];
  tags: string[];
  confidence_level: ConfidenceLevel;
  date_learned: string;
  last_reviewed?: string;
  next_review_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LearningCreate {
  concept: string;
  category: LearningCategory;
  subcategory?: string;
  what_learned: string;
  when_to_use: string;
  when_not_to_use: string;
  implemented_in: string;
  project_id?: string;
  milestone_number?: number;
  code_snippets?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  related_concepts?: string[];
  tags?: string[];
  confidence_level?: ConfidenceLevel;
}

export interface LearningUpdate {
  concept?: string;
  category?: LearningCategory;
  subcategory?: string;
  what_learned?: string;
  when_to_use?: string;
  when_not_to_use?: string;
  implemented_in?: string;
  confidence_level?: ConfidenceLevel;
  related_concepts?: string[];
  tags?: string[];
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_milestones: number;
  completed_milestones: number;
  total_tasks: number;
  completed_tasks: number;
  total_deployments: number;
  total_learnings: number;
  current_streak: number;
}

export interface ActivityFeedItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  new_value?: Record<string, unknown>;
  created_at: string;
}

export interface ActivityFeedResponse {
  activities: ActivityFeedItem[];
  total: number;
}

// ============================================
// CHAT
// ============================================

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  model_used?: string;
  tokens_used: number;
  sequence_number: number;
  created_at: string;
  action?: string;
  action_data?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  user_id: string;
  project_id?: string;
  title?: string;
  status: string;
  session_type?: string;
  total_messages: number;
  total_tokens: number;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface CreateSessionData {
  title?: string;
  project_id?: string;
  milestone_id?: string;
  task_id?: string;
  session_type?: string;
}

export interface SendMessageData {
  content: string;
}

export interface UpdateSessionData {
  title?: string;
  status?: string;
}

export interface ExtractedLearning {
  concept: string;
  category: string;
  what_learned: string;
  when_to_use: string;
  when_not_to_use: string;
  confidence_level: string;
}

export interface ExtractLearningResponse {
  learnings: ExtractedLearning[];
  session_id: string;
}
