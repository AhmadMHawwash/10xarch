import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "./useCurrentUser";

export const useWithLogin = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { isSignedIn } = useCurrentUser();
  return {
    withLogin:
      <TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn) =>
      (...args: TArgs) => {
        if (!isSignedIn) {
          router.push("/sign-in?next=" + pathname);
        } else {
          return fn(...args);
        }
      },
  };
};
