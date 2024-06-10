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
    <Accordion className="w-[20rem]" type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>{level?.title}</AccordionTrigger>
        <AccordionContent>
          <P>{level?.description}</P>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
