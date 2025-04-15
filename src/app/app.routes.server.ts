import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Specific configuration for the jobs/:id route
  {
    path: 'jobs/:id',
    renderMode: RenderMode.Client, // Change to client-side rendering for this route
  },
  // Configuration for the auth/signup/:role route
  {
    path: 'auth/signup/:role',
    renderMode: RenderMode.Client, // Client-side rendering for this route
  },
  // Default for all other routes
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
