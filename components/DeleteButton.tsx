"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteInterview } from "@/lib/actions/general.action";

interface DeleteButtonProps {
  interviewId: string;
  userId: string;
}

const DeleteButton = ({ interviewId, userId }: DeleteButtonProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this interview? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteInterview({ interviewId, userId });

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to delete interview");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="absolute top-2 left-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition-colors disabled:opacity-50"
      title="Delete interview"
    >
      <Image
        src="/trash.svg"
        alt="Delete"
        width={20}
        height={20}
        className="invert"
      />
    </button>
  );
};

export default DeleteButton;
