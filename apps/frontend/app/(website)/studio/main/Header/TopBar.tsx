import AuthButtons from "@auth/AuthButtons";
import { Button } from "@studio/components/ui/button";
import { CodemodLogo } from "@studio/icons/CodemodLogo";

export let TopBar = () => {
  return (
    <div className="flex justify-between h-[50px] w-full flex-1 bg-white p-1">
      <Button
        variant="link"
        className="text-md -ml-1 pt-3 font-light text-gray-500 dark:text-gray-300"
      >
        <a href="/apps/studio/public" className="h-[25px]">
          <CodemodLogo />
        </a>
      </Button>
      <AuthButtons variant="studio" />
    </div>
  );
};
