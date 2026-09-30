import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
  return <div className="mx-auto max-w-3xl"><div className="mb-5"><Link href="/" className="text-xs font-medium text-forest">← Voltar ao acompanhamento</Link></div><LoginForm nextPath={nextPath} /></div>;
}
