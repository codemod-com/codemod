import { type ClassValue, clsx } from "clsx";
import { any, flip, includes } from "ramda";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const anyElementExists = <T = string>(arrayA: T[], arrayB: T[]) =>
  any(flip(includes)(arrayA), arrayB);

export const getTestToken = () =>
  "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yTkhTQmFySFpONDRlVm5PNTVoM1pSbmdNSUUiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NvZGVtb2QuY29tIiwiZXhwIjoxNzE1NjE3NzA4LCJmdWxsTmFtZSI6IkJlbm55IEpvbyIsImlhdCI6MTcxNTYxNzY0OCwiaXNzIjoiaHR0cHM6Ly9jbGVyay5jb2RlbW9kLmNvbSIsImp0aSI6IjU3MTFlYjljNGNmYTJmYzU3Zjk3IiwibmJmIjoxNzE1NjE3NjM4LCJzaWQiOiJzZXNzXzJnQk9XanNoYmtYYjNuVm01OUM4TFpncm53MCIsInN1YiI6InVzZXJfMk5aSVdoNk5TRURDTE5Za3NKN00wNm9CbFd3In0.Tvq28a__fGr959As5QkpZ6HKA2lCsLlQnIjIE97KEY0ZMOs7jRRTQaK23-EQtZTWIoyORto6m2Qk6-Yy2Di3G35cZ4ixqo3HhnfUM9Ce7geWqI6qPaiEthSITyv_s4-oTZ2605a_u6netsjCVFlvXUhTb2IxXjOs-CzL_s2-3Jq2aFArwUTPfE_LosySWGv97Tt8MvgDsK5j0pSk7aRU8e8ujca3OSLwf64JyrJOXk1NMPoxlhYG1AGOncm_sEi9LYWAa9fEhGZn8D2dU_8pHbxRq4caNdMNn_HIFpditSgXDVYWj7k-nEL7DxRbLbbBe4ii-L8lc2U7FPfJEDCBaA";

export { cn };
export * from "./getBlocksToc";
export * from "./getImageProps";
export * from "./openLink";
