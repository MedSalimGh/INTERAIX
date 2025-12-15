import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { InterviewCardClient } from "./InterviewCardClient";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  coverImage,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  return (
    <InterviewCardClient
      interviewId={interviewId}
      userId={userId}
      role={role}
      type={type}
      techstack={techstack}
      createdAt={createdAt}
      coverImage={coverImage}
      feedback={feedback}
    />
  );
};

export default InterviewCard;