import React from 'react';
import { useWorkflows } from '../../hooks/useWorkflows';
import { useWorkflowFilters } from '../../hooks/useWorkflowFilters';
import { WorkflowItem } from './WorkflowItem';
import { WorkflowControls } from './WorkflowControls';
import { Pagination } from '../common/Pagination';

export function RecentWorkflows() {
  const { workflows, updateWorkflowStatus, deleteWorkflow } = useWorkflows();
  const {
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
  } = useWorkflowFilters(workflows);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Workflows</h2>
        
        <div className="mt-4">
          <WorkflowControls
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortField={sortField}
            onSortFieldChange={setSortField}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        </div>

        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {paginatedWorkflows.map((workflow) => (
              <WorkflowItem 
                key={workflow.id} 
                workflow={workflow}
                onStatusChange={updateWorkflowStatus}
                onDelete={deleteWorkflow}
              />
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}