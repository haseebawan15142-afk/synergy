/**
 * Local Next.js often fails Firestore gRPC behind antivirus/proxy SSL inspection
 * ("self-signed certificate in certificate chain"). Relax TLS only for `next dev`.
 * Do NOT use this pattern for production deploys.
 */
import { spawn } from "node:child_process";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const child = spawn("npx", ["next", "dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
