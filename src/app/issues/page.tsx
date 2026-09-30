import { PageHeader } from "@/components/page-header";
import { IssuesBrowser } from "@/components/issues-browser";
import { projectService } from "@/services/project-service";

export const dynamic = "force-dynamic";
export default async function IssuesPage() { const { issues, projects, vendors, vendorIdsByProject } = await projectService.getIssuesPageData(); return <><PageHeader title="Pendências" description="Centralize riscos, bloqueios e ações para manter os projetos avançando." /><IssuesBrowser issues={issues} projects={projects} vendors={vendors} vendorIdsByProject={vendorIdsByProject} /></>; }
