"""
AI Service for multi-model support via OpenRouter
"""

from typing import List, Dict, Tuple, Optional, AsyncGenerator
from openai import AsyncOpenAI
from app.core.config import settings


class AIService:
    """
    Multi-model AI service using OpenRouter
    OpenRouter provides a unified API for multiple AI models
    """

    # System prompts for different teaching methods
    TEACHING_PROMPTS = {
        "practical": """You are a practical AI tutor. Focus on real-world examples, hands-on applications,
and actionable steps. Use concrete examples from industry and daily life to illustrate concepts.
Always include practical exercises or implementation ideas.""",

        "conceptual": """You are a conceptual AI tutor. Focus on explaining the underlying principles,
theories, and fundamental concepts clearly. Build understanding from first principles.
Help students grasp the 'why' behind concepts before diving into the 'how'.""",

        "analogical": """You are an analogical AI tutor. Use analogies, metaphors, and comparisons to
familiar concepts to explain new ideas. Relate unfamiliar topics to things students already know.
Make complex concepts accessible through creative comparisons.""",

        "step-by-step": """You are a step-by-step AI tutor. Break down explanations into clear,
sequential steps. Number your points and guide students through concepts methodically.
Build complexity gradually, ensuring each step is understood before moving forward."""
    }

    # Default fallback prompt
    DEFAULT_PROMPT = """You are a helpful AI tutor for the Umbral EdTech platform.
Provide clear, accurate, and educational responses to student questions."""

    @staticmethod
    def get_client() -> AsyncOpenAI:
        """Get OpenRouter client configured with OpenAI-compatible API"""
        return AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.OPENROUTER_BASE_URL,
            default_headers={
                "HTTP-Referer": "https://umbral-edtech.com",  # Replace with actual domain
                "X-Title": settings.OPENROUTER_APP_NAME,
            }
        )

    @staticmethod
    def build_system_prompt(
        teaching_method: str = "conceptual",
        concept_context: Optional[Dict] = None
    ) -> str:
        """
        Build system prompt based on teaching method and optional concept context

        Args:
            teaching_method: The teaching methodology to use
            concept_context: Optional context about the concept being discussed

        Returns:
            System prompt string
        """
        base_prompt = AIService.TEACHING_PROMPTS.get(
            teaching_method,
            AIService.DEFAULT_PROMPT
        )

        if concept_context:
            concept_name = concept_context.get("name", "")
            concept_desc = concept_context.get("description", "")
            context_addition = f"\n\nContext: You are helping a student learn about '{concept_name}'."
            if concept_desc:
                context_addition += f" {concept_desc}"
            base_prompt += context_addition

        return base_prompt

    @staticmethod
    async def generate_response(
        messages: List[Dict[str, str]],
        model: str = "openai/gpt-4-turbo",
        teaching_method: str = "conceptual",
        concept_context: Optional[Dict] = None,
        max_tokens: int = None,
        temperature: float = None
    ) -> Tuple[str, int]:
        """
        Generate AI response using OpenRouter

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: OpenRouter model identifier (e.g., "openai/gpt-4-turbo")
            teaching_method: Teaching methodology
            concept_context: Optional context about the concept
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature

        Returns:
            Tuple of (response_content, tokens_used)
        """
        client = AIService.get_client()

        # Build system prompt
        system_prompt = AIService.build_system_prompt(teaching_method, concept_context)

        # Prepare messages with system prompt
        full_messages = [
            {"role": "system", "content": system_prompt}
        ] + messages

        # Use defaults if not specified
        if max_tokens is None:
            max_tokens = settings.MAX_TOKENS_PER_REQUEST
        if temperature is None:
            temperature = settings.AI_TEMPERATURE

        try:
            # Call OpenRouter API
            response = await client.chat.completions.create(
                model=model,
                messages=full_messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )

            # Extract response
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else 0

            return content, tokens_used

        except Exception as e:
            # Log error and re-raise
            print(f"Error generating AI response: {str(e)}")
            raise

    @staticmethod
    async def generate_response_stream(
        messages: List[Dict[str, str]],
        model: str = "openai/gpt-4-turbo",
        teaching_method: str = "conceptual",
        concept_context: Optional[Dict] = None,
        max_tokens: int = None,
        temperature: float = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming AI response using OpenRouter

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: OpenRouter model identifier
            teaching_method: Teaching methodology
            concept_context: Optional context about the concept
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature

        Yields:
            Chunks of response text
        """
        client = AIService.get_client()

        # Build system prompt
        system_prompt = AIService.build_system_prompt(teaching_method, concept_context)

        # Prepare messages with system prompt
        full_messages = [
            {"role": "system", "content": system_prompt}
        ] + messages

        # Use defaults if not specified
        if max_tokens is None:
            max_tokens = settings.MAX_TOKENS_PER_REQUEST
        if temperature is None:
            temperature = settings.AI_TEMPERATURE

        try:
            # Call OpenRouter API with streaming
            stream = await client.chat.completions.create(
                model=model,
                messages=full_messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=True,
            )

            # Yield chunks as they arrive
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            # Log error and re-raise
            print(f"Error generating streaming AI response: {str(e)}")
            raise

    @staticmethod
    async def generate_concept_summary(
        concept_name: str,
        concept_description: str,
        max_length: int = 200
    ) -> str:
        """
        Generate a brief AI summary for a concept

        Args:
            concept_name: Name of the concept
            concept_description: Description of the concept
            max_length: Maximum length of summary

        Returns:
            AI-generated summary
        """
        messages = [
            {
                "role": "user",
                "content": f"Provide a brief, clear summary (max {max_length} characters) of the concept '{concept_name}': {concept_description}"
            }
        ]

        try:
            summary, _ = await AIService.generate_response(
                messages=messages,
                model="openai/gpt-4-turbo",
                teaching_method="conceptual",
                max_tokens=100,
                temperature=0.5
            )
            return summary.strip()[:max_length]
        except Exception as e:
            print(f"Error generating concept summary: {str(e)}")
            return concept_description[:max_length] if concept_description else ""

    @staticmethod
    async def suggest_subconcepts(
        parent_concept_name: str,
        parent_concept_description: str,
        tier: str,
        count: int = 5
    ) -> List[Dict[str, str]]:
        """
        Generate suggested subconcepts for a parent concept

        Args:
            parent_concept_name: Name of the parent concept
            parent_concept_description: Description of the parent concept
            tier: Current tier (to determine next tier)
            count: Number of subconcepts to generate

        Returns:
            List of dicts with 'name' and 'description' for each subconcept
        """
        # Determine next tier
        next_tier = "pillar" if tier == "core" else "subtopic"

        messages = [
            {
                "role": "user",
                "content": f"""For the concept '{parent_concept_name}' ({parent_concept_description}),
suggest {count} key {next_tier}s that a student should learn.
Format your response as a JSON array with objects containing 'name' and 'description' fields.
Example: [{{"name": "Concept Name", "description": "Brief description"}}]"""
            }
        ]

        try:
            response, _ = await AIService.generate_response(
                messages=messages,
                model="openai/gpt-4-turbo",
                teaching_method="conceptual",
                max_tokens=1000,
                temperature=0.7
            )

            # Parse JSON response (simplified - should add proper error handling)
            import json
            subconcepts = json.loads(response)
            return subconcepts[:count]

        except Exception as e:
            print(f"Error generating subconcepts: {str(e)}")
            return []
