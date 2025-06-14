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
import { type LucideIcon } from "lucide-react";
import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export const components1: Components = {
  h1: ({ node: _, ...props }) => <H1 className="dark:text-gray-100 text-gray-800" {...props} />,
  h2: ({ node: _, ...props }) => <H2 className="dark:text-gray-100 text-gray-800" {...props} />,
  h3: ({ node: _, ...props }) => <H3 className="dark:text-gray-100 text-gray-800" {...props} />,
  h4: ({ node: _, ...props }) => <H4 className="dark:text-gray-100 text-gray-800" {...props} />,
  h5: ({ node: _, ...props }) => <H5 className="dark:text-gray-100 text-gray-800" {...props} />,
  h6: ({ node: _, ...props }) => <H6 className="dark:text-gray-100 text-gray-800" {...props} />,
  p: ({ node: _, ...props }) => <P className="dark:text-gray-300 text-gray-700" {...props} />,
  ul: ({ node: _, ...props }) => <List className="dark:text-gray-300 text-gray-700" {...props} />,
  li: ({ node: _, ...props }) => (
    <li className="list-item dark:text-gray-300 text-gray-700">{props.children}</li>
  ),
  blockquote: ({ node: _, ...props }) => <Quote className="dark:text-gray-300 text-gray-700" {...props} />,
  a: ({ node: _, ...props }) => (
    <a {...props} className="link text-blue-400 hover:text-blue-300">
      {props.children}
    </a>
  ),
  code: ({ node: _, ...props }) => <InlineCode className="bg-gray-700 text-gray-200" {...props} />,
};

export const WithMarkdownDetails = ({
  content,
  Icon,
  className,
  trigger,
}: {
  content?: string;
  Icon: LucideIcon;
  className?: string;
  trigger?: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className={className}>{trigger}</span>
      </DialogTrigger>
      <DialogContent className="min-h-95 w-[70vw] max-w-5xl dark:bg-gray-800 dark:border-gray-700 bg-gray-200 border">
        <DialogHeader className="relative">
          <span className="absolute -left-[104px] -top-0 rounded-md dark:bg-gray-700 bg-gray-200 p-4">
            <Icon className="text-gray-300 dark:text-gray-600 stroke-gray-600 dark:stroke-gray-100" />
          </span>
          <div className="h-[90vh] overflow-scroll px-8 text-gray-200">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]} // Enable raw HTML parsing
              components={components1}
            >
              {content}
            </ReactMarkdown>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
