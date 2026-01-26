import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { LuEye, LuTrash2, LuClock, LuCheck, LuX, LuDollarSign } from 'react-icons/lu';
import React from 'react';
import type { Bill } from '../../interfaces/Bill';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '../../context/ThemeContext';

interface BillsTableProps {
  bills: Bill[];
  onView: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { icon: LuClock, label: 'Pending' },
    approved: { icon: LuCheck, label: 'Approved' },
    rejected: { icon: LuX, label: 'Rejected' },
    paid: { icon: LuDollarSign, label: 'Paid' }
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const IconComponent = config.icon;
  return (
    <Badge className="flex items-center gap-1 w-fit">
      <IconComponent className="h-4 w-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const BillsTable: React.FC<BillsTableProps> = ({ bills, onView, onDelete }) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  const columns = React.useMemo<ColumnDef<Bill>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: info => (
        <div className="max-w-xs">
          <div className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{info.getValue() as string}</div>
          {info.row.original.description && (
            <div className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{info.row.original.description}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: info => (
        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {info.row.original.currency} {Number(info.getValue()).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: info => (
        <div className={isDark ? 'text-gray-300' : 'text-gray-900'}>{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: info => (
        <div className={isDark ? 'text-gray-300' : 'text-gray-900'}>{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => getStatusBadge(info.getValue() as string),
    },
    {
      accessorKey: 'bill_date',
      header: 'Bill Date',
      cell: info => (
        <div className={isDark ? 'text-gray-300' : 'text-gray-900'}>
          {new Date(info.getValue() as string).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: 'file_name',
      header: 'File',
      cell: info => (
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="truncate max-w-32">{info.getValue() as string}</div>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatFileSize(info.row.original.file_size)}</div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
            className="h-8 w-8 p-0"
          >
            <LuEye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
            className={`h-8 w-8 p-0 ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-950' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
          >
            <LuTrash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ], [onView, onDelete, isDark]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data: bills,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  });

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
        <thead className={isDark ? 'bg-gray-900' : 'bg-gray-50'}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>▲</span>}
                    {header.column.getIsSorted() === 'desc' && <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>▼</span>}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className={`divide-y ${isDark ? 'bg-gray-950 divide-gray-700 hover:' : 'bg-white divide-gray-200'}`}>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className={isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {bills.length === 0 && (
        <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="text-lg font-medium mb-2">No bills found</div>
          <div className="text-sm">Try adjusting your search or filters.</div>
        </div>
      )}
    </div>
  );
}; 