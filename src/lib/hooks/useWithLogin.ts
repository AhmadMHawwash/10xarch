import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "./useCurrentUser";

interface UseWithLoginReturn {
  withLogin: <TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn
  ) => (...args: TArgs) => TReturn | void;
}

export const useWithLogin = (): UseWithLoginReturn => {
  const router = useRouter();
  const pathname = usePathname();

  const { isSignedIn, isLoading } = useCurrentUser();
  return {
    withLogin:
      <TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn) =>
      (...args: TArgs): TReturn | void => {
        if (!isLoading && !isSignedIn) {
          router.push("/sign-in?next=" + pathname);
        } else if (!isLoading && isSignedIn) {
          return fn(...args);
        }
      },
  };
};
