import { type ClassValue, clsx } from "clsx";
import { any, flip, includes } from "ramda";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const anyElementExists = <T = string>(arrayA: T[], arrayB: T[]) =>
  any(flip(includes)(arrayA), arrayB);

export const getTestToken = () =>
  "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yTkhTQmFySFpONDRlVm5PNTVoM1pSbmdNSUUiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NvZGVtb2QuY29tIiwiZXhwIjoxNzE1MzQxNDU2LCJmdWxsTmFtZSI6IkJlbm55IEpvbyIsImlhdCI6MTcxNTM0MTM5NiwiaXNzIjoiaHR0cHM6Ly9jbGVyay5jb2RlbW9kLmNvbSIsImp0aSI6IjYxMjViOTc1YjY2M2U2OTkwYzg0IiwibmJmIjoxNzE1MzQxMzg2LCJzaWQiOiJzZXNzXzJnQk9XanNoYmtYYjNuVm01OUM4TFpncm53MCIsInN1YiI6InVzZXJfMk5aSVdoNk5TRURDTE5Za3NKN00wNm9CbFd3In0.ThONHE5CH_LXUI4IEa5X-KELXZh2RHjxIPK7dVNXMiEwIMNyugnM0nq3GqzDGKokpz6Ue7zAjIpIqXubpV-sGImJocHRZWLHh_Mogp9myLCYKASQPqqkOoxb4fgAE7VxbgprXpfzHX1t73oA47cxgyu76BXBRq_N0x0TJlPLh8Weyhl7cJwo3oN_o7p6nw7E4Je_qzUDeFBM1PGTcrAViib4dyYdmUGNOu0WmJZRzLjMonvB_MrZ3_dZwYncYE6asCARCsa44rfoBtT4pPID991oKRkf2Jh55UmLlRCcj28Pf54TkJftyeRbQy1zVH4FwO9jBTnArucSpPRSG-70Jg";

export { cn };
export * from "./getBlocksToc";
export * from "./getImageProps";
export * from "./openLink";
