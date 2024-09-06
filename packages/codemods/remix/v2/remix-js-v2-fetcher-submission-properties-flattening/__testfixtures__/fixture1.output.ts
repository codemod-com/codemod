import { useFetcher } from '@remix-run/react';

function SomeComponent() {
  const fetcher = useFetcher();

  // these keys are flattened
  fetcher.formData;
  fetcher.formMethod;
  fetcher.formAction;

  // this key is removed
  fetcher.type;
}