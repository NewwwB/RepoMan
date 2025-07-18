"use client";

import React from "react";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import MeetingCard from "../dashboard/meeting-card";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import useRefetch from "~/hooks/use-refetch";

const MeetingsPage = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    {
      // refetchInterval: 5000,
    },
  );
  const refetch = useRefetch();
  const deleteMeeting = api.project.deleteMeeting.useMutation();

  return (
    <>
      <div className="mx-8">
        <MeetingCard />
        <div className="h-6"></div>
        <h1 className="text-sm font-semibold">Meetings</h1>
        {meetings && meetings.length === 0 && <div>No meetings found</div>}
        {isLoading && <div>Loading...</div>}
        <ul className="divide-y divide-gray-200">
          {meetings?.map((meeting) => {
            return (
              <li
                key={meeting.id}
                className="flex items-center justify-between gap-x-6 py-5"
              >
                <div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/meetings/${meeting.id}`}
                        className="text-sm font-semibold"
                      >
                        {meeting.name}
                      </Link>
                      {meeting.status === "PROCESSING" && (
                        <Badge className="bg-yellow-500 text-white">
                          Processing...
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-x-2 text-xs text-gray-500">
                    <p className="whitespace-nowrap">
                      {meeting.createdAt.toLocaleDateString()}
                    </p>
                    <p className="truncate">{meeting.issues.length} issues</p>
                  </div>
                </div>

                <div className="flex flex-none items-center gap-x-4">
                  <Link href={`/meetings/${meeting.id}`}>
                    <Button size="sm" variant="outline">
                      View Meeting
                    </Button>
                  </Link>
                  <Button
                    disabled={deleteMeeting.isPending}
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      deleteMeeting.mutate(
                        { meetingId: meeting.id },
                        {
                          onSuccess: () => {
                            toast.success("Meeting Deleted");
                            refetch();
                          },
                          onError: () => toast.error("Something went wrong"),
                        },
                      )
                    }
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default MeetingsPage;
