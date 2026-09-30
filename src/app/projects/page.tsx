import { PageHeader } from "@/components/page-header";
import { ProjectsBrowser } from "@/components/projects-browser";
import { projectService } from "@/services/project-service";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await projectService.getProjects();
  return <><PageHeader title="Projetos" description="Visão consolidada das obras, prazos, responsáveis e progresso físico." /><ProjectsBrowser projects={projects} /></>;
}
