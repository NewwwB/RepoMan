"use client";
import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import useProject from "~/hooks/use-project";
import { askQuestion } from "./action";
import { readStreamableValue } from "ai/rsc";
import CodeReferences from "./code-references";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import useRefetch from "~/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesRefrences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");

  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAnswer("");
    setFilesRefrences([]);
    if (!project?.id) return;
    setLoading(true);

    const { output, fileReferences } = await askQuestion(question, project.id);
    setFilesRefrences(fileReferences);

    setOpen(true);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }
    setLoading(false);
  };

  const refetch = useRefetch();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[calc(100vh-2rem)] max-w-full min-w-[95vw] flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <span>Repo AI</span>
              </DialogTitle>
              <Button
                variant="outline"
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer saved!");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to save answer!");
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
            <div
              className="flex-1 overflow-auto rounded-md p-4"
              data-color-mode="light"
            >
              <MDEditor.Markdown
                source={answer}
                className="max-h-full w-auto"
              />
            </div>
            <div className="flex-1 overflow-hidden rounded-md p-4">
              <CodeReferences filesReferences={filesReferences} />
            </div>
          </div>
          <div className="mt-4">
            <Button type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4"></div>
            <Button type="submit" disabled={loading}>
              Ask RepoMan
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
