import Settings from "@/components/Settings";
import BackButton from "@/components/ui/BackButton";

export default async function LeadersPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackButton />
      <Settings />
    </div>
  );
}
