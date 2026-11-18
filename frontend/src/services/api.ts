/**
 * SYNAPSE API Client
 */

const API_BASE = "http://127.0.0.1:8000/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    if (res.status === 204) {
      return {} as T;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request<any>("/health"),

  // Projects
  getProjects: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    return request<any[]>(`/projects?${params.toString()}`);
  },
  getProject: (id: string) => request<any>(`/projects/${id}`),
  getProjectDetails: (id: string) => request<any>(`/projects/${id}/details`),
  createProject: (data: any) => request<any>("/projects", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => request<any>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<any>(`/projects/${id}`, { method: "DELETE" }),

  // Agents
  getAgents: () => request<any[]>("/agents"),
  getAgent: (id: string) => request<any>(`/agents/${id}`),
  getAgentTasks: (id: string) => request<any[]>(`/agents/${id}/tasks`),

  // Workflows
  getWorkflow: (id: string) => request<any>(`/workflows/${id}`),
  getProjectWorkflow: (projectId: string) => request<any>(`/workflows/project/${projectId}`),
  startWorkflow: (id: string) => request<any>(`/workflows/${id}/start`, { method: "POST" }),
  pauseWorkflow: (id: string) => request<any>(`/workflows/${id}/pause`, { method: "POST" }),
  resumeWorkflow: (id: string) => request<any>(`/workflows/${id}/resume`, { method: "POST" }),
  cancelWorkflow: (id: string) => request<any>(`/workflows/${id}/cancel`, { method: "POST" }),

  // Tasks
  getTasks: (projectId?: string, status?: string, agentId?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append("project_id", projectId);
    if (status) params.append("status", status);
    if (agentId) params.append("agent_id", agentId);
    return request<any[]>(`/tasks?${params.toString()}`);
  },
  getTask: (id: string) => request<any>(`/tasks/${id}`),
  retryTask: (id: string) => request<any>(`/tasks/${id}/retry`, { method: "POST" }),

  // Artifacts
  getProjectArtifacts: (projectId: string) => request<any[]>(`/artifacts/project/${projectId}`),
  getProjectFileTree: (projectId: string) => request<any[]>(`/artifacts/project/${projectId}/tree`),
  getArtifact: (id: string) => request<any>(`/artifacts/${id}`),
  getDownloadUrl: (projectId: string) => `${API_BASE}/artifacts/project/${projectId}/download`,

  // Testing & QA
  getProjectTestRuns: (projectId: string) => request<any[]>(`/testing/project/${projectId}`),
  executeTests: (projectId: string) => request<any>(`/testing/project/${projectId}/execute`, { method: "POST" }),

  // Security
  getProjectSecurityScans: (projectId: string) => request<any[]>(`/security/project/${projectId}`),
  executeSecurityScan: (projectId: string) => request<any>(`/security/project/${projectId}/execute`, { method: "POST" }),

  // Approvals
  getApprovals: (projectId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append("project_id", projectId);
    if (status) params.append("status", status);
    return request<any[]>(`/approvals?${params.toString()}`);
  },
  resolveApproval: (id: string, decision: "approved" | "rejected", comments?: string) =>
    request<any>(`/approvals/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ decision, comments, resolver_name: "Principal Engineer" }),
    }),

  // Analytics
  getAnalyticsOverview: () => request<any>("/analytics/overview"),
  getAgentWorkloads: () => request<any[]>("/analytics/agents"),
  getUsageMetrics: () => request<any[]>("/analytics/usage"),

  // Audit Logs
  getAuditLogs: (projectId?: string, eventType?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append("project_id", projectId);
    if (eventType) params.append("event_type", eventType);
    return request<any[]>(`/audit/logs?${params.toString()}`);
  },

  // Git & Releases
  getRepoStatus: (projectId: string) => request<any>(`/git/project/${projectId}`),
  getCommits: (projectId: string) => request<any[]>(`/git/project/${projectId}/commits`),
  getPullRequests: (projectId: string) => request<any[]>(`/git/project/${projectId}/pull-requests`),
  createPullRequest: (projectId: string, data: any) =>
    request<any>(`/git/project/${projectId}/pull-requests`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  mergePullRequest: (projectId: string, prId: number) =>
    request<any>(`/git/project/${projectId}/pull-requests/${prId}/merge`, { method: "POST" }),

  // Architecture Intelligence
  getProjectArchitecture: (projectId: string) => request<any>(`/architecture/project/${projectId}`),

  // Engineering Reports
  getDeliveryReport: (projectId: string) => request<any>(`/reports/project/${projectId}`),
  getReportDownloadUrl: (projectId: string) => `${API_BASE}/reports/project/${projectId}/markdown`,
};

