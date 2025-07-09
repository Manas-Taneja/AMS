"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface UseDetailPageOptions<T, U> {
  id: string
  apiEndpoint: string
  entityName: string
  listRoute: string
  transformData?: (data: any) => T
  transformUpdateData?: (data: U) => any
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
  const navigate = useNavigate()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<U>({} as U)

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token")
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiEndpoint}/${id}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityName}`)
      }

      const responseData = await response.json()
      const transformedData = transformData ? transformData(responseData) : responseData
      
      setData(transformedData)
      setFormData(transformedData as U)
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error)
      toast.error(`Failed to load ${entityName} details`)
    } finally {
      setLoading(false)
    }
  }, [id, apiEndpoint, entityName, getAuthHeaders, transformData])

  const handleUpdate = useCallback(async () => {
    setSaving(true)
    try {
      const updateData = transformUpdateData ? transformUpdateData(formData) : formData
      
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${entityName}`)
      }

      const updatedData = await response.json()
      const transformedData = transformData ? transformData(updatedData) : updatedData
      
      setData(transformedData)
      setEditMode(false)
      toast.success(`${entityName} updated successfully`)
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error)
      toast.error(`Failed to update ${entityName}`)
    } finally {
      setSaving(false)
    }
  }, [id, apiEndpoint, entityName, formData, getAuthHeaders, transformData, transformUpdateData])

  const handleDelete = useCallback(async () => {
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${entityName}`)
      }

      toast.success(`${entityName} deleted successfully`)
      navigate(listRoute)
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error)
      toast.error(`Failed to delete ${entityName}`)
    }
  }, [id, apiEndpoint, entityName, listRoute, navigate, getAuthHeaders])

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

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