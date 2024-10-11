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
import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export const components1: Components = {
  h1: ({ node: _, ...props }) => <H1 className="text-gray-100" {...props} />,
  h2: ({ node: _, ...props }) => <H2 className="text-gray-100" {...props} />,
  h3: ({ node: _, ...props }) => <H3 className="text-gray-100" {...props} />,
  h4: ({ node: _, ...props }) => <H4 className="text-gray-100" {...props} />,
  h5: ({ node: _, ...props }) => <H5 className="text-gray-100" {...props} />,
  h6: ({ node: _, ...props }) => <H6 className="text-gray-100" {...props} />,
  p: ({ node: _, ...props }) => <P className="text-gray-300" {...props} />,
  ul: ({ node: _, ...props }) => <List className="text-gray-300" {...props} />,
  li: ({ node: _, ...props }) => (
    <li className="list-item text-gray-300">{props.children}</li>
  ),
  blockquote: ({ node: _, ...props }) => <Quote className="text-gray-300" {...props} />,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
  className?: string;
  trigger?: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className={className}>{trigger}</span>
      </DialogTrigger>
      <DialogContent className="min-h-95 w-[70vw] max-w-5xl bg-gray-800 border-gray-700">
        <DialogHeader className="relative">
          <span className="absolute -left-[104px] -top-0 rounded-md bg-gray-700 p-4">
            <Icon className="text-gray-300" />
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
