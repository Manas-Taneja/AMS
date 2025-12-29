"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { API_CONFIG, SUPABASE_CONFIG } from "@/config"
import { useConfirmation } from "@/hooks/useConfirmation"
import { supabase, supabaseEnabled, getTableNameFromEndpoint } from "@/lib/supabaseClient"

interface UseDetailPageOptions<T, U> {
  id: string
  apiEndpoint: string
  entityName: string
  listRoute: string
  transformData?: (data: unknown) => T
  transformUpdateData?: (data: U) => unknown
}

interface UseDetailPageReturn<T, U> {
  data: T | null
  loading: boolean
  editMode: boolean
  deleteDialogOpen: boolean
  saving: boolean
  formData: U
  setEditMode: (mode: boolean) => void
  setDeleteDialogOpen: (open: boolean) => void
  setFormData: (data: U) => void
  handleUpdate: () => Promise<void>
  handleDelete: () => Promise<void>
  handleCancel: () => void
  resetForm: () => void
}

export function useDetailPage<T, U>({
  id,
  apiEndpoint,
  entityName,
  listRoute,
  transformData,
  transformUpdateData,
}: UseDetailPageOptions<T, U>): UseDetailPageReturn<T, U> {
  const router = useRouter()
  const { confirmUpdate, confirmDelete } = useConfirmation()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<U>({} as U)
  const useSupabase = SUPABASE_CONFIG.USE_SUPABASE && supabaseEnabled && supabase

  // Use refs to store stable references to functions
  const getAuthHeadersRef = useRef(() => {
    // Try sessionStorage first (JWT), then fallback to cookie-based auth
    const token = sessionStorage.getItem("access_token")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    // For cookie-based auth, we don't need to set Authorization header
    // The browser will automatically send cookies
    return headers
  })

  const transformDataRef = useRef(transformData)

  // Update refs when functions change
  useEffect(() => {
    getAuthHeadersRef.current = () => {
      const token = sessionStorage.getItem("access_token")
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      // For cookie-based auth, we don't need to set Authorization header
      // The browser will automatically send cookies
      return headers
    }
  }, [])

  useEffect(() => {
    transformDataRef.current = transformData
  }, [transformData])

  const getAuthHeaders = useCallback(() => {
    return getAuthHeadersRef.current()
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      if (useSupabase && supabase) {
        const table = getTableNameFromEndpoint(apiEndpoint)
        const { data: row, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        
        const transformedData = transformDataRef.current ? transformDataRef.current(row) : row
        setData(transformedData)
        setFormData(transformedData as U)
      } else {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)
        
        const response = await fetch(`${apiEndpoint}/${id}`, {
          headers: getAuthHeadersRef.current(),
          credentials: 'include',
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = `Failed to fetch ${entityName}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorData.message || errorMessage
          } catch {
            try {
              const errorText = await response.text()
              errorMessage = errorText || errorMessage
            } catch {
              errorMessage = response.statusText || errorMessage
            }
          }
          throw new Error(errorMessage)
        }

        const responseData = await response.json()
        const transformedData = transformDataRef.current ? transformDataRef.current(responseData) : responseData
        
        setData(transformedData)
        setFormData(transformedData as U)
      }
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error)
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.')
      } else {
        toast.error(`Failed to load ${entityName} details`)
      }
    } finally {
      setLoading(false)
    }
  }, [id, apiEndpoint, entityName, useSupabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = useCallback(async () => {
    // Show confirmation for update
    const name = (data as { name?: string } | null)?.name || entityName;
    const confirmed = await confirmUpdate(entityName, name);
    if (!confirmed) {
      return;
    }
    
    setSaving(true)
    try {
      const updateData = transformUpdateData ? transformUpdateData(formData) : formData
      
      if (useSupabase && supabase) {
        const table = getTableNameFromEndpoint(apiEndpoint)
        const { data: updatedRow, error } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        
        const transformedData = transformData ? transformData(updatedRow) : updatedRow
        setData(transformedData)
        setEditMode(false)
        toast.success(`${entityName} updated successfully`)
      } else {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)
        
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(updateData),
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = `Failed to update ${entityName}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorData.message || errorMessage
          } catch {
            try {
              const errorText = await response.text()
              errorMessage = errorText || errorMessage
            } catch {
              errorMessage = response.statusText || errorMessage
            }
          }
          throw new Error(errorMessage)
        }

        const updatedData = await response.json()
        const transformedData = transformData ? transformData(updatedData) : updatedData
        
        setData(transformedData)
        setEditMode(false)
        toast.success(`${entityName} updated successfully`)
      }
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error)
      toast.error(`Failed to update ${entityName}`)
    } finally {
      setSaving(false)
    }
  }, [id, apiEndpoint, entityName, formData, getAuthHeaders, transformData, transformUpdateData, confirmUpdate, data, useSupabase])

  const handleDelete = useCallback(async () => {
    // Show confirmation for delete
    const name = (data as { name?: string } | null)?.name || entityName;
    const confirmed = await confirmDelete(entityName, name);
    if (!confirmed) {
      return;
    }
    
    try {
      if (useSupabase && supabase) {
        const table = getTableNameFromEndpoint(apiEndpoint)
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        toast.success(`${entityName} deleted successfully`);
        router.push(listRoute)
      } else {
        const response = await fetch(`${apiEndpoint}/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`Failed to delete ${entityName}`)
        }

        toast.success(`${entityName} deleted successfully`);
        router.push(listRoute)
      }
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error)
      toast.error(`Failed to delete ${entityName}`)
    }
  }, [id, apiEndpoint, entityName, listRoute, router, getAuthHeaders, confirmDelete, data, useSupabase])

  const handleCancel = useCallback(() => {
    setEditMode(false)
    if (data) {
      setFormData(data as U)
    }
  }, [data])

  const resetForm = useCallback(() => {
    if (data) {
      setFormData(data as U)
    }
  }, [data])

  return {
    data,
    loading,
    editMode,
    deleteDialogOpen,
    saving,
    formData,
    setEditMode,
    setDeleteDialogOpen,
    setFormData,
    handleUpdate,
    handleDelete,
    handleCancel,
    resetForm,
  }
} 