# **Umbral EdTech App – Project Requirements**
## **Overview**
**Umbral** is an AI-powered educational platform that revolutionizes learning by providing personalized, visual, and open access to knowledge.

The platform enables students to learn through **interactive concept graphs**, **multiple teaching methodologies**, and **AI-driven explanations** while maintaining **full ownership** and **portability** of their learning data through the **OpenFree context and memory export** system.

### **Core Value Proposition**
- OpenFree context and memory (downloadable and shareable).
- Visual concept mapping through interactive graphs.
- Multiple AI model selection.
- Personalized teaching methods (practical cases, concepts, analogies).
- Adaptive learning for different levels and topics.
- Generated learning roadmap and specific topic entry points.
- Optional voice and video narration by AI tutors.

## **Core Functionalities**
### **1. AI-Powered Chat System with Model Selection**
**Description:**  
Intelligent conversational interface allowing students to ask questions and receive explanations from AI tutors.

**Key Features:**
- Multi-model AI support (GPT-4, Claude, Llama, custom models).
- Real-time chat interface with context retention.
- Teaching method selection (practical, conceptual, analogical, step-by-step).
- Message history with full transcription.
- Code generation and image creation capabilities.
- Optional voice and video narration.
- Download conversation feature.
- OpenFree format export.

**User Roles:**  
Students, AI Tutor System, Administrators.

### **2. Interactive Concept Graph Visualization**
**Description:**  
Visual representation of knowledge domains showing how general concepts expand into specific topics.

**Key Features:**
- Interactive node-based graph.
- Three-tier structure: Core Concepts → Fundamental Pillars → Specific Subtopics.
- Click-to-explore (chat per concept).
- Expandable/collapsible nodes.
- Pan, zoom, and reorganize.
- Save and share maps.
- Visual connection lines between concepts.

**User Roles:**  
Students, Administrators.

### **3. Personalized Learning Library**

**Description:**  
Curated library of concepts organized by career and subject area.

**Key Features:**
- Career-specific concept databases.
- Categorization by subject and difficulty.
- Search and filter features.
- Bookmark and favorites.
- Progress tracking per concept.
- Related concepts suggestions.

**User Roles:**  
Students, Administrators.

### **4. Adaptive Course Generation**
**Description:**  
AI-generated personalized learning paths based on user goals and knowledge level.

**Key Features:**
- Knowledge-level assessment.
- Goal-setting interface.
- Dynamic curriculum generator.
- Progressive difficulty.
- Milestone tracking.
- Recommended learning sequences.

**User Roles:**  
Students, AI Tutor System.

### **5. Multi-Modal Content Delivery (Optional)**
**Description:**  
Concepts explained using different media for diverse learning preferences.

**Key Features:**
- Text-to-speech narration.
- AI-generated or curated video tutorials.
- Audio playback controls.
- Subtitles and captions.
- Offline downloads.
- Multi-language support.

**User Roles:**  
Students, Content Creators.

### **6. Comprehensive Progress Tracking**
**Description:**  
System for tracking learning progress and identifying improvement areas.

**Key Features:**
- Concept mastery visualization.
- Time tracking per topic.
- Assessment and quiz scores.
- Learning streak tracking.
- Visual progress dashboards.
- Personalized recommendations.

**User Roles:**  
Students, Teachers/Instructors.

### **7. OpenFree Context & Memory System (Core Feature)**
**Description:**  
Data portability mechanics enabling full user ownership of learning data.

**Key Features:**
- Export all chat conversations in open format.
- Download complete learning history.
- Share learning paths.
- Import/export progress data.
- No vendor lock-in.
- API for third-party integration.
- Backup and restore functionality.

**User Roles:**  
Students, System Administrators.

### **8. Comprehension Evaluation System**
**Description:**  
Adaptive quizzes to verify understanding of learned concepts.

**Key Features:**
- Dynamic, topic-based question generation.
- Multiple question types.
- Immediate feedback and retry.
- Difficulty adjustment.
- Explanations for incorrect answers.

**User Roles:**  
Students, AI System.

### **9. Code and Visual Content Generation**
**Description:**  
Generative AI utilities for programming and visual learning assistance.

**Key Features:**
- Code snippet generation.
- Syntax highlighting and execution.
- Diagram and flowchart generation.
- Image creation for concepts.
- Interactive code playgrounds.
- Copy/download generated content.

**User Roles:**  
Students, AI System.

### **10. Concept-Database Integration**
**Description:**  
AI backend for semantic knowledge management and retrieval.

**Key Features:**
- Semantic search across concept base.
- Relationship mapping between concepts.
- Dynamic content retrieval.
- Version control.
- Multi-language support.
- Caching optimization.

**User Roles:**  
All Users, System Backend.

### **11. Smart Search and Reference**
**Description:**  
Advanced research and content indexing throughout the learning experience.

**Key Features:**
- Full-text search across chat and notes.
- Filtering by date, topic, or concept.
- Search inside learning paths.
- Highlight and annotation support.
- Quick access to frequent topics.

**User Roles:**  
Students.

### **12. Collaboration Features**
**Description:**  
Enabling social, peer-based, and group learning.

**Key Features:**
- Share OpenFree data packages.
- Collaborative concept mapping.
- Study group creation.
- Concept-level discussion forums.
- Peer learning recommendations.

**User Roles:**  
Students, Teachers/Instructors.

## **Technical Requirements**
### **Platform**
- **Primary:** Web application (responsive).
- **Secondary:** Mobile apps (PWA, Android/iOS).
- **Future:** Desktop app (Electron).

### **Frontend**
- Framework: **React.js** or **Next.js**.
- UI Library: **Tailwind CSS + shadcn/ui**.
- Visualization: **D3.js** or **Cytoscape.js**.
- State Management: **Redux Toolkit** or **Zustand**.
- Real-time: **Socket.io** or **WebSockets**.

### **Backend**
- API Framework: **Node.js (Express.js)** or **Python (FastAPI)**.
- Real-time: **Socket.io / WebSocket server**.
- File Storage: **AWS S3** (or equivalent).
- Background Jobs: **Bull Queue** or **Celery**.

### **AI Integration**
- Models: OpenAI (GPT-4), Anthropic (Claude), Meta Llama, Cohere.
- Model router/selector logic for multi-model support.

### **Database**
- Primary: **PostgreSQL**.
- Vector: **Pinecone** or **Weaviate**.
- Cache: **Redis**.
- Document: **MongoDB** or PostgreSQL **JSONB**.

### **Authentication & Security**
- JWT-based authentication.
- OAuth (Google, Microsoft, Apple).
- Redis-backed sessions.
- bcrypt password hashing.
- Rate limiting & CORS.
- GDPR and COPPA compliance.

### **Third-party Integrations**
- Payments: **Stripe / PayPal**.
- Analytics: **Mixpanel / Amplitude**.
- Monitoring: **Sentry, DataDog, New Relic**.
- Email: **SendGrid / AWS SES**.
- Voice/Video: **ElevenLabs / Google TTS / Synthesia**.
- CDN: **Cloudflare**.
- Data Export: Custom **OpenFree JSON spec**.

### **Infrastructure**
- Hosting: **AWS / GCP / Azure**.
- Orchestration: **Docker + Kubernetes / ECS**.
- CI/CD: **GitHub Actions / GitLab CI**.
- Load balancing: **Nginx / Cloud-native**.
- Backups: Automated daily with point-in-time recovery.

## **User Roles**
| Role | Description |
|------|--------------|
| **Students** | Primary users; access learning features and data export. |
| **Teachers/Instructors** | Curate content, monitor progress, and guide learners. |
| **Content Administrators** | Manage and verify concept database and content quality. |
| **System Administrators** | Handle infrastructure, security, and data management. |
| **Parents (Future)** | View progress, set learning goals and restrictions. |

## **Non-Functional Requirements**
### **Performance**
- Page load time < 2 seconds.
- AI response time < 5 seconds.
- 10,000+ concurrent users.
- 99.9% uptime SLA.

### **Scalability**
- Horizontally scalable.
- Auto-scaling.
- Database sharding-ready.
- CDN for static delivery.

### **Security**
- End-to-end encryption.
- Regular audits.
- Data anonymization options.
- Secure API key management.

### **Accessibility**
- WCAG 2.1 Level AA compliant.
- Screen reader & keyboard navigation.
- High contrast mode.
- i18n multi-language support.

## **Data Portability: OpenFree Standard**
**Key Principles:**
- JSON-based export format.
- Full data export within 24h.
- Import functionality.
- Third-party API documentation.
- Version-controlled specifications.

## **Monetization Strategy**
### **Free Tier**
- Limited AI interactions.
- Basic concept libraries.
- Standard models.
- Community support.

### **Premium Tier**
- Unlimited AI usage.
- Newest/best models.
- Multimedia features.
- Priority support.
- Analytics and collaboration tools.

### **Enterprise/Education**
- Custom deployments.
- White-label options.
- Institutional dashboards.
- Bulk user management.
- SLA guarantees.

## **Additional Notes**
### **OpenFree Format Specification**
Includes:
- Chat transcripts with timestamps.
- User preferences.
- Progress and mastery levels.
- Learning paths.
- Assessments.
- Metadata for third-party use.

### **Ethical AI Considerations**
- AI transparency and explainability.
- Bias mitigation.
- Age-appropriate filtering.
- Human oversight.
- Privacy-first design.

### **Accessibility Priority**
- Accessibility built-in from design stage.
- Continuous audits and user feedback.
- Integration with assistive technologies.

### **Future Considerations**
- Virtual Reality (VR) and Augmented Reality (AR) modules.
- Gamification (badges, streaks, achievements).
- Social learning networks.
- Live tutoring sessions.
- LMS integration (Canvas, Moodle, Blackboard).

### **Constraints**
- Mandatory data portability.
- Manageable AI operational costs.
- Regulation compliance for educational data.
- Cultural and inclusivity standards.
- Low-bandwidth compatibility (offline mode).
