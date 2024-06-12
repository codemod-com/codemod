import StudioLayout from "@/app/(website)/studio/StudioLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioLayout>{children}</StudioLayout>;
}
