import HelpPageClient from "@/components/HelpPageClient";
import BackButton from "@/components/ui/BackButton";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackButton />
      <HelpPageClient />
    </div>
  );
}
