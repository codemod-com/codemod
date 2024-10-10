import { UserProfile } from "@clerk/nextjs";

const UserPage = () => (
  <div className=" flex h-screen w-screen items-center justify-center">
    <UserProfile
      appearance={{
        elements: {
          navbarButton: "text-white",
          navbarButtonIcon: "text-white bg-white",
          profileSectionPrimaryButton: "text-white",
          menuButton: "text-white hover:text-gray-200",
        },
      }}
    />
  </div>
);

export default UserPage;
