import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Prism as SynxtaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

type Props = {
  filesReferences: {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
};

const CodeReferences = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);

  if (filesReferences.length === 0) return null;

  return (
    <div className="flex h-full w-full flex-col">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-col"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {filesReferences.map((file, idx) => (
            <TabsTrigger
              key={`${file.fileName}-${idx}`}
              value={file.fileName}
              className={cn(
                // "transistion-colors text-muted-foreground rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap",
                // "text-muted-foreground",
                {
                  // "bg-primary text-primary-foreground": file.fileName === tab,
                },
                // 'bg-[data-state="active"]-primary text-[data-state="active"]-primary-foreground',
              )}
              // onClick={() => setTab(file.fileName)}
            >
              {file.fileName}
            </TabsTrigger>
          ))}
        </TabsList>

        {filesReferences.map((file, index) => (
          <TabsContent
            key={`${file.fileName}-${index}`}
            value={file.fileName}
            className="mt-2 flex-1 overflow-auto rounded-md"
          >
            <SynxtaxHighlighter
              language="typescript"
              style={lucario}
              customStyle={{
                margin: 0,
                width: "100%",
                height: "100%",
              }}
              wrapLongLines={false}
              showLineNumbers
            >
              {file.sourceCode}
            </SynxtaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
