"""
AI Service using Google Gemini API
"""

import json
from typing import List, Dict, Tuple, Optional

from google import genai
from google.genai import types

from app.core.config import settings


PRODUCT_CONTEXT = """You are the AI assistant for Umbral, an AI Learning Vault platform built by the AI PlayGrounds community (part of LooperTech).

Umbral helps users learn AI/ML concepts through hands-on product building. Users maintain personal "vaults" containing their project ideas, milestones, tasks, deployments, and documented learnings.

When referring to the platform, call it "Umbral" or "your vault".
When referring to the community, call it "AI PlayGrounds".
"""


class AIService:

    @staticmethod
    def get_client() -> genai.Client:
        return genai.Client(api_key=settings.GEMINI_API_KEY)

    @staticmethod
    def build_system_prompt(user_context: Optional[Dict] = None) -> str:
        prompt = PRODUCT_CONTEXT

        if not user_context:
            return prompt

        user_name = user_context.get("user_name", "User")
        prompt += f"\n## USER CONTEXT\n\n**User:** {user_name}\n"

        projects = user_context.get("projects", [])
        if projects:
            prompt += "\n**Active Projects:**\n"
            for p in projects:
                prompt += f"- {p['display_id']}: {p['name']} ({p['ai_branch']}, {round(p['progress'] * 100)}% complete)\n"
                if p.get("technologies"):
                    prompt += f"  Technologies: {', '.join(p['technologies'])}\n"

        current = user_context.get("current_project")
        if current:
            prompt += f"\n**Current Focus: {current['name']}**\n"
            prompt += f"Problem: {current['problem_statement']}\n"
            prompt += f"Target User: {current['target_user']}\n"

            milestones = current.get("milestones", [])
            if milestones:
                prompt += "\nMilestones:\n"
                for m in milestones:
                    prompt += f"  {m['milestone_number']}. {m['name']} - {m['status']}\n"
                    prompt += f"     Deliverable: {m['deliverable']}\n"

        learnings = user_context.get("recent_learnings", [])
        if learnings:
            prompt += "\n**Recent Learnings:**\n"
            for l in learnings:
                prompt += f"- {l['concept']} ({l['category']})\n"

        prompt += """
## YOUR ROLE

1. **Technical Assistant**: Help troubleshoot issues with their specific stack
2. **Learning Guide**: Explain concepts with practical examples
3. **Progress Coach**: Encourage shipping deployed versions
4. **Knowledge Connector**: Link new concepts to existing learnings

## GUIDELINES

- Be practical, not theoretical
- Reference their actual projects when relevant
- Always include "When to use" and "When NOT to use" for concepts
- Encourage small, deployable increments
- Use terminal-style formatting for commands: `command here`
- Keep responses focused and actionable
"""
        return prompt

    @staticmethod
    async def generate_response(
        messages: List[Dict[str, str]],
        user_context: Optional[Dict] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> Tuple[str, int]:
        client = AIService.get_client()
        system_prompt = AIService.build_system_prompt(user_context)

        if max_tokens is None:
            max_tokens = settings.MAX_TOKENS_PER_REQUEST
        if temperature is None:
            temperature = settings.AI_TEMPERATURE

        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg["content"])],
            ))

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=max_tokens,
                temperature=temperature,
            ),
        )

        content = response.text or ""
        tokens_used = 0
        if response.usage_metadata:
            tokens_used = (
                (response.usage_metadata.prompt_token_count or 0)
                + (response.usage_metadata.candidates_token_count or 0)
            )

        return content, tokens_used

    @staticmethod
    async def extract_learnings_from_chat(
        messages: List[Dict[str, str]],
    ) -> List[Dict]:
        client = AIService.get_client()

        conversation_text = "\n".join(
            f"[{m['role']}]: {m['content']}" for m in messages
        )

        extract_prompt = f"""Analyze this conversation and extract key learnings that the user gained.
For each learning, provide a JSON object with these fields:
- concept: Short name of the concept learned
- category: One of: PROMPT_ENGINEERING, RAG_RETRIEVAL, FINE_TUNING, MODEL_SELECTION, EMBEDDINGS, AGENTS, EVALUATION, DATA_PROCESSING, MLOPS, DEPLOYMENT, UX_PATTERNS, ARCHITECTURE, PERFORMANCE, SECURITY, COST_OPTIMIZATION, OTHER
- what_learned: What was learned (2-3 sentences)
- when_to_use: When to use this concept
- when_not_to_use: When NOT to use this concept

Return a JSON array of learning objects. Only include genuine learnings, not simple Q&A.

Conversation:
{conversation_text}"""

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[types.Content(
                role="user",
                parts=[types.Part.from_text(text=extract_prompt)],
            )],
            config=types.GenerateContentConfig(
                system_instruction="You are a learning extraction assistant. Always respond with valid JSON arrays only, no markdown formatting.",
                max_output_tokens=2000,
                temperature=0.3,
            ),
        )

        try:
            text = response.text or "[]"
            # Strip markdown code fences if present
            text = text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                text = text.rsplit("```", 1)[0]
            return json.loads(text)
        except (json.JSONDecodeError, IndexError):
            return []
