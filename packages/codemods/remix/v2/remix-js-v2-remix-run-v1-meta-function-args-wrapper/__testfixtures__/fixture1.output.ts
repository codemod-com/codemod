import { getMatchesData } from '@remix-run/v1-meta';

export function meta(args) {
  const matchesData = getMatchesData(args);
  const parentData = matchesData['routes/parent'];
}