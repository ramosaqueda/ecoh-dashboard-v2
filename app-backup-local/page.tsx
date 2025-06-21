import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId, redirectToSignIn } = await auth();

  if (userId) {
    redirect('/dashboard');
  }
  if (!userId) return redirectToSignIn();
}
