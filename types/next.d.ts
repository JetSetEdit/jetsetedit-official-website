import type { Metadata } from 'next';

declare module 'next' {
  interface PageProps<
    TParams extends Record<string, string> = Record<string, string>,
    TSearchParams extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
  > {
    params: TParams;
    searchParams: TSearchParams;
  }
} 