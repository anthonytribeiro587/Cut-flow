import { PageHeader } from "@/components/page-header";
import { UpdatesFeed } from "@/components/updates-feed";
import { projectService } from "@/services/project-service";

export const dynamic = "force-dynamic";
export default async function UpdatesPage() { const { projects, updates, issues } = await projectService.getUpdatesPageData(); return <><PageHeader title="Atualizações de obra" description="Registros recentes para manter o histórico e as equipes no mesmo contexto." /><UpdatesFeed projects={projects} updates={updates} issues={issues} /></>; }
