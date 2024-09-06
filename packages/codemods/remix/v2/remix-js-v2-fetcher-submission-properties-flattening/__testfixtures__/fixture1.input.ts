import { useFetcher } from '@remix-run/react';

function SomeComponent() {
  const fetcher = useFetcher();
  fetcher.submission.formData;
  fetcher.submission.formMethod;
  fetcher.submission.formAction;
  fetcher.type;
}