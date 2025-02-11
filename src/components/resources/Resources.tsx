import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ResourcesProps {
  documentation: Array<{
    title: string;
    url: string;
    description: string;
  }>;
  realWorldCases: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  bestPractices: Array<{
    title: string;
    description: string;
    example?: string;
  }>;
}

export function Resources({ documentation, realWorldCases, bestPractices }: ResourcesProps) {
  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Resources</CardTitle>
        <CardDescription>Documentation, real-world examples, and best practices</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documentation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documentation" className="text-[11px] sm:text-sm">Docs</TabsTrigger>
            <TabsTrigger value="realworld" className="text-[11px] sm:text-sm">Examples</TabsTrigger>
            <TabsTrigger value="practices" className="text-[11px] sm:text-sm">Practices</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-fit w-full pr-4">
            <TabsContent value="documentation" className="mt-4 space-y-4">
              {documentation.map((doc, index) => (
                <Card key={index} className="border-none shadow-none">
                  <CardHeader className="p-0">
                    <Link 
                      href={doc.url} 
                      target="_blank" 
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {doc.title}
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="realworld" className="mt-4 space-y-4">
              {realWorldCases.map((example, index) => (
                <Card key={index} className="border-none shadow-none">
                  <CardHeader className="p-0">
                    <Link 
                      href={example.url} 
                      target="_blank" 
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {example.name}
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="practices" className="mt-4 space-y-4">
              {bestPractices.map((practice, index) => (
                <Card key={index} className="border-none shadow-none">
                  <CardHeader className="p-0">
                    <CardTitle className="text-sm font-medium">{practice.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <p className="text-sm text-muted-foreground">{practice.description}</p>
                    {practice.example && (
                      <pre className="mt-2 rounded-md bg-muted p-2 text-xs">
                        <code>{practice.example}</code>
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
