import { createClient } from "@/lib/supabase/server";
import { ensureData } from "../shared/repository";

export type OrganizationRole = "owner" | "admin" | "sales" | "planner" | "operator";
export type AssignableOrganizationRole = Exclude<OrganizationRole, "owner">;

export const organizationRepository = {
  async listForCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error("Supabase auth: " + error.message);
    if (!user) throw new Error("An authenticated user is required.");
    return ensureData("organization_members", await supabase.from("organization_members")
      .select("organization_id,role,organizations(*)").eq("user_id", user.id).order("created_at"));
  },
  async create(name: string, slug: string) {
    const supabase = await createClient();
    return ensureData("organizations", await supabase.from("organizations").insert({ name, slug }).select().single());
  },
  async listMembers(organizationId: string) {
    const supabase = await createClient();
    const members = ensureData("organization_members", await supabase.from("organization_members")
      .select("organization_id,user_id,role,created_at")
      .eq("organization_id", organizationId).order("created_at"));
    if (!members.length) return [];
    const profiles = ensureData("profiles", await supabase.from("profiles").select("id,full_name,avatar_url")
      .in("id", members.map((member) => member.user_id)));
    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    return members.map((member) => ({ ...member, profile: profilesById.get(member.user_id) ?? null }));
  },
  async addMember(organizationId: string, userId: string, role: AssignableOrganizationRole) {
    const supabase = await createClient();
    return ensureData("organization_members", await supabase.from("organization_members")
      .insert({ organization_id: organizationId, user_id: userId, role }).select().single());
  },
  async updateMemberRole(organizationId: string, userId: string, role: AssignableOrganizationRole) {
    const supabase = await createClient();
    return ensureData("organization_members", await supabase.from("organization_members")
      .update({ role }).eq("organization_id", organizationId).eq("user_id", userId).select().single());
  },
};
