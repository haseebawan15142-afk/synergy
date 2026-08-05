import type { Metadata } from "next";
import { Card } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">System settings</h1>
      <Card className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          Use these CLI commands after Firebase Auth, Firestore, and Admin credentials are configured
          in <code className="text-zinc-900 dark:text-zinc-100">.env.local</code>:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <code className="text-zinc-900 dark:text-zinc-100">npm run admin:seed</code> — create the
            first admin user
          </li>
          <li>
            <code className="text-zinc-900 dark:text-zinc-100">npm run cms:export-blogs</code> —
            prepare blog migration payload
          </li>
          <li>
            <code className="text-zinc-900 dark:text-zinc-100">npm run cms:migrate</code> — push
            services, leadership, careers, blogs, navigation into Firestore
          </li>
          <li>
            Deploy <code className="text-zinc-900 dark:text-zinc-100">firestore.rules</code> and{" "}
            <code className="text-zinc-900 dark:text-zinc-100">storage.rules</code>
          </li>
        </ul>
        <p>
          Until migration runs, the public site continues to use local content files as a fallback.
        </p>
      </Card>
    </div>
  );
}
