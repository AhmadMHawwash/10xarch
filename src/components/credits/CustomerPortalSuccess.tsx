"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function CustomerPortalSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get('portal') === 'completed') {
      toast({
        title: "Subscription Updated!",
        description: "Your subscription changes have been processed successfully. Any updates will be reflected in your account shortly.",
        duration: 8000,
      });
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('portal');
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router, toast]);

  return null;
} 