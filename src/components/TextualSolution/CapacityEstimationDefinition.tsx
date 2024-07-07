import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, NotebookPen } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

const capacityEstimationDefinitionSchema = z.object({
  functionalRequirements: z.string(),
  nonFunctionalRequirements: z.string(),
});

export const CapacityEstimationDefinition = () => {
  const form = useForm<z.infer<typeof capacityEstimationDefinitionSchema>>({
    resolver: zodResolver(capacityEstimationDefinitionSchema),
    defaultValues: {
      functionalRequirements: "",
      nonFunctionalRequirements: "",
    },
  });

  function onSubmit(
    values: z.infer<typeof capacityEstimationDefinitionSchema>,
  ) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button variant="outline" size="xs" className="mt-1 w-full">
          <NotebookPen size={15} className="mr-1" />
          Capacity Estimations
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[50vw] max-w-4xl">
        <DialogHeader>
          <DialogTitle>System API definition</DialogTitle>
          <DialogDescription>
            <Separator className="mb-4 mt-2" />
            <div className="flex items-center">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-8"
                >
                  <Tabs defaultValue="functional" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="functional">
                        Functional requirements
                      </TabsTrigger>
                      <TabsTrigger value="nonfunctional">
                        Non-functional requirements
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="functional">
                      <FormField
                        control={form.control}
                        name="functionalRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                rows={10}
                                placeholder="Functional behaviour of the system"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              <WithMarkdownDetails
                                Icon={InfoIcon}
                                trigger={
                                  <Button
                                    variant="link"
                                    className="pl-0 pt-0 opacity-50 transition-all hover:opacity-100"
                                  >
                                    <InfoIcon className="mr-1" size={16} />
                                    What the system should do
                                  </Button>
                                }
                                content={functionalRequirements}
                              />
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="nonfunctional">
                      <FormField
                        control={form.control}
                        name="nonFunctionalRequirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                rows={10}
                                placeholder="Non-functional behaviour of the system"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              <WithMarkdownDetails
                                Icon={InfoIcon}
                                trigger={
                                  <Button
                                    variant="link"
                                    className="pl-0 pt-0 opacity-50 transition-all hover:opacity-100"
                                  >
                                    <InfoIcon className="mr-1" size={16} />
                                    How the system should perform the functional
                                    requirements
                                  </Button>
                                }
                                content={nonFunctionalRequirements}
                              />
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const functionalRequirements = `## Functional Requirements

Functional requirements specify what the system should do. They define the expected behavior and functionalities of the system, including specific actions, tasks, and operations the system must perform to meet user needs. These requirements outline the capabilities the system must have to satisfy its intended purpose and are essential for ensuring that the system works correctly and meets user expectations.

Examples of functional requirements include:

- **Authentication**: The system must allow users to log in and log out.
- **Data Processing**: The system must process input data and generate the appropriate output.
- **User Interface**: The system must provide an interface for users to interact with.
- **Reporting**: The system must generate reports based on user activity.

Functional requirements are critical as they provide a clear understanding of what is expected from the system, guiding the design, development, and testing processes.`;

const nonFunctionalRequirements = `
## Non-Functional Requirements

Non-functional requirements specify how the system performs its functions. They define the quality attributes, system constraints, and other criteria that judge the operation of a system rather than specific behaviors. These requirements ensure the usability, efficiency, reliability, and scalability of the system.

Examples of non-functional requirements include:

- **Performance**: The system must handle a specific number of transactions per second.
- **Scalability**: The system must scale to support an increasing number of users.
- **Availability**: The system must be available 99.9% of the time.
- **Security**: The system must protect user data through encryption and authentication.
- **Usability**: The system must be easy to use and provide a good user experience.
- **Maintainability**: The system must be easy to maintain and update.
- **Compliance**: The system must comply with industry regulations and standards.

Non-functional requirements are essential for ensuring that the system performs well under various conditions and meets user expectations for quality and performance.
`;
