/**
 * Login page — sole entry surface for the un-authenticated operator.
 *
 * Server component renders the layout shell; LoginForm is the client
 * island that handles POST + redirect.
 */

import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-bg text-text">
      <div className="w-full max-w-sm space-y-8 p-6">
        <header className="space-y-2 text-center">
          <h1 className="t-display-2">mini-mint</h1>
          <p className="t-aux">Sign in to continue.</p>
        </header>
        <LoginForm next={next ?? '/'} />
      </div>
    </main>
  );
}
