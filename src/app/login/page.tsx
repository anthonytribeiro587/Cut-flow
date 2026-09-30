import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
  return <div className="mx-auto max-w-3xl"><LoginForm nextPath={nextPath} /></div>;
}
