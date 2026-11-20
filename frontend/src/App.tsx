import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AmbientCanvas } from "./components/ui/AmbientCanvas";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";

import { Landing } from "./pages/Landing";
import { Pricing } from "./pages/Pricing";
import { Auth } from "./pages/Auth";
import { LegalPage } from "./pages/Legal";

import { Overview } from "./pages/Overview";
import { Projects } from "./pages/Projects";
import { NewProject } from "./pages/NewProject";
import { ProjectDetailsPage as ProjectDetails } from "./pages/ProjectDetails";
import { Workforce } from "./pages/Workforce";
import { WorkflowStudio } from "./pages/WorkflowStudio";
import { TaskCenterPage as TaskCenter } from "./pages/TaskCenter";
import { CodeWorkspace } from "./pages/CodeWorkspace";
import { TestingQA } from "./pages/TestingQA";
import { SecurityCenter } from "./pages/SecurityCenter";
import { ApprovalsCenter } from "./pages/ApprovalsCenter";
import { Analytics } from "./pages/Analytics";
import { AuditLogsPage as AuditLogs } from "./pages/AuditLogs";
import { Settings } from "./pages/Settings";
import { ArchitectureIntelligence } from "./pages/ArchitectureIntelligence";
import { GitReleases } from "./pages/GitReleases";
import { EngineeringReports } from "./pages/EngineeringReports";

export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AmbientCanvas />
          <div style={{ position: "relative", zIndex: 1 }}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              {/* Public Commercial & Auth Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/register" element={<Auth mode="register" />} />
              <Route path="/terms" element={<LegalPage section="terms" />} />
              <Route path="/privacy" element={<LegalPage section="privacy" />} />
              <Route path="/support" element={<LegalPage section="support" />} />

              {/* Authenticated / Workspace Application Routes */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Overview />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/new" element={<NewProject />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="agents" element={<Workforce />} />
                <Route path="workflows" element={<WorkflowStudio />} />
                <Route path="tasks" element={<TaskCenter />} />
                <Route path="code" element={<CodeWorkspace />} />
                <Route path="testing" element={<TestingQA />} />
                <Route path="security" element={<SecurityCenter />} />
                <Route path="approvals" element={<ApprovalsCenter />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="audit" element={<AuditLogs />} />
                <Route path="settings" element={<Settings />} />
                <Route path="architecture" element={<ArchitectureIntelligence />} />
                <Route path="git" element={<GitReleases />} />
                <Route path="reports" element={<EngineeringReports />} />
              </Route>

              {/* Backwards-compatible redirects for legacy direct links */}
              <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
              <Route path="/projects/new" element={<Navigate to="/app/projects/new" replace />} />
              <Route path="/agents" element={<Navigate to="/app/agents" replace />} />
              <Route path="/workflows" element={<Navigate to="/app/workflows" replace />} />
              <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
              <Route path="/code" element={<Navigate to="/app/code" replace />} />
              <Route path="/testing" element={<Navigate to="/app/testing" replace />} />
              <Route path="/security" element={<Navigate to="/app/security" replace />} />
              <Route path="/approvals" element={<Navigate to="/app/approvals" replace />} />
              <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
              <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
              <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
              <Route path="/architecture" element={<Navigate to="/app/architecture" replace />} />
              <Route path="/git" element={<Navigate to="/app/git" replace />} />
              <Route path="/reports" element={<Navigate to="/app/reports" replace />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </div>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
