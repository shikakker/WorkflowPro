import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Workflow } from '../types';
import { requestWorkflowExecution } from '../services/workflowExecutionClient';
import type { WorkflowExecutionResult } from '../services/workflowExecution';
import {
  MAX_EXECUTION_HISTORY,
  loadExecutionHistory,
  recoverInterruptedExecutions,
  saveExecutionHistory,
  type WorkflowExecutionRecord,
} from '../services/workflowExecutionHistory';

function createExecutionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useWorkflowExecutions() {
  const [executions, setExecutions] = useState<WorkflowExecutionRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    return recoverInterruptedExecutions(loadExecutionHistory(window.localStorage));
  });
  const runningRef = useRef(new Set<string>());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveExecutionHistory(window.localStorage, executions);
  }, [executions]);

  const runWorkflow = useCallback(async (workflow: Workflow): Promise<WorkflowExecutionResult> => {
    const providerWorkflowId = workflow.providerWorkflowId?.trim();
    if (!providerWorkflowId) {
      return { status: 'failed', error: 'Provider workflow id is not configured' };
    }
    if (runningRef.current.has(workflow.id)) {
      return { status: 'failed', error: 'Workflow execution is already running' };
    }

    const executionId = createExecutionId();
    const startedAt = new Date();
    const runningRecord: WorkflowExecutionRecord = {
      id: executionId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'running',
      startedAt,
    };

    runningRef.current.add(workflow.id);
    setExecutions(previous => [runningRecord, ...previous].slice(0, MAX_EXECUTION_HISTORY));

    let result: WorkflowExecutionResult;
    try {
      result = await requestWorkflowExecution({
        workflowId: providerWorkflowId,
        payload: {},
      });
    } catch {
      result = { status: 'failed', error: 'Execution request could not reach the server' };
    } finally {
      runningRef.current.delete(workflow.id);
    }

    const completedAt = new Date();
    setExecutions(previous => previous.map(record => (
      record.id === executionId
        ? {
            ...record,
            status: result.status,
            completedAt,
            providerExecutionId: result.providerExecutionId,
            error: result.error,
          }
        : record
    )));

    return result;
  }, []);

  const executingWorkflowIds = useMemo(
    () => new Set(executions.filter(record => record.status === 'running').map(record => record.workflowId)),
    [executions],
  );

  const latestExecutionByWorkflow = useMemo(() => {
    const latest = new Map<string, WorkflowExecutionRecord>();
    for (const record of executions) {
      if (!latest.has(record.workflowId)) latest.set(record.workflowId, record);
    }
    return latest;
  }, [executions]);

  return {
    executions,
    runWorkflow,
    executingWorkflowIds,
    latestExecutionByWorkflow,
  };
}
