// src/components/SignInButton.js

import { signIn } from "@/auth"; // Імпортуємо signIn з auth.js

export function SignInButton() {
  return (
    <form
      action={async () => {
        "use server"; // 💡 Server Action

        // Викликаємо функцію signIn, вказуючи провайдера
        // "google" має відповідати імені провайдера у вашому auth.js
        await signIn("google");

        // Якщо потрібно перенаправити на дашборд:
        // await signIn("google", { redirectTo: "/dashboard" });
      }}
    >
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Увійти через Google
      </button>
    </form>
  );
}
