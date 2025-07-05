"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import AskQuestionCard from "../dashboard/ask-question-card";
import Image from "next/image"; // Changed to Image from next/image for better optimization
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QAndA = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <>
      <div className="mx-8">
        <Sheet>
          <AskQuestionCard />
          <div className="h-4"></div>
          <h1 className="text-xl font-semibold">Saved Questions</h1>
          <div className="h-2"></div>
          <div className="flex flex-col gap-6">
            {questions?.map((question, idx) => (
              <React.Fragment key={question.id}>
                <SheetTrigger onClick={() => setQuestionIndex(idx)}>
                  <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                    <img
                      className="rounded-full"
                      height={30}
                      width={30}
                      alt="avatar"
                      src={question.user.imageUrl ?? "/default-avatar.png"}
                    />
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <p className="line-clamp-1 text-lg font-medium text-gray-700">
                          {question.question}
                        </p>
                        <span className="text-xs whitespace-nowrap text-gray-400">
                          {question.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="line-clamp-1 text-sm text-gray-500">
                        {question.answer}
                      </p>
                    </div>
                  </div>
                </SheetTrigger>
              </React.Fragment>
            ))}
          </div>
          {question && (
            <SheetContent
              className="flex flex-col p-2 sm:max-w-[80vw]" // Use flex-col for vertical stacking
              data-color-mode="light"
            >
              <SheetHeader className="pb-4">
                {" "}
                {/* Added padding to header */}
                <SheetTitle>{question.question}</SheetTitle>
              </SheetHeader>

              {/* LLM Content Section with its own scroll */}
              <div className="custom-scrollbar flex-1/3 overflow-y-auto pr-4">
                {" "}
                {/* Added custom-scrollbar class */}
                <MDEditor.Markdown source={question.answer} />
              </div>

              {/* Separator */}
              <div className="my-2 border-t border-gray-200" />

              {/* Code References Section with its own scroll */}
              <div className="custom-scrollbar flex-2/3 overflow-y-auto pr-4">
                {" "}
                {/* Added custom-scrollbar class */}
                <CodeReferences
                  filesReferences={(question.filesReferences ?? []) as any}
                />
              </div>
            </SheetContent>
          )}
        </Sheet>
      </div>
    </>
  );
};

export default QAndA;
