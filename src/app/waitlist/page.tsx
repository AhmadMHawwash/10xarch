import { Separator } from "@/components/ui/separator";
import { H2, Muted } from "@/components/ui/typography";
import WaitlistForm from "@/components/Waitlist";

export default function Home() {
  return (
    <div className="mx-auto mt-24 w-96">
      <H2 className="border-b-0">Join waitlist</H2>
      <Muted className="mb-8">
        Thanks for your interest in System Design Playground. We are still rolling the red carpet for our early users. Sign up to get early access.
      </Muted>
      <Separator className="mb-8 mt-2" />
      <WaitlistForm />
    </div>
  );
}
