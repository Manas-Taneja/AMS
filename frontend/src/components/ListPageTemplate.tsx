import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/hooks/useModal';
import { useForm } from '@/hooks/useForm';
import { validationRules } from '@/hooks/useForm';
import { getStatusConfig } from '@/config/statusConfig';
import { StatusBadge } from './StatusBadge';
import { Plus, Filter, Download, Upload } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'input' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ListPageTemplateProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  loading: boolean;
  error?: string;
  columns: Column<T>[];
  filters?: FilterOption[];
  statusType?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onCreate?: (data: any) => Promise<void>;
  onUpdate?: (id: string | number, data: any) => Promise<void>;
  onDelete?: (id: string | number) => Promise<void>;
  createFormFields?: React.ReactNode;
  editFormFields?: React.ReactNode;
  actions?: React.ReactNode;
  emptyState?: React.ReactNode;
  showCreateButton?: boolean;
  showExportButton?: boolean;
  showImportButton?: boolean;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

export function ListPageTemplate<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  loading,
  error,
  columns,
  filters = [],
  statusType,
  searchPlaceholder = 'Search...',
  onSearch,
  onFilter,
  onSort,
  onCreate,
  onUpdate,
  onDelete,
  createFormFields,
  editFormFields,
  actions,
  emptyState,
  showCreateButton = true,
  showExportButton = false,
  showImportButton = false,
  onExport,
  onImport,
}: ListPageTemplateProps<T>) {
  const createModal = useModal();
  const editModal = useModal();
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Form for create/edit
  const form = useForm({
    initialData: {} as any,
    validationRules: [
      validationRules.required('name'),
      validationRules.required('status'),
    ],
    onSubmit: async (formData) => {
      if (editingItem) {
        await onUpdate?.(editingItem.id, formData);
      } else {
        await onCreate?.(formData);
      }
      createModal.close();
      editModal.close();
      setEditingItem(null);
    },
  });

  // Handle sorting
  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  // Handle create
  const handleCreate = () => {
    form.reset();
    createModal.open();
  };

  // Handle edit
  const handleEdit = (item: T) => {
    setEditingItem(item);
    // Reset form with item data
    Object.entries(item).forEach(([key, value]) => {
      form.setFieldValue(key as any, value);
    });
    editModal.open();
  };

  // Handle delete
  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await onDelete?.(id);
    }
  };

  // Handle export
  const handleExport = () => {
    onExport?.();
  };

  // Handle import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport?.(file);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          {showImportButton && (
            <div className="relative">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="relative">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          )}
          
          {showExportButton && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          
          {showCreateButton && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          )}
          
          {actions}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full"
            />
          </div>
          {filters.length > 0 && (
            <Select onValueChange={(value) => onFilter?.({ status: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {filters.map((filter) => 
                  filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Results ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            emptyState || (
              <div className="text-center py-8">
                <p className="text-gray-500">No items found</p>
              </div>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className={`text-left p-3 font-medium ${column.width || ''} ${
                          column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                        onClick={() => column.sortable && handleSort(String(column.key))}
                      >
                        <div className="flex items-center gap-1">
                          {column.header}
                          {column.sortable && sortConfig?.key === column.key && (
                            <span className="text-xs">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="text-right p-3 font-medium w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id || index} className="border-b hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={String(column.key)} className="p-3">
                          {column.render ? (
                            column.render(item)
                          ) : column.key === 'status' && statusType ? (
                            <StatusBadge type={statusType} value={item[column.key]} />
                          ) : (
                            String(item[column.key] || '')
                          )}
                        </td>
                      ))}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onUpdate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create {title}</h2>
            <form onSubmit={form.handleSubmit}>
              {createFormFields}
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={form.isSubmitting}>
                  {form.isSubmitting ? 'Creating...' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={createModal.close}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit {title}</h2>
            <form onSubmit={form.handleSubmit}>
              {editFormFields}
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={form.isSubmitting}>
                  {form.isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button type="button" variant="outline" onClick={editModal.close}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 