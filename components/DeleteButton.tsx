"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { deleteInterview } from "@/lib/actions/general.action";
import router from "next/router";

interface DeleteButtonProps {
  interviewId: string;
  userId: string;
  onDelete?: () => void;
}

const DeleteButton = ({ interviewId, userId, onDelete }: DeleteButtonProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  // Optimistic UI could be handled by a parent, but here we'll rely on fast refresh
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteInterview({ interviewId, userId });

      if (result.success) {
        toast.success("Interview deleted successfully");
        if (onDelete) onDelete();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete interview");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
      setIsDeleting(false);
    } finally {
        setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="group/delete text-gray-400 hover:text-red-500 transition-all duration-300 disabled:opacity-50 p-2 rounded-full hover:bg-red-500/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] border border-transparent hover:border-red-500/50"
        title="Delete interview"
      >
        <Image
          src="/trash.svg"
          alt="Delete"
          width={18}
          height={18}
          className="opacity-60 group-hover/delete:opacity-100 transition-all duration-300 invert group-hover/delete:drop-shadow-[0_0_15px_rgba(239,68,68,1)]" 
        />
      </button>

      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Interview"
        description="Are you sure you want to delete this interview? This action cannot be undone and all feedback will be lost."
        isLoading={isDeleting}
      />
    </>
  );
};

export default DeleteButton;
