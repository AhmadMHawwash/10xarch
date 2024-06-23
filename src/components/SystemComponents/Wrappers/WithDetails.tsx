"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  InlineCode,
  List,
  P,
  Quote,
} from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import React from "react";
import { getSystemComponent } from "@/components/Gallery";
import { type SystemComponentType } from "@/lib/levels/type";

const components1: Components = {
  h1: ({ node: _, ...props }) => <H1 {...props} />,
  h2: ({ node: _, ...props }) => <H2 {...props} />,
  h3: ({ node: _, ...props }) => <H3 {...props} />,
  h4: ({ node: _, ...props }) => <H4 {...props} />,
  h5: ({ node: _, ...props }) => <H5 {...props} />,
  h6: ({ node: _, ...props }) => <H6 {...props} />,
  p: ({ node: _, ...props }) => <P {...props} />,
  ul: ({ node: _, ...props }) => <List {...props} />,
  li: ({ node: _, ...props }) => (
    <li className="list-item">{props.children}</li>
  ),
  blockquote: ({ node: _, ...props }) => <Quote {...props} />,
  a: ({ node: _, ...props }) => (
    <a {...props} className="link">
      {props.children}
    </a>
  ),
  code: ({ node: _, ...props }) => <InlineCode {...props} />,
};

export const WithDetails = ({
  name,
  className,
}: {
  name: SystemComponentType;
  className: string;
  children?: React.ReactNode;
}) => {

  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { icon: ComponentIcon, content } = getSystemComponent(name);
  return (
    <Dialog>
      <DialogTrigger>
        <span
          className={cn(
            "absolute left-0 top-[-17px] rounded-full bg-gray-100",
            className,
          )}
        >
          <InfoIcon size={16} className="stroke-gray-500" />
        </span>
      </DialogTrigger>
      <DialogContent className="min-h-90 w-[90vw] max-w-4xl">
        <DialogHeader className="relative">
          <span className="absolute -left-[104px] -top-0 rounded-md bg-white p-4">
            <ComponentIcon />
          </span>
          <div className="h-[80vh] overflow-scroll">
            <div className="markdown-container">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]} // Enable raw HTML parsing
                components={components1}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
