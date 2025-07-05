"use client";

import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "~/components/ui/button";
import useProject from "~/hooks/use-project";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

const dashboard = () => {
  const { project } = useProject();
  return (
    <div className="mx-8">
      <div className="item-center flex flex-wrap justify-between gap-y-4">
        {/* github link */}
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          <div className="item-center flex">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? ""}
                  className="item-center inline-flex text-white/80 hover:underline"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h4"></div>

        <div className="item-center flex gap-4">
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8"></div>
      <CommitLog />
    </div>
  );
};

export default dashboard;
