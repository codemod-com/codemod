import { type ClassValue, clsx } from "clsx";
import { any, flip, includes } from "ramda";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const anyElementExists = <T = string>(arrayA: T[], arrayB: T[]) =>
  any(flip(includes)(arrayA), arrayB);

export const getTestToken = () =>
  "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18yTkhTQmFySFpONDRlVm5PNTVoM1pSbmdNSUUiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NvZGVtb2QuY29tIiwiZXhwIjoxNzE1MzUyMDUzLCJmdWxsTmFtZSI6bnVsbCwiaWF0IjoxNzE1MzUxOTkzLCJpc3MiOiJodHRwczovL2NsZXJrLmNvZGVtb2QuY29tIiwianRpIjoiY2QxZDcwNTI1YjhmNWY1MWU1ZGMiLCJuYmYiOjE3MTUzNTE5ODMsInNpZCI6InNlc3NfMmdITHNYcFR5emlJTkhmZ2NJalpud2lzbzlLIiwic3ViIjoidXNlcl8yTk1tWExrUzc1d1VnZG51UzdUajU1TDF1NTAifQ.We4ABNecP5Upk39n9_LmYxPBAv2nQhti3PMIGGhvxX0Ap3cR0M7cZUBjx5tp2icRXUYPTY1b_-_37LapWimQJKmdUuZ5Ssg7_wu7uZMn5ezwpOIGrqpZvk0EDyifAM5UYKsiVjsy-O1eaUrjiEI-JHM1TvnnuiWmU0yS2KvpSDHnPX6uag6zdQcFmrIpCIjlJcdC7evefyWV1Ac9hQtoXGYUqw2LMjQc7KPko7EIKC_OYYDfe23vhwm6f1sWkY_6M4cwVg0boGFA4n4IrUrGu4gqWk29hWr18xKGZOmSYaGnw2iaPxVmcgRa0-sbxLfsiZqKN8hpy9TIwJC6r4tOOw";
export { cn };
export * from "./getBlocksToc";
export * from "./getImageProps";
export * from "./openLink";
