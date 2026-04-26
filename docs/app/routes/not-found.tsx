import type { Route } from './+types/not-found';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { baseOptions } from '@/lib/layout.shared';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Not Found · Sone' }];
}

export default function NotFound() {
  return (
    <HomeLayout {...baseOptions()}>
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24 gap-4">
        <h1 className="text-5xl font-medium tracking-tight text-fd-foreground">
          404
        </h1>
        <p className="text-fd-muted-foreground max-w-md">
          That page does not exist. It may have been moved, or never existed in
          the first place.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center rounded-full bg-fd-primary text-fd-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
      </main>
    </HomeLayout>
  );
}
