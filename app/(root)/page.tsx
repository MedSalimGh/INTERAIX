import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getAllInterviews,
  getAppUserFeedback,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="flex flex-col gap-6 max-w-lg mx-auto mt-20 text-center">
        <h2>Please Sign In to View Your Dashboard</h2>
        <Button asChild className="btn-primary w-full">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </section>
    );
  }

  const [allInterviews, userFeedback] = await Promise.all([
    getAllInterviews(),
    getAppUserFeedback(user.id),
  ]);

  // Create a Set of interview IDs that the user has feedback for
  const takenInterviewIds = new Set(userFeedback.map((f) => f.interviewId));

  // Filter interviews
  const userInterviews = allInterviews.filter((interview) =>
    takenInterviewIds.has(interview.id)
  );
  
  const availableInterviews = allInterviews.filter(
    (interview) => !takenInterviewIds.has(interview.id)
  );

  const hasPastInterviews = userInterviews.length > 0;
  const hasUpcomingInterviews = availableInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            availableInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
