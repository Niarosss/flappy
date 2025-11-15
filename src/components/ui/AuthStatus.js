// src/components/AuthStatus.js

import { auth } from "@/auth"; // Імпортуємо auth (функцію сесії)
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export async function AuthStatus() {
  // Отримуємо сесію на сервері (Server Component)
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <p>Привіт, {session.user.name || session.user.email}!</p>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
}
