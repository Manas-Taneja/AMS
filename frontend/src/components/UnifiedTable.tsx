import React from "react";
import { Button } from "./ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";

export type UnifiedTableColumn<T> = {
  key: keyof T;
  label: string;
};

interface UnifiedTableProps<T extends { id: number }> {
  columns: UnifiedTableColumn<T>[];
  data: T[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
  renderCell?: (colKey: keyof T, row: T) => React.ReactNode;
  rowKey?: keyof T;
  emptyMessage?: string;
}

function UnifiedTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  renderCell,
  rowKey = "id",
  emptyMessage = "No data found."
}: UnifiedTableProps<T>) {
  return (
    <div className="w-full">
      {/* Table for md+ screens */}
      <table className="min-w-full border-separate border-spacing-y-2 hidden md:table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} className="text-left px-4 py-2 text-sm font-semibold text-gray-700">
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || onView) && (
              <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-gray-500 py-8">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={String(row[rowKey])} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3 text-gray-700">
                    {renderCell ? renderCell(col.key, row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(row.id)}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(row.id)}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(row.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Stacked cards for small screens */}
      <div className="block md:hidden w-full">
        {data.length === 0 ? (
          <div className="text-center text-gray-500 py-8">{emptyMessage}</div>
        ) : (
          data.map((row) => (
            <div key={String(row[rowKey])} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4 p-4">
              {columns.map(col => (
                <div key={String(col.key)} className="flex justify-between py-1">
                  <span className="font-semibold text-gray-700">{col.label}:</span>
                  <span className="text-gray-700 ml-2">{renderCell ? renderCell(col.key, row) : (row[col.key] as React.ReactNode)}</span>
                </div>
              ))}
              {(onEdit || onDelete || onView) && (
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(row.id)}
                      className="h-8 w-8 p-0"
                      title="View Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(row.id)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(row.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UnifiedTable; 