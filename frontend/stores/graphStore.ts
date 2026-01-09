/**
 * Graph Zustand store for concept visualization
 */

import { create } from 'zustand'
import type { Node, Edge, NodeChange, EdgeChange, Viewport } from '@xyflow/react'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import { conceptsApi } from '@/lib/api/concepts'
import type { GraphNodeData } from '@/types/concept'

interface GraphState {
  // State
  nodes: Node<GraphNodeData>[]
  edges: Edge[]
  isLoading: boolean
  error: string | null
  selectedNodeId: string | null
  expandedNodes: Set<string>

  // Viewport
  viewport: Viewport

  // Actions
  fetchRootGraph: () => Promise<void>
  fetchConceptGraph: (conceptId: string, depth?: number) => Promise<void>
  expandNode: (nodeId: string) => Promise<void>
  collapseNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  setViewport: (viewport: Viewport) => void
  resetGraph: () => void
  clearError: () => void

  // Computed
  getNodeById: (id: string) => Node<GraphNodeData> | undefined
  getChildNodes: (parentId: string) => Node<GraphNodeData>[]
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  isLoading: false,
  error: null,
  selectedNodeId: null,
  expandedNodes: new Set(),
  viewport: { x: 0, y: 0, zoom: 1 },

  // Fetch root graph (all core concepts + their children)
  fetchRootGraph: async () => {
    set({ isLoading: true, error: null })
    try {
      const graphData = await conceptsApi.getRootGraph()

      set({
        nodes: graphData.nodes as Node<GraphNodeData>[],
        edges: graphData.edges,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to load graph',
        isLoading: false,
      })
    }
  },

  // Fetch concept graph starting from a specific concept
  fetchConceptGraph: async (conceptId: string, depth: number = 2) => {
    set({ isLoading: true, error: null })
    try {
      const graphData = await conceptsApi.getConceptGraph(conceptId, depth)

      set({
        nodes: graphData.nodes as Node<GraphNodeData>[],
        edges: graphData.edges,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to load concept graph',
        isLoading: false,
      })
    }
  },

  // Expand a node to show its children
  expandNode: async (nodeId: string) => {
    set({ isLoading: true, error: null })
    try {
      const graphData = await conceptsApi.expandConcept(nodeId)

      // Merge new nodes and edges with existing ones
      set((state) => {
        const existingNodeIds = new Set(state.nodes.map((n) => n.id))
        const newNodes = graphData.nodes.filter((n) => !existingNodeIds.has(n.id))

        const existingEdgeIds = new Set(state.edges.map((e) => e.id))
        const newEdges = graphData.edges.filter((e) => !existingEdgeIds.has(e.id))

        // Mark node as expanded
        const updatedNodes = state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: { ...node.data, isExpanded: true },
              }
            : node
        )

        const expandedNodes = new Set(state.expandedNodes)
        expandedNodes.add(nodeId)

        return {
          nodes: [...updatedNodes, ...(newNodes as Node<GraphNodeData>[])],
          edges: [...state.edges, ...newEdges],
          expandedNodes,
          isLoading: false,
        }
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to expand node',
        isLoading: false,
      })
    }
  },

  // Collapse a node (hide its children)
  collapseNode: (nodeId: string) => {
    set((state) => {
      // Get child node IDs
      const childIds = state.edges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target)

      // Recursively get all descendant IDs
      const getAllDescendants = (ids: string[]): string[] => {
        const descendants = [...ids]
        const childrenOfDescendants = state.edges
          .filter((edge) => ids.includes(edge.source))
          .map((edge) => edge.target)

        if (childrenOfDescendants.length > 0) {
          descendants.push(...getAllDescendants(childrenOfDescendants))
        }

        return descendants
      }

      const allDescendantIds = getAllDescendants(childIds)

      // Remove descendant nodes and edges
      const filteredNodes = state.nodes.filter((node) => !allDescendantIds.includes(node.id))
      const filteredEdges = state.edges.filter(
        (edge) => !allDescendantIds.includes(edge.target)
      )

      // Mark node as collapsed
      const updatedNodes = filteredNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...node.data, isExpanded: false },
            }
          : node
      )

      const expandedNodes = new Set(state.expandedNodes)
      expandedNodes.delete(nodeId)

      return {
        nodes: updatedNodes,
        edges: filteredEdges,
        expandedNodes,
      }
    })
  },

  // Select a node
  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId })
  },

  // Handle node changes (React Flow)
  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as Node<GraphNodeData>[],
    }))
  },

  // Handle edge changes (React Flow)
  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }))
  },

  // Set viewport
  setViewport: (viewport: Viewport) => {
    set({ viewport })
  },

  // Reset graph to root
  resetGraph: async () => {
    await get().fetchRootGraph()
    set({
      selectedNodeId: null,
      expandedNodes: new Set(),
      viewport: { x: 0, y: 0, zoom: 1 },
    })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Get node by ID
  getNodeById: (id: string) => {
    return get().nodes.find((node) => node.id === id)
  },

  // Get child nodes of a parent
  getChildNodes: (parentId: string) => {
    const childIds = get().edges
      .filter((edge) => edge.source === parentId)
      .map((edge) => edge.target)

    return get().nodes.filter((node) => childIds.includes(node.id))
  },
}))
