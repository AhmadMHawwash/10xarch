"use client";
import Link from "next/link";

import { signup } from "@/app/signup/actions";
import {
  signUpFormSchema,
  type SignUpFormState,
  type SignUpFormValues,
} from "@/app/signup/formSchema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";

export const description =
  "A sign up form with first name, last name, email and password inside a card. There's an option to sign up with GitHub and a link to login if you already have an account";

export function SignUp() {
  const [state, formAction] = useFormState<SignUpFormState, FormData>(signup, {
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<SignUpFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(signUpFormSchema),
    mode: "onChange",
  });

  return (
    <Form {...form}>
      {state?.message && <div>{state.message}</div>}
      <form
        action={formAction}
        ref={formRef}
        onSubmit={(evt) => {
          evt.preventDefault();
          void form.handleSubmit(async () => {
            formAction(new FormData(formRef.current!));
          })(evt);
        }}
      >
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <Input
                        id="firstName"
                        placeholder="Max"
                        required
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <Input
                        id="lastName"
                        placeholder="Robinson"
                        required
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <Input id="password" type="password" required {...field} />
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Create an account
              </Button>
              {/* <Button variant="outline" className="w-full">
            Sign up with GitHub
          </Button> */}
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/signin" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
