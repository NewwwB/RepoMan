"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import useProject from "~/hooks/use-project";
import useRefetch from "~/hooks/use-refetch";
import { api } from "~/trpc/react";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();

  return (
    <Button
      disabled={archiveProject.isPending}
      size="sm"
      variant="destructive"
      onClick={() => {
        const confirm = window.confirm(
          "are you sure you want to archive this project?",
        );
        if (confirm && projectId) {
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("project archived");
                refetch();
              },
              onError: () => toast.error("failed to archive project"),
            },
          );
        }
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
