import { useAuth } from "@auth/useAuth";

const SignUpPage = () => {
  const { SignUp } = useAuth();
  return (
    <div className=" flex h-screen w-screen items-center justify-center">
      <SignUp />
    </div>
  );
};

export default SignUpPage;
