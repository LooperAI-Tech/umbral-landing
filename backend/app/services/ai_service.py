"""
AI Service using Google Gemini API
"""

import json
import logging
from typing import List, Dict, Tuple, Optional

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)


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


MILESTONE_GENERATION_PROMPT = """Eres el asistente de planificación de hitos de Umbral, parte de la comunidad AI PlayGrounds (LooperTech).

**IMPORTANTE: SIEMPRE responde en español. Toda la conversación debe ser en español.**

Tu trabajo es ayudar al usuario a definir los hitos (milestones) de su proyecto de IA/ML a través de una conversación interactiva.

## CONTEXTO DEL PROYECTO
{project_context}

## PROCESO

1. **Entender el alcance**: Pregunta sobre los objetivos principales del proyecto, el timeline disponible y qué quiere lograr el usuario.
2. **Sugerir hitos**: Propón entre 3 y 6 hitos concretos y secuenciales, cada uno con:
   - Nombre claro y corto
   - Entregable específico (qué se va a entregar)
   - Tipo de entregable (MVP, FEATURE, INTEGRATION, DEPLOYMENT, DOCUMENTATION, RESEARCH, OTHER)
   - Criterios de éxito (cómo saber que está terminado)
   - Descripción breve (opcional)
   - Fecha objetivo (opcional, formato ISO como "2025-03-15T00:00:00")
3. **Iterar**: Permite al usuario ajustar, agregar o quitar hitos.
4. **Confirmar**: Cuando el usuario esté satisfecho, presenta un resumen final y pide confirmación explícita.

## REGLAS

- Haz UNA pregunta a la vez. Sé conversacional y motivador.
- Los hitos deben ser incrementales: cada uno construye sobre el anterior.
- Favorece entregables pequeños y desplegables (enfoque MVP).
- Después de sugerir los hitos, presenta un RESUMEN numerado claro.
- Pregunta "¿Se ven bien estos hitos? ¿Los creo?" o similar.
- Cuando el usuario CONFIRME, genera EXACTAMENTE este formato (el marcador y JSON deben estar en sus propias líneas):

[MILESTONES_READY]
```json
[
  {{"name": "...", "deliverable": "...", "deliverable_type": "FEATURE", "success_criteria": "...", "description": "...", "target_date": null}},
  ...
]
```

- Valores válidos para deliverable_type: MVP, FEATURE, INTEGRATION, DEPLOYMENT, DOCUMENTATION, RESEARCH, OTHER
- Si el usuario quiere cambiar algo después del resumen, déjalo editar y vuelve a presentar.
- NUNCA generes [MILESTONES_READY] hasta que el usuario confirme explícitamente.
- Mantén la conversación cálida y motivadora.
"""


TASK_GENERATION_PROMPT = """Eres el asistente de planificación de tareas de Umbral, parte de la comunidad AI PlayGrounds (LooperTech).

**IMPORTANTE: SIEMPRE responde en español. Toda la conversación debe ser en español.**

Tu trabajo es ayudar al usuario a definir las tareas concretas para un hito específico de su proyecto de IA/ML.

## CONTEXTO
{task_context}

## PROCESO

1. **Entender el hito**: Revisa el contexto del hito, sus criterios de éxito y entregable. Pregunta al usuario qué enfoque prefiere o si tiene tareas en mente.
2. **Sugerir tareas**: Propón entre 3 y 8 tareas concretas y accionables, cada una con:
   - Título claro y específico
   - Descripción breve de qué hacer
   - Tipo de tarea: DEVELOPMENT, PROMPT_ENGINEERING, FRONTEND, BACKEND, DEPLOYMENT, RESEARCH, TESTING, DOCUMENTATION, DESIGN, DATA_WORK, INTEGRATION, OTHER
   - Componente técnico (ej. "Backend API", "Frontend UI", "Pipeline ML")
   - Complejidad: TRIVIAL, EASY, MEDIUM, HARD, COMPLEX
   - Horas estimadas (opcional)
3. **Iterar**: Permite al usuario ajustar, agregar o quitar tareas.
4. **Confirmar**: Presenta un resumen final y pide confirmación explícita.

## REGLAS

- Haz UNA pregunta a la vez. Sé conversacional y motivador.
- Las tareas deben ser lo suficientemente pequeñas para completarse en una sesión de trabajo (1-4 horas idealmente).
- Incluye tareas de testing y documentación cuando sea relevante.
- Después de sugerir las tareas, presenta un RESUMEN numerado claro.
- Pregunta "¿Se ven bien estas tareas? ¿Las creo?" o similar.
- Cuando el usuario CONFIRME, genera EXACTAMENTE este formato:

[TASKS_READY]
```json
[
  {{"title": "...", "description": "...", "task_type": "DEVELOPMENT", "tech_component": "...", "complexity": "MEDIUM", "estimated_hours": 2}},
  ...
]
```

- Valores válidos para task_type: DEVELOPMENT, PROMPT_ENGINEERING, FRONTEND, BACKEND, DEPLOYMENT, RESEARCH, TESTING, DOCUMENTATION, DESIGN, DATA_WORK, INTEGRATION, OTHER
- Valores válidos para complexity: TRIVIAL, EASY, MEDIUM, HARD, COMPLEX
- Si el usuario quiere cambiar algo después del resumen, déjalo editar y vuelve a presentar.
- NUNCA generes [TASKS_READY] hasta que el usuario confirme explícitamente.
- Mantén la conversación cálida y motivadora.
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

        if session_type == "milestone_generation":
            project_context = "No hay información del proyecto disponible."
            current = (user_context or {}).get("current_project")
            if current:
                lines = [
                    f"**Proyecto:** {current['name']}",
                    f"**Problema:** {current.get('problem_statement', 'N/A')}",
                    f"**Usuario objetivo:** {current.get('target_user', 'N/A')}",
                ]
                existing = current.get("milestones", [])
                if existing:
                    lines.append("\n**Hitos existentes:**")
                    for m in existing:
                        lines.append(f"  {m['milestone_number']}. {m['name']} - {m['status']}")
                else:
                    lines.append("\nNo hay hitos existentes aún.")
                project_context = "\n".join(lines)
            return MILESTONE_GENERATION_PROMPT.format(project_context=project_context)

        if session_type == "task_generation":
            task_context = "No hay información del hito disponible."
            current = (user_context or {}).get("current_project")
            milestone_info = (user_context or {}).get("current_milestone")
            if current or milestone_info:
                lines = []
                if current:
                    lines.append(f"**Proyecto:** {current['name']}")
                    lines.append(f"**Problema:** {current.get('problem_statement', 'N/A')}")
                    lines.append(f"**Usuario objetivo:** {current.get('target_user', 'N/A')}")
                if milestone_info:
                    lines.append(f"\n**Hito actual:** {milestone_info['name']}")
                    lines.append(f"**Entregable:** {milestone_info.get('deliverable', 'N/A')}")
                    lines.append(f"**Criterios de éxito:** {milestone_info.get('success_criteria', 'N/A')}")
                    lines.append(f"**Tipo:** {milestone_info.get('deliverable_type', 'N/A')}")
                    existing_tasks = milestone_info.get("tasks", [])
                    if existing_tasks:
                        lines.append("\n**Tareas existentes:**")
                        for t in existing_tasks:
                            lines.append(f"  - {t['task_number']}: {t['title']} ({t['status']})")
                    else:
                        lines.append("\nNo hay tareas existentes aún.")
                task_context = "\n".join(lines)
            return TASK_GENERATION_PROMPT.format(task_context=task_context)

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

        try:
            # Use async client to avoid blocking the event loop
            response = await client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    max_output_tokens=max_tokens,
                    temperature=temperature,
                ),
            )
        except Exception as e:
            logger.error("Gemini API error: %s", e)
            raise RuntimeError(f"AI service unavailable: {e}")

        content = response.text or ""
        if not content.strip():
            logger.warning("Gemini returned empty response (possibly blocked by safety filters)")
            content = "Lo siento, no pude generar una respuesta. Por favor intenta reformular tu mensaje."

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

        try:
            response = await client.aio.models.generate_content(
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
        except Exception as e:
            logger.error("Gemini API error during learning extraction: %s", e)
            return []

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
