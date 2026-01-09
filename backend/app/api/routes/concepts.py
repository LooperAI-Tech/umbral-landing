"""
Concept API routes
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user_id
from app.services.concept_service import ConceptService
from app.schemas.concept import (
    ConceptCreate,
    ConceptUpdate,
    ConceptResponse,
    ConceptWithChildren,
    ConceptRelationshipCreate,
    ConceptRelationshipResponse,
    ConceptGraphResponse,
    ConceptTierEnum,
)

router = APIRouter()


@router.get("/", response_model=List[ConceptResponse])
async def list_concepts(
    tier: Optional[ConceptTierEnum] = None,
    parent_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """
    List concepts with optional filters

    Args:
        tier: Filter by tier (core, pillar, subtopic)
        parent_id: Filter by parent concept
        search: Search in name/description
        limit: Maximum number of results
        offset: Pagination offset
        db: Database session

    Returns:
        List of concepts
    """
    try:
        concepts = await ConceptService.list_concepts(
            db=db,
            tier=tier.value if tier else None,
            parent_id=parent_id,
            search=search,
            limit=limit,
            offset=offset
        )
        return concepts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list concepts: {str(e)}"
        )


@router.get("/{concept_id}", response_model=ConceptResponse)
async def get_concept(
    concept_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a concept by ID

    Args:
        concept_id: Concept ID
        db: Database session

    Returns:
        Concept details
    """
    try:
        concept = await ConceptService.get_concept(db, concept_id)
        if not concept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Concept not found"
            )
        return concept
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get concept: {str(e)}"
        )


@router.get("/slug/{slug}", response_model=ConceptResponse)
async def get_concept_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a concept by slug

    Args:
        slug: Concept slug
        db: Database session

    Returns:
        Concept details
    """
    try:
        concept = await ConceptService.get_concept_by_slug(db, slug)
        if not concept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Concept not found"
            )
        return concept
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get concept: {str(e)}"
        )


@router.post("/", response_model=ConceptResponse, status_code=status.HTTP_201_CREATED)
async def create_concept(
    concept_data: ConceptCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new concept

    Args:
        concept_data: Concept creation data
        user_id: Current user ID from token
        db: Database session

    Returns:
        Created concept
    """
    try:
        concept = await ConceptService.create_concept(db, concept_data, user_id)
        await db.commit()
        return concept
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create concept: {str(e)}"
        )


@router.patch("/{concept_id}", response_model=ConceptResponse)
async def update_concept(
    concept_id: str,
    update_data: ConceptUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a concept

    Args:
        concept_id: Concept ID
        update_data: Update data
        user_id: Current user ID from token
        db: Database session

    Returns:
        Updated concept
    """
    try:
        concept = await ConceptService.update_concept(db, concept_id, update_data)
        if not concept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Concept not found"
            )

        await db.commit()
        return concept
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update concept: {str(e)}"
        )


# Graph endpoints
@router.get("/graph/root", response_model=ConceptGraphResponse)
async def get_root_graph(
    db: AsyncSession = Depends(get_db)
):
    """
    Get the root graph with all core concepts and their direct children

    Args:
        db: Database session

    Returns:
        Graph response with nodes and edges
    """
    try:
        # Get all root concepts (core tier)
        root_concepts = await ConceptService.get_root_concepts(db)

        if not root_concepts:
            return ConceptGraphResponse(nodes=[], edges=[], rootConceptId=None)

        # Get direct children of root concepts
        all_concepts = list(root_concepts)
        for root in root_concepts:
            children = await ConceptService.get_concept_children(db, root.id)
            all_concepts.extend(children)

        # Build graph response
        graph = await ConceptService.build_graph_response(
            db=db,
            concepts=all_concepts,
            root_id=None
        )

        return graph
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get root graph: {str(e)}"
        )


@router.get("/graph/{concept_id}", response_model=ConceptGraphResponse)
async def get_concept_graph(
    concept_id: str,
    depth: int = Query(2, ge=1, le=4),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a concept graph starting from a specific concept

    Args:
        concept_id: Root concept ID
        depth: Maximum depth to traverse (1-4)
        db: Database session

    Returns:
        Graph response with nodes and edges
    """
    try:
        # Get concept with descendants
        root, descendants = await ConceptService.get_concept_with_descendants(
            db=db,
            concept_id=concept_id,
            depth=depth
        )

        if not root:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Concept not found"
            )

        # Combine root and descendants
        all_concepts = [root] + descendants

        # Build graph response
        graph = await ConceptService.build_graph_response(
            db=db,
            concepts=all_concepts,
            root_id=concept_id
        )

        return graph
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get concept graph: {str(e)}"
        )


@router.get("/graph/{concept_id}/expand", response_model=ConceptGraphResponse)
async def expand_concept(
    concept_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Expand a concept to show its direct children (for lazy loading)

    Args:
        concept_id: Concept ID to expand
        db: Database session

    Returns:
        Graph response with child nodes and edges
    """
    try:
        # Get the concept
        concept = await ConceptService.get_concept(db, concept_id)
        if not concept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Concept not found"
            )

        # Get direct children
        children = await ConceptService.get_concept_children(db, concept_id)

        # Build graph response (include parent + children)
        all_concepts = [concept] + children

        graph = await ConceptService.build_graph_response(
            db=db,
            concepts=all_concepts,
            root_id=concept_id
        )

        return graph
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to expand concept: {str(e)}"
        )


# Relationship endpoints
@router.post("/relationships", response_model=ConceptRelationshipResponse, status_code=status.HTTP_201_CREATED)
async def create_relationship(
    relationship_data: ConceptRelationshipCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a relationship between concepts

    Args:
        relationship_data: Relationship creation data
        user_id: Current user ID from token
        db: Database session

    Returns:
        Created relationship
    """
    try:
        relationship = await ConceptService.create_relationship(db, relationship_data)
        await db.commit()
        return relationship
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create relationship: {str(e)}"
        )


@router.delete("/relationships/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_relationship(
    relationship_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a relationship

    Args:
        relationship_id: Relationship ID
        user_id: Current user ID from token
        db: Database session

    Returns:
        No content
    """
    try:
        deleted = await ConceptService.delete_relationship(db, relationship_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relationship not found"
            )

        await db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete relationship: {str(e)}"
        )
