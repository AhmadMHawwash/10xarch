import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { H5, Large, P } from "./ui/typography";

export const Dashboard = () => {
  const { toNextStage, toPreviousStage, challenge } = useChallengeManager();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="z-[500] m-2 border-gray-600 text-gray-200 hover:bg-gray-700">
          <BookOpenText className="mr-2" size="17" /> Challenge statement
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] bg-gray-900 text-gray-200">
        <SheetHeader>
          <SheetDescription className="text-gray-300">
            <div className="mb-2 flex justify-between">
              <Button size="sm" variant="outline" onClick={toPreviousStage} className="border-gray-600 text-gray-200 hover:bg-gray-700">
                <ArrowLeft className="mr-1" />
                Previous
              </Button>
              <H5 className="text-gray-100">{challenge.title}</H5>
              <Button size="sm" variant="outline" onClick={toNextStage} className="border-gray-600 text-gray-200 hover:bg-gray-700">
                Next
                <ArrowRight className="ml-1" />
              </Button>
            </div>
            <Large></Large>
            {/* <P className="text-gray-300">{stage?.objective}</P> */}
            <Separator className="bg-gray-700" />
            <P className="text-gray-300">The current problem is: {challenge.description}</P>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
