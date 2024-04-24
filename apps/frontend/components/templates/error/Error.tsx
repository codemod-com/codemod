import type { ErrorPayload } from "@/types";
import { ErrorHero } from "./ErrorHero";
export function Error({ data }: { data?: ErrorPayload }) {
  return (
    <>
      <ErrorHero data={data} />
    </>
  );
}
