'use client';

/**
 * ToasterMount — thin 'use client' wrapper around sonner's Toaster.
 *
 * Necessary because sonner exports its Toaster as a client component
 * with hooks + portal mount; importing it directly into a server
 * layout makes Webpack's module-boundary resolution unhappy
 * ("Cannot read properties of undefined (reading 'call')").
 * Wrapping it in a small client component is the canonical Next
 * 15 pattern for embedding client-only providers in server layouts.
 */

import { Toaster } from 'sonner';

export function ToasterMount(): React.ReactElement {
  return (
    <Toaster
      position="bottom-center"
      theme="dark"
      offset="6rem"
      closeButton
      toastOptions={{ className: 't-row' }}
    />
  );
}
