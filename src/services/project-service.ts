import type { Contractor, ContractorProject, DocumentItem, Issue, Project, Stage, Update } from "@/types";
import { getSupabaseServerClient, throwDataError } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type StageRow = Database["public"]["Tables"]["project_stages"]["Row"];
type IssueRow = Database["public"]["Tables"]["issues"]["Row"];
type VendorRow = Database["public"]["Tables"]["vendors"]["Row"];
type ProjectVendorRow = Database["public"]["Tables"]["project_vendors"]["Row"];
type UpdateRow = Database["public"]["Tables"]["project_updates"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

const projectColumns = "id,code,name,unit_name,city,project_type,status,manager_name,start_date,planned_end_date,actual_end_date,progress,description";
const stageColumns = "id,project_id,name,sort_order,status,owner_name,vendor_id,planned_start_date,planned_end_date,actual_start_date,actual_end_date,progress,notes";
const issueColumns = "id,project_id,stage_id,vendor_id,title,description,priority,status,owner_name,due_date";
const projectVendorColumns = "id,project_id,vendor_id,service_scope,start_date,planned_end_date,status";
const updateColumns = "id,project_id,stage_id,issue_id,author_name,body,progress,occurred_at";
const documentColumns = "id,project_id,stage_id,category,name,mime_type,size_bytes,uploaded_by,created_at";

function requiredDate(value: string | null) { return value ?? ""; }
function mapStage(row: StageRow, vendors: Map<string, string>): Stage {
  return { id: row.id, name: row.name, order: row.sort_order, owner: row.owner_name ?? "Não atribuído", contractor: row.vendor_id ? vendors.get(row.vendor_id) : undefined, start: requiredDate(row.planned_start_date), end: requiredDate(row.planned_end_date), actualStart: row.actual_start_date ?? undefined, actualEnd: row.actual_end_date ?? undefined, progress: row.progress, status: row.status as Stage["status"], note: row.notes ?? undefined };
}
function mapIssue(row: IssueRow, stages: Map<string, string>, vendors: Map<string, string>): Issue {
  return { id: row.id, title: row.title, description: row.description ?? undefined, projectId: row.project_id, stage: row.stage_id ? stages.get(row.stage_id) ?? "Etapa não informada" : "Sem etapa", stageId: row.stage_id ?? undefined, owner: row.owner_name ?? "Não atribuído", contractor: row.vendor_id ? vendors.get(row.vendor_id) : undefined, contractorId: row.vendor_id ?? undefined, priority: row.priority as Issue["priority"], due: requiredDate(row.due_date), status: row.status as Issue["status"] };
}
function mapProject(row: ProjectRow, stages: Stage[], counts: { issues: number; lateStages: number; contractors: number }): Project {
  return { id: row.id, name: row.name, unit: row.unit_name, city: row.city ?? "", type: row.project_type, owner: row.manager_name ?? "Não atribuído", start: requiredDate(row.start_date), due: requiredDate(row.planned_end_date), actualEnd: row.actual_end_date ?? undefined, progress: row.progress, status: row.status as Project["status"], summary: row.description ?? "Sem descrição cadastrada.", openIssueCount: counts.issues, overdueStageCount: counts.lateStages, contractorCount: counts.contractors, stages };
}
function formatSize(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function fileKind(mime: string | null) { return mime?.split("/").at(-1)?.toUpperCase() ?? "ARQUIVO"; }

async function getPortfolioRows() {
  const supabase = await getSupabaseServerClient();
  const [projects, stages, issues, vendors, projectVendors] = await Promise.all([
    supabase.from("projects").select(projectColumns).order("created_at", { ascending: true }),
    supabase.from("project_stages").select(stageColumns).order("sort_order", { ascending: true }),
    supabase.from("issues").select(issueColumns),
    supabase.from("vendors").select("id,name,specialty,active"),
    supabase.from("project_vendors").select(projectVendorColumns).neq("status", "Cancelado"),
  ]);
  if (projects.error) throwDataError("projects", projects.error);
  if (stages.error) throwDataError("project_stages", stages.error);
  if (issues.error) throwDataError("issues", issues.error);
  if (vendors.error) throwDataError("vendors", vendors.error);
  if (projectVendors.error) throwDataError("project_vendors", projectVendors.error);
  return { projectRows: projects.data as ProjectRow[], stageRows: stages.data as StageRow[], issueRows: issues.data as IssueRow[], vendorRows: vendors.data as VendorRow[], projectVendorRows: projectVendors.data as ProjectVendorRow[] };
}

function mapPortfolio(rows: Awaited<ReturnType<typeof getPortfolioRows>>) {
  const vendorNames = new Map(rows.vendorRows.map((vendor) => [vendor.id, vendor.name]));
  const stageNames = new Map(rows.stageRows.map((stage) => [stage.id, stage.name]));
  const stagesByProject = new Map<string, Stage[]>();
  for (const row of rows.stageRows) stagesByProject.set(row.project_id, [...(stagesByProject.get(row.project_id) ?? []), mapStage(row, vendorNames)]);
  const issuesByProject = new Map<string, number>();
  for (const row of rows.issueRows) if (row.status !== "Resolvida") issuesByProject.set(row.project_id, (issuesByProject.get(row.project_id) ?? 0) + 1);
  const vendorsByProject = new Map<string, Set<string>>();
  for (const row of rows.projectVendorRows) vendorsByProject.set(row.project_id, (vendorsByProject.get(row.project_id) ?? new Set()).add(row.vendor_id));
  const projects = rows.projectRows.map((row) => {
    const stages = stagesByProject.get(row.id) ?? [];
    return mapProject(row, stages, { issues: issuesByProject.get(row.id) ?? 0, lateStages: stages.filter((stage) => stage.status === "Atrasado").length, contractors: vendorsByProject.get(row.id)?.size ?? 0 });
  });
  const issues = rows.issueRows.map((row) => mapIssue(row, stageNames, vendorNames));
  return { projects, issues, vendorNames, stageNames, rows };
}

export interface ProjectDetailData { project: Project; issues: Issue[]; updates: Update[]; documents: DocumentItem[]; contractors: Contractor[] }

export const projectService = {
  async getProjects() { return mapPortfolio(await getPortfolioRows()).projects; },
  async getDashboardData() {
    const rows = await getPortfolioRows(); const portfolio = mapPortfolio(rows);
    const supabase = await getSupabaseServerClient();
    const updatesResult = await supabase.from("project_updates").select(updateColumns).order("occurred_at", { ascending: false }).limit(100);
    if (updatesResult.error) throwDataError("project_updates", updatesResult.error);
    const projectNames = new Map(rows.projectRows.map((row) => [row.id, row.name]));
    return { ...portfolio, updates: (updatesResult.data as UpdateRow[]).map((row) => mapUpdate(row, projectNames.get(row.project_id) ?? "Projeto", portfolio.stageNames)) };
  },
  async getIssuesPageData() { const portfolio = mapPortfolio(await getPortfolioRows()); const vendorIdsByProject: Record<string, string[]> = {}; for (const relation of portfolio.rows.projectVendorRows) vendorIdsByProject[relation.project_id] = [...(vendorIdsByProject[relation.project_id] ?? []), relation.vendor_id]; return { ...portfolio, vendors: portfolio.rows.vendorRows.map(({ id, name }) => ({ id, name })), vendorIdsByProject }; },
  async getContractorsPageData() {
    const portfolio = mapPortfolio(await getPortfolioRows());
    return { projects: portfolio.projects, issues: portfolio.issues, contractors: mapContractors(portfolio.rows.vendorRows, portfolio.rows.projectVendorRows, portfolio.rows.stageRows, portfolio.rows.issueRows) };
  },
  async getUpdatesPageData() {
    const portfolio = mapPortfolio(await getPortfolioRows()); const supabase = await getSupabaseServerClient();
    const updatesResult = await supabase.from("project_updates").select(updateColumns).order("occurred_at", { ascending: false }).limit(100);
    if (updatesResult.error) throwDataError("project_updates", updatesResult.error);
    const projectNames = new Map(portfolio.rows.projectRows.map((row) => [row.id, row.name]));
    return { projects: portfolio.projects, issues: portfolio.issues, updates: (updatesResult.data as UpdateRow[]).map((row) => mapUpdate(row, projectNames.get(row.project_id) ?? "Projeto", portfolio.stageNames)) };
  },
  async getDocumentsPageData() {
    const portfolio = mapPortfolio(await getPortfolioRows()); const supabase = await getSupabaseServerClient();
    const result = await supabase.from("documents").select(documentColumns).order("created_at", { ascending: false });
    if (result.error) throwDataError("documents", result.error);
    const projectNames = new Map(portfolio.rows.projectRows.map((row) => [row.id, row.name]));
    return { projects: portfolio.projects, documents: (result.data as DocumentRow[]).map((row) => mapDocument(row, projectNames.get(row.project_id) ?? "Projeto", portfolio.stageNames)) };
  },
  async getProject(id: string): Promise<ProjectDetailData | undefined> {
    const supabase = await getSupabaseServerClient();
    const [projectResult, stagesResult, issuesResult, vendorsResult, relationsResult, updatesResult, documentsResult] = await Promise.all([
      supabase.from("projects").select(projectColumns).eq("id", id).maybeSingle(),
      supabase.from("project_stages").select(stageColumns).eq("project_id", id).order("sort_order"),
      supabase.from("issues").select(issueColumns).eq("project_id", id),
      supabase.from("vendors").select("id,name,specialty,active"),
      supabase.from("project_vendors").select(projectVendorColumns).eq("project_id", id).neq("status", "Cancelado"),
      supabase.from("project_updates").select(updateColumns).eq("project_id", id).order("occurred_at", { ascending: false }),
      supabase.from("documents").select(documentColumns).eq("project_id", id).order("created_at", { ascending: false }),
    ]);
    for (const [name, result] of [["projects", projectResult], ["project_stages", stagesResult], ["issues", issuesResult], ["vendors", vendorsResult], ["project_vendors", relationsResult], ["project_updates", updatesResult], ["documents", documentsResult]] as const) if (result.error) throwDataError(name, result.error);
    if (!projectResult.data) return undefined;
    const vendorRows = vendorsResult.data as VendorRow[];
    const vendorNames = new Map(vendorRows.map((row) => [row.id, row.name]));
    const stageRows = stagesResult.data as StageRow[];
    const stageNames = new Map(stageRows.map((row) => [row.id, row.name]));
    const stages = stageRows.map((row) => mapStage(row, vendorNames));
    const issueRows = issuesResult.data as IssueRow[];
    const openIssues = issueRows.filter((row) => row.status !== "Resolvida");
    const relationRows = relationsResult.data as ProjectVendorRow[];
    const project = mapProject(projectResult.data as ProjectRow, stages, { issues: openIssues.length, lateStages: stages.filter((stage) => stage.status === "Atrasado").length, contractors: relationRows.length });
    const updates = (updatesResult.data as UpdateRow[]).map((row) => mapUpdate(row, project.name, stageNames));
    const documents = (documentsResult.data as DocumentRow[]).map((row) => mapDocument(row, project.name, stageNames));
    const issues = issueRows.map((row) => mapIssue(row, stageNames, vendorNames));
    const contractors = mapContractors(vendorRows, relationRows, stageRows, issueRows).filter((vendor) => vendor.projectIds.includes(id));
    return { project, issues, updates, documents, contractors };
  },
};

function mapUpdate(row: UpdateRow, projectName: string, stages: Map<string, string>): Update {
  return { id: row.id, projectId: row.project_id, projectName, author: row.author_name, date: row.occurred_at, text: row.body, progress: row.progress ?? undefined, stage: row.stage_id ? stages.get(row.stage_id) ?? "Etapa não informada" : "Acompanhamento geral", stageId: row.stage_id ?? undefined, issueId: row.issue_id ?? undefined, photos: 0 };
}
function mapDocument(row: DocumentRow, projectName: string, stages: Map<string, string>): DocumentItem {
  return { id: row.id, name: row.name, category: row.category, projectId: row.project_id, projectName, stage: row.stage_id ? stages.get(row.stage_id) : undefined, author: row.uploaded_by ?? undefined, updatedAt: row.created_at.slice(0, 10), size: formatSize(row.size_bytes), kind: fileKind(row.mime_type) };
}
function mapContractors(vendors: VendorRow[], relations: ProjectVendorRow[], stages: StageRow[], issues: IssueRow[]): Contractor[] {
  return vendors.filter((vendor) => vendor.active).map((vendor) => {
    const vendorRelations = relations.filter((relation) => relation.vendor_id === vendor.id);
    const vendorStages = stages.filter((stage) => stage.vendor_id === vendor.id);
    const vendorIssues = issues.filter((issue) => issue.vendor_id === vendor.id && issue.status !== "Resolvida");
    const projects: ContractorProject[] = vendorRelations.map((relation) => {
      const projectStages = vendorStages.filter((stage) => stage.project_id === relation.project_id);
      const projectIssues = vendorIssues.filter((issue) => issue.project_id === relation.project_id);
      const status = projectStages.some((stage) => stage.status === "Atrasado") || projectIssues.some((issue) => issue.due_date && issue.due_date < new Date().toISOString().slice(0, 10)) ? "Atenção" : relation.status;
      return { projectId: relation.project_id, scope: relation.service_scope, start: relation.start_date ?? undefined, end: relation.planned_end_date ?? undefined, status, stageNames: projectStages.map((stage) => stage.name), openIssues: projectIssues.map((issue) => issue.title) };
    });
    return { id: vendor.id, name: vendor.name, specialty: vendor.specialty, projectIds: vendorRelations.map((relation) => relation.project_id), openActivities: vendorStages.filter((stage) => stage.status !== "Concluído").length + vendorIssues.length, overdueActivities: vendorStages.filter((stage) => stage.status === "Atrasado").length + vendorIssues.filter((issue) => issue.due_date && issue.due_date < new Date().toISOString().slice(0, 10)).length, projects };
  });
}
