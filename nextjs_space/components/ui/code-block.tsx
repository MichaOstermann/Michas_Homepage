
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ 
  code, 
  language = 'powershell', 
  showLineNumbers = false,
  className 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const customStyle = {
    ...tomorrow,
    'pre[class*="language-"]': {
      ...tomorrow['pre[class*="language-"]'],
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      lineHeight: '1.5',
    },
    'code[class*="language-"]': {
      ...tomorrow['code[class*="language-"]'],
      background: 'transparent',
      color: '#f8f8f2',
    },
    '.token.comment': {
      color: '#6272a4',
    },
    '.token.string': {
      color: '#06FFF0',
    },
    '.token.function': {
      color: '#FF006E',
    },
    '.token.keyword': {
      color: '#bd93f9',
    },
    '.token.number': {
      color: '#f1fa8c',
    },
    '.token.operator': {
      color: '#ff79c6',
    },
    '.token.variable': {
      color: '#50fa7b',
    },
  };

  return (
    <div className={cn('relative group', className)}>
      <div className="absolute top-3 right-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 glass-morphism hover:bg-accent/50"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      
{/* @ts-ignore */}
      <SyntaxHighlighter
        language={language}
        style={customStyle as any}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
