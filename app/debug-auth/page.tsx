// app/debug-auth/page.tsx
import { auth } from '@clerk/nextjs/server';

export default async function DebugAuthPage() {
  try {
    const { userId } = await auth();
    return (
      <div>
        <h1>Debug Auth</h1>
        <p>User ID: {userId || 'null'}</p>
        <p>Middleware: Working</p>
      </div>
    );
  } catch (error: any) {
    return (
      <div>
        <h1>Debug Auth - ERROR</h1>
        <p>Error: {error.message}</p>
        <p>Digest: {error.digest}</p>
      </div>
    );
  }
}