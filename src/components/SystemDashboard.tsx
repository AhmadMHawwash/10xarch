import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { H4, P } from "./ui/typography";

export const Dashboard = () => {
  const { level } = useLevelManager();

  return (
    <Accordion className="w-[20rem]" type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Challenge details</AccordionTrigger>
        <AccordionContent>
          <H4>{level?.title}</H4>
          <P>{level?.description}</P>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
