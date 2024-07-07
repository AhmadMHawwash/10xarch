import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { H3, Large, P } from "./ui/typography";

export const Dashboard = () => {
  const { level, toNextLevel, toPreviousLevel } = useLevelManager();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Accordion
      className="z-50 w-[24rem] bg-slate-50 px-4"
      type="single"
      collapsible
      onValueChange={(v) => setIsOpen(v === "item-1")}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:no-underline">
          <div className={"flex w-full flex-col items-start"}>
            <H3
              className={cn(
                "pt-0 text-xl transition-all",
                isOpen ? "opacity-0" : "opacity-100",
              )}
            >
              Problem statement
            </H3>
          </div>
        </AccordionTrigger>
        <AccordionContent className="rounded-sm bg-slate-100 p-2 pt-0">
          <div className="mb-2 flex justify-between">
            <Button size="xs" variant="default" onClick={toPreviousLevel}>
              <ArrowLeft className="mr-1" />
              Previous
            </Button>
            <Button size="xs" variant="default" onClick={toNextLevel}>
              Next
              <ArrowRight className="ml-1" />
            </Button>
          </div>
          <Large>{level?.title}</Large>
          <P>{level?.description}</P>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
