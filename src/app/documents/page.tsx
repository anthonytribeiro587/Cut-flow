import { PageHeader } from "@/components/page-header";
import { DocumentsBrowser } from "@/components/documents-browser";
import { projectService } from "@/services/project-service";

export const dynamic = "force-dynamic";
export default async function DocumentsPage() { const { documents, projects } = await projectService.getDocumentsPageData(); return <><PageHeader title="Documentos" description="Encontre documentos de projetos, plantas, laudos e registros em um só lugar." /><DocumentsBrowser documents={documents} projects={projects} /></>; }
