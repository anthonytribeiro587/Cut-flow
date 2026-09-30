export type ProjectStatus = "Em andamento" | "Atenção" | "Atrasado" | "Planejamento" | "Concluído";
export type StageStatus = "Não iniciado" | "Em andamento" | "Aguardando terceiro" | "Bloqueado" | "Concluído" | "Atrasado";
export type Priority = "Baixa" | "Média" | "Alta" | "Crítica";
export type IssueStatus = "Aberta" | "Em andamento" | "Aguardando terceiro" | "Resolvida";

export interface Stage { id: string; name: string; order: number; owner: string; contractor?: string; start: string; end: string; actualStart?: string; actualEnd?: string; progress: number; status: StageStatus; note?: string }
export interface Issue { id: string; title: string; description?: string; projectId: string; stage: string; stageId?: string; owner: string; contractor?: string; contractorId?: string; priority: Priority; due: string; status: IssueStatus }
export interface Contractor { id: string; name: string; specialty: string; projectIds: string[]; openActivities: number; overdueActivities: number; projects: ContractorProject[] }
export interface ContractorProject { projectId: string; scope: string; start?: string; end?: string; status: string; stageNames: string[]; openIssues: string[] }
export interface Project { id: string; name: string; unit: string; city: string; type: string; owner: string; start: string; due: string; actualEnd?: string; progress: number; status: ProjectStatus; summary: string; openIssueCount: number; overdueStageCount: number; contractorCount: number; stages: Stage[] }
export interface Update { id: string; projectId: string; projectName?: string; author: string; date: string; text: string; progress?: number; stage: string; stageId?: string; issueId?: string; photos: number }
export interface DocumentItem { id: string; name: string; category: string; projectId: string; projectName?: string; stage?: string; author?: string; updatedAt: string; size: string; kind: string }
