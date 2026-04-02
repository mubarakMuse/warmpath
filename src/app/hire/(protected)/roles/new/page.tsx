import { CreateRoleForm } from "@/components/create-role-form";

export default function NewRolePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-warm-ink">New role</h1>
      <p className="mt-2 max-w-xl text-sm text-warm-muted">
        After you create it, you’ll land on a page with the share link and incoming submissions.
      </p>
      <div className="mt-10">
        <CreateRoleForm />
      </div>
    </div>
  );
}
