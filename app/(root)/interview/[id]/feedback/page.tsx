import { redirect } from "next/navigation";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { FeedbackClient } from "@/components/interview/FeedbackClient";

const FeedbackPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) return redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  if (!feedback) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Feedback Not Ready</h2>
            <p className="text-gray-400">Please complete the interview first.</p>
        </div>
     )
  }

  return (
    <FeedbackClient 
        feedback={feedback} 
        interview={interview} 
        interviewId={id} 
    />
  );
};

export default FeedbackPage;
