export const shortDate = (value: string) => value ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) : "A definir";
export const fullDate = (value: string) => value ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) : "A definir";
export const daysUntil = (value: string) => value ? Math.ceil((new Date(`${value.slice(0, 10)}T12:00:00`).getTime() - new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`).getTime()) / 86400000) : 0;
