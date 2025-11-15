// src/components/SignOutButton.js

import { signOut } from "@/auth"; // Імпортуємо signOut з auth.js

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server"; // 💡 Server Action

        // Викликаємо функцію signOut.
        // За замовчуванням перенаправляє на головну сторінку.
        await signOut();
      }}
    >
      <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded">
        Вийти
      </button>
    </form>
  );
}
