export default function WaitlistForm() {
  return null;
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const joinWaitlist = api.waitlist.joinWaitlist.useMutation();

  // const form = useForm<z.infer<typeof formSchema>>({
  //   resolver: zodResolver(formSchema),
  //   defaultValues: {
  //     email: "",
  //   },
  // });

  // async function onSubmit(values: z.infer<typeof formSchema>) {
  //   setIsSubmitting(true);
  //   try {
  //     await joinWaitlist.mutateAsync(values);
  //     toast({
  //       title: "Success!",
  //       description: "You've been added to the waitlist.",
  //     });
  //     form.reset();
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to join the waitlist. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  // return (
  //   <Form {...form}>
  //     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
  //       <FormField
  //         control={form.control}
  //         name="email"
  //         render={({ field }) => (
  //           <FormItem className="flex justify-center items-center gap-6">
  //             <FormLabel className="mt-2">Email</FormLabel>
  //             <FormControl>
  //               <Input placeholder="your@email.com" {...field} />
  //             </FormControl>
  //             <FormMessage />
  //           </FormItem>
  //         )}
  //       />
  //       <Button className="w-full" type="submit" disabled={isSubmitting}>
  //         {isSubmitting ? "Submitting..." : "Join Waitlist"}
  //       </Button>
  //     </form>
  //   </Form>
  // );
}
