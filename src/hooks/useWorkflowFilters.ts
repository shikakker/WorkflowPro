import { useState, useMemo } from 'react';
import { Workflow } from '../types';

type SortField = 'name' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export function useWorkflowFilters(workflows: Workflow[]) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const filteredWorkflows = useMemo(() => {
    return workflows
      .filter(workflow => 
        (statusFilter === 'all' || workflow.status === statusFilter) &&
        workflow.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const modifier = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'name') {
          return modifier * a.name.localeCompare(b.name);
        }
        return modifier * (b.updatedAt.getTime() - a.updatedAt.getTime());
      });
  }, [workflows, search, statusFilter, sortField, sortOrder]);

  const paginatedWorkflows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredWorkflows.slice(start, start + itemsPerPage);
  }, [filteredWorkflows, page]);

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    totalPages,
    paginatedWorkflows,
  };
}