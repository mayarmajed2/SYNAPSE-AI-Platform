/**
 * SYNAPSE API Client — JWT-aware HTTP client with typed endpoints
 */

import { isDemoMode, getDemoResponse } from "./demoData";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://127.0.0.1:8000";
const API_BASE = `${API_ORIGIN}/api/v1`;
const TOKEN_STORAGE_KEY = "synapse_access_token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (isDemoMode()) {
    return getDemoResponse(endpoint, options.method || "GET") as T;
  }

  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
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

  // Authentication
  register: (data: { email: string; full_name: string; password: string; workspace_name?: string }) =>
    request<any>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<any>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  demoLogin: () => request<any>("/auth/demo-login", { method: "POST" }),
  getMe: () => request<any>("/auth/me"),
  forgotPassword: (email: string) =>
    request<any>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, new_password: string) =>
    request<any>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, new_password }) }),

  // Billing & Subscriptions (Stripe / Quotas)
  getBillingStatus: () => request<any>("/billing/status"),
  createCheckout: (plan: string, billing_cycle: "monthly" | "annual" = "annual") =>
    request<any>("/billing/checkout", { method: "POST", body: JSON.stringify({ plan, billing_cycle }) }),

  // Workspace Settings
  getSettings: () => request<any>("/settings"),
  updateSettings: (data: any) => request<any>("/settings", { method: "PUT", body: JSON.stringify(data) }),

  // Projects
  getProjects: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const qs = params.toString();
    return request<any[]>(`/projects${qs ? `?${qs}` : ""}`);
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
    const qs = params.toString();
    return request<any[]>(`/tasks${qs ? `?${qs}` : ""}`);
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
    const qs = params.toString();
    return request<any[]>(`/approvals${qs ? `?${qs}` : ""}`);
  },
  resolveApproval: (id: string, decision: "approved" | "rejected", comments?: string, resolverName?: string) =>
    request<any>(`/approvals/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ decision, comments, resolver_name: resolverName || "Workspace Admin" }),
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
    const qs = params.toString();
    return request<any[]>(`/audit/logs${qs ? `?${qs}` : ""}`);
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
  pushToGitHub: (projectId: string, data: { repository: string; branch?: string; github_token?: string; commit_message?: string }) =>
    request<any>(`/git/project/${projectId}/push-github`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Architecture Intelligence
  getProjectArchitecture: (projectId: string) => request<any>(`/architecture/project/${projectId}`),

  // Engineering Reports
  getDeliveryReport: (projectId: string) => request<any>(`/reports/project/${projectId}`),
  getReportDownloadUrl: (projectId: string) => `${API_BASE}/reports/project/${projectId}/markdown`,
};
