/**
 * Concept and graph types
 */

export type ConceptTier = 'core' | 'pillar' | 'subtopic'

export type RelationshipType = 'prerequisite' | 'related' | 'includes' | 'expands'

export interface Concept {
  id: string
  name: string
  slug: string
  description?: string
  summary?: string
  tier: ConceptTier
  parent_id?: string
  keywords: string[]
  color?: string
  icon?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ConceptRelationship {
  id: string
  source_id: string
  target_id: string
  relationship_type: RelationshipType
  strength: number
  label?: string
  created_at: string
}

export interface GraphNodeData {
  label: string
  description?: string
  tier: ConceptTier
  color?: string
  icon?: string
  hasChildren: boolean
  isExpanded: boolean
}

export interface GraphNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: GraphNodeData
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
  animated?: boolean
  style?: Record<string, any>
}

export interface ConceptGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  rootConceptId?: string
}

export interface CreateConceptData {
  name: string
  description?: string
  tier: ConceptTier
  parent_id?: string
  keywords?: string[]
  color?: string
  icon?: string
}

export interface UpdateConceptData {
  name?: string
  description?: string
  summary?: string
  keywords?: string[]
  color?: string
  icon?: string
  is_public?: boolean
}
