import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
import { Button } from "./ui/button";
import { H5, Large, P } from "./ui/typography";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "./ui/separator";

export const Dashboard = () => {
  const { stage, toNextStage, toPreviousStage, challenge } = useChallengeManager();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="z-[500] m-2 border-gray-400">
          <BookOpenText className="mr-2" size="17" /> Challenge statement
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          {/* <SheetTitle></SheetTitle> */}
          <SheetDescription className="text-black">
            <div className="mb-2 flex justify-between">
              <Button size="sm" variant="outline" onClick={toPreviousStage}>
                <ArrowLeft className="mr-1" />
                Previous
              </Button>
              <H5>{challenge.title}</H5>
              <Button size="sm" variant="outline" onClick={toNextStage}>
                Next
                <ArrowRight className="ml-1" />
              </Button>
            </div>
            <Large></Large>
            <P>{stage?.objective}</P>
            <Separator />
            <P>The current problem is: {challenge.description}</P>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
