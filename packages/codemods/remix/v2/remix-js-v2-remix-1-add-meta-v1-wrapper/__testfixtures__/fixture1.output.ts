import { metaV1 } from '@remix-run/v1-meta';

export function meta(args) {
  return metaV1(args, {
    title: '...',
    description: '...',
    'og:title': '...',
  });
}