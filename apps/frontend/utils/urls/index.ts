import config from "@/config";
import { formatPath } from "@tinloof/sanity-web";

export function isExternalUrl(url: string) {
  let regex =
    /^((http|https):\/\/)?[a-zA-Z0-9]+([-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z0-9-]{2,}(:[0-9]{1,5})?(\/.*)?$/;
  return regex.test(url);
}

export function pathToAbsUrl(path?: string): string | undefined {
  if (typeof path !== "string") return;

  return (
    config.baseUrl +
    // When creating absolute URLs, ensure the homepage doesn't have a trailing slash
    (path === "/" ? "" : formatPath(path))
  );
}
