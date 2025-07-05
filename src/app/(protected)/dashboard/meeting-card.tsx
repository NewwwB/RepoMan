"use client";

import React, { useEffect, useState } from "react";
import { Card } from "~/components/ui/card";
import { useDropzone } from "react-dropzone";
import { firebaseAuth, uploadFile } from "~/lib/firebase";
import { Presentation, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { api } from "~/trpc/react";
import { signInWithCustomToken } from "firebase/auth";
import useProject from "~/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const processMeeting = useMutation({
    mutationFn: async (data: { meetingUrl: string; meetingId: string }) => {
      const { meetingUrl, meetingId } = data;
      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        meetingId,
      });
      return response.data;
    },
  });

  const project = useProject();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const router = useRouter();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (!file) return;
      const downloadUrl = (await uploadFile(
        file as File,
        setProgress,
      )) as string;
      uploadMeeting.mutate(
        {
          projectId: project.projectId,
          meetingUrl: downloadUrl,
          name: file?.name,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully");
            router.push("/meetings");
            processMeeting.mutateAsync({
              meetingId: meeting.id,
              meetingUrl: downloadUrl,
            });
          },
          onError: () => {
            toast.error("Failed to upload");
          },
        },
      );
      console.log(downloadUrl);
      setIsUploading(false);
    },
  });
  const { data } = api.project.getFirebaseToken.useQuery();

  useEffect(() => {
    const signIn = async () => {
      if (data?.firebaseToken) {
        try {
          await signInWithCustomToken(firebaseAuth, data.firebaseToken);
          console.log("Signed into Firebase");
        } catch (err) {
          console.error("Firebase sign-in failed:", err);
        }
      }
    };

    signIn();
  }, [data]);
  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center p-10"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />

          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with RepoMan.
            <br />
            Powered by AI.
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="mr-1.5 ml-0.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div className="item-center flex flex-col justify-center">
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
            styles={buildStyles({
              pathColor: "oklch(.705 .213 47.604)",
              textColor: "oklch(.705 .213 47.604)",
            })}
          />
          <p className="text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
