"""
Concept Service for managing concepts and graph operations
"""

import uuid
import math
from typing import List, Optional, Dict, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from app.models import Concept, ConceptRelationship, ConceptTier, RelationshipType
from app.schemas.concept import (
    ConceptCreate,
    ConceptUpdate,
    ConceptRelationshipCreate,
    GraphNode,
    GraphEdge,
    GraphNodeData,
    ConceptGraphResponse,
)


class ConceptService:
    """Service for managing concepts and graph operations"""

    @staticmethod
    def generate_slug(name: str) -> str:
        """Generate URL-friendly slug from concept name"""
        import re
        slug = name.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')

    @staticmethod
    async def create_concept(
        db: AsyncSession,
        concept_data: ConceptCreate,
        user_id: Optional[str] = None
    ) -> Concept:
        """
        Create a new concept

        Args:
            db: Database session
            concept_data: Concept creation data
            user_id: Optional user ID (creator)

        Returns:
            Created Concept
        """
        # Generate slug
        slug = ConceptService.generate_slug(concept_data.name)

        # Check if slug exists, append number if needed
        base_slug = slug
        counter = 1
        while True:
            result = await db.execute(
                select(Concept).where(Concept.slug == slug)
            )
            if not result.scalar_one_or_none():
                break
            slug = f"{base_slug}-{counter}"
            counter += 1

        concept = Concept(
            id=str(uuid.uuid4()),
            name=concept_data.name,
            slug=slug,
            description=concept_data.description,
            tier=ConceptTier[concept_data.tier.value.upper()],
            parent_id=concept_data.parent_id,
            keywords=concept_data.keywords,
            color=concept_data.color,
            icon=concept_data.icon,
            is_public=True,
            created_by=user_id,
        )

        db.add(concept)
        await db.flush()
        await db.refresh(concept)

        return concept

    @staticmethod
    async def get_concept(
        db: AsyncSession,
        concept_id: str
    ) -> Optional[Concept]:
        """Get a concept by ID"""
        result = await db.execute(
            select(Concept).where(Concept.id == concept_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_concept_by_slug(
        db: AsyncSession,
        slug: str
    ) -> Optional[Concept]:
        """Get a concept by slug"""
        result = await db.execute(
            select(Concept).where(Concept.slug == slug)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_concepts(
        db: AsyncSession,
        tier: Optional[str] = None,
        parent_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Concept]:
        """
        List concepts with filters

        Args:
            db: Database session
            tier: Filter by tier
            parent_id: Filter by parent
            search: Search in name/description
            limit: Maximum results
            offset: Pagination offset

        Returns:
            List of Concepts
        """
        query = select(Concept).where(Concept.is_public == True)

        if tier:
            query = query.where(Concept.tier == ConceptTier[tier.upper()])

        if parent_id:
            query = query.where(Concept.parent_id == parent_id)

        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Concept.name.ilike(search_term),
                    Concept.description.ilike(search_term)
                )
            )

        query = query.order_by(Concept.name).limit(limit).offset(offset)

        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_concept(
        db: AsyncSession,
        concept_id: str,
        update_data: ConceptUpdate
    ) -> Optional[Concept]:
        """Update a concept"""
        concept = await ConceptService.get_concept(db, concept_id)
        if not concept:
            return None

        if update_data.name is not None:
            concept.name = update_data.name
            concept.slug = ConceptService.generate_slug(update_data.name)
        if update_data.description is not None:
            concept.description = update_data.description
        if update_data.summary is not None:
            concept.summary = update_data.summary
        if update_data.keywords is not None:
            concept.keywords = update_data.keywords
        if update_data.color is not None:
            concept.color = update_data.color
        if update_data.icon is not None:
            concept.icon = update_data.icon
        if update_data.is_public is not None:
            concept.is_public = update_data.is_public

        await db.flush()
        await db.refresh(concept)

        return concept

    @staticmethod
    async def get_concept_children(
        db: AsyncSession,
        concept_id: str
    ) -> List[Concept]:
        """Get direct children of a concept"""
        result = await db.execute(
            select(Concept).where(
                and_(
                    Concept.parent_id == concept_id,
                    Concept.is_public == True
                )
            ).order_by(Concept.name)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_concept_with_descendants(
        db: AsyncSession,
        concept_id: str,
        depth: int = 2
    ) -> Tuple[Concept, List[Concept]]:
        """
        Get concept with all descendants up to specified depth

        Args:
            db: Database session
            concept_id: Root concept ID
            depth: Maximum depth to traverse

        Returns:
            Tuple of (root_concept, list_of_descendants)
        """
        root = await ConceptService.get_concept(db, concept_id)
        if not root:
            return None, []

        descendants = []
        current_level = [concept_id]

        for _ in range(depth):
            if not current_level:
                break

            # Get children of current level
            result = await db.execute(
                select(Concept).where(
                    and_(
                        Concept.parent_id.in_(current_level),
                        Concept.is_public == True
                    )
                ).order_by(Concept.name)
            )
            children = list(result.scalars().all())

            if not children:
                break

            descendants.extend(children)
            current_level = [c.id for c in children]

        return root, descendants

    @staticmethod
    async def get_root_concepts(db: AsyncSession) -> List[Concept]:
        """Get all core-tier concepts (root nodes)"""
        result = await db.execute(
            select(Concept).where(
                and_(
                    Concept.tier == ConceptTier.CORE,
                    Concept.is_public == True
                )
            ).order_by(Concept.name)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_concept_relationships(
        db: AsyncSession,
        concept_ids: List[str]
    ) -> List[ConceptRelationship]:
        """Get all relationships for a list of concepts"""
        result = await db.execute(
            select(ConceptRelationship).where(
                or_(
                    ConceptRelationship.source_id.in_(concept_ids),
                    ConceptRelationship.target_id.in_(concept_ids)
                )
            )
        )
        return list(result.scalars().all())

    @staticmethod
    async def create_relationship(
        db: AsyncSession,
        relationship_data: ConceptRelationshipCreate
    ) -> ConceptRelationship:
        """Create a relationship between concepts"""
        relationship = ConceptRelationship(
            id=str(uuid.uuid4()),
            source_id=relationship_data.source_id,
            target_id=relationship_data.target_id,
            relationship_type=RelationshipType[relationship_data.relationship_type.value.upper()],
            strength=relationship_data.strength,
            label=relationship_data.label,
        )

        db.add(relationship)
        await db.flush()
        await db.refresh(relationship)

        return relationship

    @staticmethod
    async def delete_relationship(
        db: AsyncSession,
        relationship_id: str
    ) -> bool:
        """Delete a relationship"""
        result = await db.execute(
            select(ConceptRelationship).where(ConceptRelationship.id == relationship_id)
        )
        relationship = result.scalar_one_or_none()

        if not relationship:
            return False

        await db.delete(relationship)
        await db.flush()
        return True

    @staticmethod
    def generate_node_positions(
        concepts: List[Concept],
        layout: str = "hierarchical"
    ) -> Dict[str, Dict[str, float]]:
        """
        Calculate node positions for graph layout

        Args:
            concepts: List of concepts to position
            layout: Layout algorithm (hierarchical, radial, force)

        Returns:
            Dict mapping concept_id to {x, y} position
        """
        positions = {}

        if layout == "hierarchical":
            # Group by tier
            core_concepts = [c for c in concepts if c.tier == ConceptTier.CORE]
            pillar_concepts = [c for c in concepts if c.tier == ConceptTier.PILLAR]
            subtopic_concepts = [c for c in concepts if c.tier == ConceptTier.SUBTOPIC]

            # Layout parameters
            horizontal_spacing = 300
            vertical_spacing = 200
            tier_y_offset = {
                ConceptTier.CORE: 0,
                ConceptTier.PILLAR: vertical_spacing,
                ConceptTier.SUBTOPIC: vertical_spacing * 2,
            }

            # Position core concepts
            core_width = len(core_concepts) * horizontal_spacing
            for i, concept in enumerate(core_concepts):
                x = (i - len(core_concepts) / 2) * horizontal_spacing
                y = tier_y_offset[ConceptTier.CORE]
                positions[concept.id] = {"x": x, "y": y}

            # Position pillars under their parents
            parent_groups = {}
            for pillar in pillar_concepts:
                parent_id = pillar.parent_id or "none"
                if parent_id not in parent_groups:
                    parent_groups[parent_id] = []
                parent_groups[parent_id].append(pillar)

            for parent_id, pillars in parent_groups.items():
                if parent_id in positions:
                    parent_x = positions[parent_id]["x"]
                else:
                    parent_x = 0

                pillar_width = len(pillars) * horizontal_spacing * 0.8
                for i, pillar in enumerate(pillars):
                    x = parent_x + (i - len(pillars) / 2) * horizontal_spacing * 0.8
                    y = tier_y_offset[ConceptTier.PILLAR]
                    positions[pillar.id] = {"x": x, "y": y}

            # Position subtopics under their parents
            parent_groups = {}
            for subtopic in subtopic_concepts:
                parent_id = subtopic.parent_id or "none"
                if parent_id not in parent_groups:
                    parent_groups[parent_id] = []
                parent_groups[parent_id].append(subtopic)

            for parent_id, subtopics in parent_groups.items():
                if parent_id in positions:
                    parent_x = positions[parent_id]["x"]
                else:
                    parent_x = 0

                for i, subtopic in enumerate(subtopics):
                    x = parent_x + (i - len(subtopics) / 2) * horizontal_spacing * 0.6
                    y = tier_y_offset[ConceptTier.SUBTOPIC]
                    positions[subtopic.id] = {"x": x, "y": y}

        return positions

    @staticmethod
    async def build_graph_response(
        db: AsyncSession,
        concepts: List[Concept],
        root_id: Optional[str] = None
    ) -> ConceptGraphResponse:
        """
        Transform concepts into React Flow format

        Args:
            db: Database session
            concepts: List of concepts to include in graph
            root_id: Optional root concept ID

        Returns:
            ConceptGraphResponse with nodes and edges
        """
        if not concepts:
            return ConceptGraphResponse(nodes=[], edges=[], rootConceptId=root_id)

        # Generate positions
        positions = ConceptService.generate_node_positions(concepts)

        # Create nodes
        nodes = []
        for concept in concepts:
            # Check if concept has children
            children_result = await db.execute(
                select(func.count(Concept.id)).where(Concept.parent_id == concept.id)
            )
            has_children = children_result.scalar() > 0

            # Determine node type based on tier
            node_type = concept.tier.value  # "core", "pillar", or "subtopic"

            # Get position
            position = positions.get(concept.id, {"x": 0, "y": 0})

            # Create node data
            node_data = GraphNodeData(
                label=concept.name,
                description=concept.description,
                tier=concept.tier.value,
                color=concept.color,
                icon=concept.icon,
                hasChildren=has_children,
                isExpanded=False,
            )

            node = GraphNode(
                id=concept.id,
                type=node_type,
                position=position,
                data=node_data.model_dump(),
            )
            nodes.append(node)

        # Create edges from parent-child relationships
        edges = []
        for concept in concepts:
            if concept.parent_id:
                # Check if parent is in the graph
                if any(n.id == concept.parent_id for n in nodes):
                    edge = GraphEdge(
                        id=f"{concept.parent_id}-{concept.id}",
                        source=concept.parent_id,
                        target=concept.id,
                        type="smoothstep",
                        animated=False,
                    )
                    edges.append(edge)

        # Get additional relationships
        concept_ids = [c.id for c in concepts]
        relationships = await ConceptService.get_concept_relationships(db, concept_ids)

        for rel in relationships:
            # Only add if both concepts are in the graph
            if (any(n.id == rel.source_id for n in nodes) and
                any(n.id == rel.target_id for n in nodes)):

                # Skip if it's already covered by parent-child edge
                edge_id = f"{rel.source_id}-{rel.target_id}"
                if not any(e.id == edge_id for e in edges):
                    edge = GraphEdge(
                        id=edge_id,
                        source=rel.source_id,
                        target=rel.target_id,
                        type="default",
                        label=rel.label,
                        animated=rel.relationship_type == RelationshipType.PREREQUISITE,
                        style={"strokeDasharray": "5,5"} if rel.relationship_type == RelationshipType.RELATED else None,
                    )
                    edges.append(edge)

        return ConceptGraphResponse(
            nodes=nodes,
            edges=edges,
            rootConceptId=root_id,
        )
