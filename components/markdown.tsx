import Link from 'next/link';
import React, { memo, useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // @ts-expect-error
  code: CodeBlock,
  pre : ({ children }) => <>{children}</>,
  ol  : ({ node, children, ...props }) => (
    <ol
      className="ml-4 list-outside list-decimal"
      {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, ...props }) => (
    <li
      className="py-1"
      {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, ...props }) => (
    <ul
      className="ml-4 list-outside list-decimal"
      {...props}>
      {children}
    </ul>
  ),
  strong: ({ node, children, ...props }) => (
    <span
      className="font-semibold"
      {...props}>
      {children}
    </span>
  ),
  a: ({ node, children, ...props }) => (

    // @ts-expect-error
    <Link
      className="text-blue-500 hover:underline"
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </Link>
  ),
  h1: ({ node, children, ...props }) => (
    <h1
      className="mb-2 mt-6 text-3xl font-semibold"
      {...props}>
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2
      className="mb-2 mt-6 text-2xl font-semibold"
      {...props}>
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3
      className="mb-2 mt-6 text-xl font-semibold"
      {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, ...props }) => (
    <h4
      className="mb-2 mt-6 text-lg font-semibold"
      {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, ...props }) => (
    <h5
      className="mb-2 mt-6 text-base font-semibold"
      {...props}>
      {children}
    </h5>
  ),
  h6: ({ node, children, ...props }) => (
    <h6
      className="mb-2 mt-6 text-sm font-semibold"
      {...props}>
      {children}
    </h6>
  )
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => (
  <ReactMarkdown
    remarkPlugins={remarkPlugins}
    components={components}>
    {children}
  </ReactMarkdown>
);

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
