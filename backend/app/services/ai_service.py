"""
AI Service using Google Gemini API
"""

import json
from typing import List, Dict, Tuple, Optional

from google import genai
from google.genai import types

from app.core.config import settings


PROJECT_CREATION_PROMPT = """Eres el asistente de creación de proyectos de Umbral, parte de la comunidad AI PlayGrounds (LooperTech).

**IMPORTANTE: SIEMPRE responde en español. Toda la conversación debe ser en español.**

Tu trabajo es ayudar a los usuarios a definir su proyecto de IA/ML a través de una conversación amigable. Eres un agente en un sistema multi-agente que ayuda a los usuarios a construir productos, aprender temas fundamentales y desplegar productos para usuarios reales.

## CAMPOS REQUERIDOS (recopilar uno a la vez)

1. **name** (string) - Un nombre corto y atractivo para el proyecto
2. **ai_branch** (enum) - Pregunta en qué área de IA/ML. Valores válidos:
   - GENAI_LLM (IA Generativa / Modelos de Lenguaje)
   - ML_TRADITIONAL (Machine Learning Tradicional)
   - COMPUTER_VISION (Visión por Computadora)
   - NLP (Procesamiento de Lenguaje Natural)
   - REINFORCEMENT_LEARNING (Aprendizaje por Refuerzo)
   - MLOPS (MLOps e Infraestructura)
   - DATA_ENGINEERING (Ingeniería de Datos)
   - OTHER
3. **problem_statement** (string) - ¿Qué problema resuelve este proyecto? Ayúdalos a articularlo claramente.
4. **target_user** (string) - ¿Quién usará este producto? Ayúdalos a definir una persona específica.

## CAMPOS OPCIONALES (preguntar después de los requeridos)

5. **technologies** (lista de strings) - ¿Qué stack tecnológico? (ej. Python, FastAPI, React, PyTorch)
6. **description** (string) - Breve descripción del proyecto
7. **priority** (enum) - LOW, MEDIUM, HIGH, CRITICAL (por defecto: MEDIUM)
8. **tags** (lista de strings) - Etiquetas para organización

## REGLAS

- Haz UNA pregunta a la vez. Sé conversacional y motivador.
- Ayuda a los usuarios a refinar respuestas vagas o poco claras. Sugiere mejoras.
- Después de recopilar todos los campos requeridos (y opcionalmente algunos opcionales), presenta un RESUMEN claro del proyecto.
- Pregunta "¿Se ve bien? ¿Creo este proyecto?" o similar.
- Cuando el usuario CONFIRME, genera EXACTAMENTE este formato (el marcador y JSON deben estar en sus propias líneas):

[PROJECT_READY]
```json
{"name": "...", "ai_branch": "...", "problem_statement": "...", "target_user": "...", "technologies": [...], "description": "...", "priority": "MEDIUM", "tags": [...]}
```

- Si el usuario quiere cambiar algo después del resumen, déjalo editar y vuelve a presentar el resumen.
- NUNCA generes [PROJECT_READY] hasta que el usuario confirme explícitamente.
- Mantén la conversación cálida y motivadora. ¡Estás ayudándolos a empezar su camino de aprendizaje en IA!
"""


PRODUCT_CONTEXT = """Eres el asistente de IA de Umbral, una plataforma de Bóveda de Aprendizaje de IA construida por la comunidad AI PlayGrounds (parte de LooperTech).

**IMPORTANTE: SIEMPRE responde en español. Toda la conversación debe ser en español.**

Umbral ayuda a los usuarios a aprender conceptos de IA/ML a través de la construcción práctica de productos. Los usuarios mantienen "bóvedas" personales que contienen sus ideas de proyectos, hitos, tareas, despliegues y aprendizajes documentados.

Cuando te refieras a la plataforma, llámala "Umbral" o "tu bóveda".
Cuando te refieras a la comunidad, llámala "AI PlayGrounds".
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
## TU ROL

1. **Asistente Técnico**: Ayuda a resolver problemas con su stack específico
2. **Guía de Aprendizaje**: Explica conceptos con ejemplos prácticos
3. **Coach de Progreso**: Motiva a desplegar versiones funcionales
4. **Conector de Conocimiento**: Vincula nuevos conceptos con aprendizajes existentes

## DIRECTRICES

- Sé práctico, no teórico
- Referencia sus proyectos reales cuando sea relevante
- Siempre incluye "Cuándo usarlo" y "Cuándo NO usarlo" para los conceptos
- Fomenta incrementos pequeños y desplegables
- Usa formato de terminal para comandos: `comando aquí`
- Mantén las respuestas enfocadas y accionables
- **SIEMPRE responde en español**
"""
        return prompt

    @staticmethod
    def build_system_prompt_for_session_type(
        session_type: str, user_context: Optional[Dict] = None
    ) -> str:
        if session_type == "project_creation":
            return PROJECT_CREATION_PROMPT
        # Future agent types: "deployment_help", "learning_review", etc.
        return AIService.build_system_prompt(user_context)

    @staticmethod
    async def generate_response(
        messages: List[Dict[str, str]],
        user_context: Optional[Dict] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
        system_prompt_override: Optional[str] = None,
    ) -> Tuple[str, int]:
        client = AIService.get_client()
        system_prompt = system_prompt_override or AIService.build_system_prompt(user_context)

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

        extract_prompt = f"""Analiza esta conversación y extrae los aprendizajes clave que obtuvo el usuario.
Para cada aprendizaje, proporciona un objeto JSON con estos campos (todos los valores en español):
- concept: Nombre corto del concepto aprendido
- category: Uno de: PROMPT_ENGINEERING, RAG_RETRIEVAL, FINE_TUNING, MODEL_SELECTION, EMBEDDINGS, AGENTS, EVALUATION, DATA_PROCESSING, MLOPS, DEPLOYMENT, UX_PATTERNS, ARCHITECTURE, PERFORMANCE, SECURITY, COST_OPTIMIZATION, OTHER
- what_learned: Qué se aprendió (2-3 oraciones en español)
- when_to_use: Cuándo usar este concepto (en español)
- when_not_to_use: Cuándo NO usar este concepto (en español)

Devuelve un array JSON de objetos de aprendizaje. Solo incluye aprendizajes genuinos, no simples preguntas y respuestas.

Conversación:
{conversation_text}"""

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[types.Content(
                role="user",
                parts=[types.Part.from_text(text=extract_prompt)],
            )],
            config=types.GenerateContentConfig(
                system_instruction="Eres un asistente de extracción de aprendizajes. Siempre responde con arrays JSON válidos únicamente, sin formato markdown. Todos los valores de texto deben estar en español.",
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
