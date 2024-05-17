import { UserProfile } from "@clerk/nextjs";

let UserPage = () => (
  <div className=" flex h-screen w-screen items-center justify-center">
    <UserProfile />
  </div>
);

export default UserPage;
