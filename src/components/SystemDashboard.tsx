import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
import { Button } from "./ui/button";
import { H5, Large, P } from "./ui/typography";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet";

export const Dashboard = () => {
  const { level, toNextLevel, toPreviousLevel } = useLevelManager();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-gray-400 m-2 z-[500]">
          <BookOpenText className="mr-2" size="17" /> Challenge statement
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          {/* <SheetTitle></SheetTitle> */}
          <SheetDescription className="text-black">
            <div className="mb-2 flex justify-between">
              <Button size="sm" variant="outline" onClick={toPreviousLevel}>
                <ArrowLeft className="mr-1" />
                Previous
              </Button>
              <H5>{level?.title}</H5>
              <Button size="sm" variant="outline" onClick={toNextLevel}>
                Next
                <ArrowRight className="ml-1" />
              </Button>
            </div>
            <Large></Large>
            <P>{level?.description}</P>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
