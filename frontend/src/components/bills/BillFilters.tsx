import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LuFilter, LuSearch } from 'react-icons/lu';

interface BillFiltersProps {
  filters: { search: string; status: string; category: string; vendor: string };
  onFilterChange: (filters: BillFiltersProps['filters']) => void;
  categories?: string[];
  vendors?: string[];
  statuses?: string[];
}

export const BillFilters: React.FC<BillFiltersProps> = ({ filters, onFilterChange, categories = [], vendors = [], statuses = ['pending', 'approved', 'rejected', 'paid'] }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <LuFilter className="h-5 w-5" />
        Filters
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <LuSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search bills..."
              value={filters.search}
              onChange={e => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status || 'all'} onValueChange={(value: string) => onFilterChange({ ...filters, status: value === 'all' ? '' : value })}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={filters.category || 'all'} onValueChange={(value: string) => onFilterChange({ ...filters, category: value === 'all' ? '' : value })}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="vendor">Vendor</Label>
          <Select value={filters.vendor || 'all'} onValueChange={(value: string) => onFilterChange({ ...filters, vendor: value === 'all' ? '' : value })}>
            <SelectTrigger>
              <SelectValue placeholder="All vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vendors</SelectItem>
              {vendors.map(vendor => (
                <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
); 