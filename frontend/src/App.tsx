import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { OverviewPage } from "./pages/Overview";
import { NewProjectPage } from "./pages/NewProject";
import { ProjectsPage } from "./pages/Projects";
import { ProjectDetailsPage } from "./pages/ProjectDetails";
import { WorkforcePage } from "./pages/Workforce";
import { WorkflowStudioPage } from "./pages/WorkflowStudio";
import { TaskCenterPage } from "./pages/TaskCenter";
import { CodeWorkspacePage } from "./pages/CodeWorkspace";
import { TestingQAPage } from "./pages/TestingQA";
import { SecurityCenterPage } from "./pages/SecurityCenter";
import { ArchitectureIntelligencePage } from "./pages/ArchitectureIntelligence";
import { ApprovalsCenterPage } from "./pages/ApprovalsCenter";
import { GitReleasesPage } from "./pages/GitReleases";
import { EngineeringReportsPage } from "./pages/EngineeringReports";
import { AnalyticsPage } from "./pages/Analytics";
import { AuditLogsPage } from "./pages/AuditLogs";
import { SettingsPage } from "./pages/Settings";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/workforce" element={<WorkforcePage />} />
          <Route path="/workflow-studio" element={<WorkflowStudioPage />} />
          <Route path="/tasks" element={<TaskCenterPage />} />
          <Route path="/workspace" element={<CodeWorkspacePage />} />
          <Route path="/testing" element={<TestingQAPage />} />
          <Route path="/security" element={<SecurityCenterPage />} />
          <Route path="/architecture" element={<ArchitectureIntelligencePage />} />
          <Route path="/approvals" element={<ApprovalsCenterPage />} />
          <Route path="/git-releases" element={<GitReleasesPage />} />
          <Route path="/reports" element={<EngineeringReportsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
