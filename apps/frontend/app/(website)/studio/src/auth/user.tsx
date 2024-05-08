import { UserProfile } from "@clerk/nextjs";

const UserPage = () => (
  <div className=" flex h-screen w-screen items-center justify-center">
    <UserProfile />
  </div>
);

export default UserPage;
