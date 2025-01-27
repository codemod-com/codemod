import {
  Avatar,
  AvatarFallback,
} from "@/app/(website)/studio/src/components/ui/avatar";
import { Button } from "@/app/(website)/studio/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/(website)/studio/src/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { memo, useCallback, useMemo } from "react";

export const UserButton = memo(
  ({ afterSignOutUrl }: { afterSignOutUrl?: string }) => {
    const { status, data } = useSession();

    const handleLogout = useCallback(() => {
      signOut({ callbackUrl: afterSignOutUrl });
    }, [afterSignOutUrl]);

    const { avatarFallback, name, email } = useMemo(() => {
      return {
        avatarFallback:
          data?.user?.email?.substring(0, 2).toUpperCase() ?? "PR",
        name: data?.user?.name,
        email: data?.user?.email,
      };
    }, [data?.user]);

    if (status !== "authenticated") {
      return null;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 z-50 bg-white dark:bg-black"
          align="end"
          forceMount
        >
          {name && email && (
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {name && (
                  <p className="text-sm font-medium leading-none">{name}</p>
                )}
                {email && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="dark:hover:text-black"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
