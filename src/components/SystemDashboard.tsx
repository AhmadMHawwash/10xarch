import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { P } from "./ui/typography";

export const Dashboard = () => {
  const { level } = useLevelManager();

  return (
    <Accordion className="w-[20rem] bg-slate-200 px-4" type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:no-underline">{level?.title}</AccordionTrigger>
        <AccordionContent>
          <P>{level?.description}</P>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};