"use client";

import { Info } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

type FormInput = {
  projectName: string;
  repoUrl: string;
  githubToken?: string;
};

const createPage = () => {
  const refetch = useRefetch();
  const checkCredits = api.project.checkCredits.useMutation();
  const createProject = api.project.createProject.useMutation();

  const onSubmit = (data: FormInput) => {
    if (!!checkCredits.data) {
      createProject.mutate(
        {
          name: data.projectName,
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
          fileCount: checkCredits.data.fileCount,
        },
        {
          onSuccess: () => {
            toast.success("Project created successfully");
            refetch();
            reset();
          },
          onError: () => {
            toast.error("Something went wrong");
          },
        },
      );
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      });
    }
  };

  const haveEnoughtCredits = checkCredits?.data?.userCredits
    ? checkCredits.data.fileCount <= checkCredits.data.userCredits
    : true;

  const { register, handleSubmit, reset } = useForm<FormInput>();
  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image
        src="/coder.png"
        height="180"
        width="180"
        // layout="responsive"
        alt="coder"
      />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">Link Your Repository</h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of your repository to link it to RepoMan.
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              placeholder="Enter Project Name"
              {...register("projectName", {
                required: "Project name is required",
              })}
            />
            <div className="h-2"></div>
            <Input
              placeholder="Github URL"
              {...register("repoUrl", {
                required: "Github URL is required",
              })}
            />
            <div className="h-2"></div>
            <Input
              placeholder="Github Token (Optional)"
              {...register("githubToken")}
            />
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className="size-4" color="black" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits.data?.fileCount}</strong> credits
                      for this repository
                    </p>
                  </div>
                  <p className="text-sm text-blue-600">
                    You have <strong>{checkCredits.data?.userCredits}</strong>{" "}
                    credits remaining.
                  </p>
                </div>
              </>
            )}
            <div className="h-4"></div>
            <Button
              disabled={
                createProject.isPending ||
                checkCredits.isPending ||
                !haveEnoughtCredits
              }
              type="submit"
            >
              {!!checkCredits.data ? "create project" : "check credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default createPage;
