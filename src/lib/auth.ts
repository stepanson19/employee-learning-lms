import type { DemoAccount, Role, Session, User } from "@/types/lms";
import { users } from "@/data/lms";

export type AuthResult = { ok: true; session: Session } | { ok: false; message: string };

const restrictedRoutes: Record<Role, string[]> = {
  employee: ["/analytics"],
  hr: [],
  author: []
};

export function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("ru");
}

export function createSession(account: DemoAccount, user: User): Session {
  return {
    userId: user.id,
    name: user.name,
    role: user.role,
    email: normalizeEmail(account.email)
  };
}

export function authenticateUser(accounts: DemoAccount[], email: string, passcode: string, userList: User[] = users): AuthResult {
  const normalizedEmail = normalizeEmail(email);
  const account = accounts.find((item) => normalizeEmail(item.email) === normalizedEmail && item.passcode === passcode);
  const user = account ? userList.find((item) => item.id === account.userId) : undefined;

  if (!account || !user) {
    return { ok: false, message: "неверная почта или код доступа" };
  }

  return { ok: true, session: createSession(account, user) };
}

export function canAccessRoute(role: Role, pathname: string): boolean {
  return !restrictedRoutes[role].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
