import React from "react";
import IssuesList from "./issues-list";

type Props = {
  params: Promise<{ meetingId: string }>;
};

const MeetingDetails = async ({ params }: Props) => {
  const { meetingId } = await params;
  return (
    <div className="mx-8">
      <IssuesList meetingId={meetingId} />
    </div>
  );
};

export default MeetingDetails;
