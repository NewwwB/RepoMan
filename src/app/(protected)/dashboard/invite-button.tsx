"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import useProject from "~/hooks/use-project";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);
  const inviteLink = origin && projectId ? `${origin}/join/${projectId}` : "";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link
          </p>
          <Input
            className="mt-4"
            readOnly
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              toast.success("copied to clipboard");
            }}
            value={inviteLink}
          ></Input>
        </DialogContent>
      </Dialog>
      <Button size="sm" onClick={() => setOpen(true)}>
        Invite Member
      </Button>
    </>
  );
};

export default InviteButton;
