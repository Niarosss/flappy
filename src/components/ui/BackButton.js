// filepath: c:\Users\suhar\Documents\My Projects\flappy\src\components\ui\BackButton.js
"use client"; // Це робить компонент клієнтським
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { CaretCircleLeftIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export default function BackButton() {
  const router = useRouter();
  const t = useTranslations("Controls");

  return (
    <Button
      onClick={() => router.push("/")}
      variant="gray"
      className="absolute top-6 left-6 z-40"
    >
      <CaretCircleLeftIcon size={24} weight="duotone" />
      {t("back")}
    </Button>
  );
}
