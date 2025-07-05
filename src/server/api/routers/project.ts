import { pollCommits } from "~/lib/github";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { checkCredits, indexGithubRepo } from "~/lib/github-loader";
import { firebaseAuth } from "~/lib/firebase-backend";
import { processingMeeting } from "~/lib/assembly";

export const projectRouter = createTRPCRouter({
  createProject: privateProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
        fileCount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true,
        },
      });
      if (!user) throw new Error("User not found");

      const currentCredits = user.credits || 0;

      if (currentCredits < input.fileCount) {
        throw new Error("Insufficient credits");
      }

      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          user: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);
      await ctx.db.user.update({
        where: {
          id: ctx.user.userId!,
        },
        data: {
          credits: {
            decrement: input.fileCount,
          },
        },
      });
      return project;
    }),
  getProjects: privateProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        user: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),
  getCommits: privateProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await pollCommits(input.projectId).then().catch(console.error);
      return ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),
  saveAnswer: privateProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        filesReferences: z.any(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!,
        },
      });
    }),

  getQuestions: privateProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  getFirebaseToken: privateProcedure.query(async ({ ctx }) => {
    const clerkUserId = ctx.user.userId;
    if (!clerkUserId) throw new Error("Unauthorized");

    const firebaseToken = await firebaseAuth.createCustomToken(clerkUserId);
    console.log(firebaseToken);
    return { firebaseToken };
  }),
  uploadMeeting: privateProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          meetingUrl: input.meetingUrl,
          projectId: input.projectId,
          name: input.name,
          status: "PROCESSING",
        },
      });
      return meeting;
    }),
  getMeetings: privateProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.meeting.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          issues: true,
        },
      });
    }),
  deleteMeeting: privateProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
    }),
  getMeetingById: privateProcedure
    .input(z.object({ meetingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.meeting.findUnique({
        where: {
          id: input.meetingId,
        },
        include: {
          issues: true,
        },
      });
    }),

  archiveProject: privateProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }),

  getTeamMembers: privateProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
      });
    }),
  getMyCredits: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: {
        id: ctx.user.userId!,
      },
      select: {
        credits: true,
      },
    });
  }),
  checkCredits: privateProcedure
    .input(
      z.object({ githubUrl: z.string(), githubToken: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const fileCount = await checkCredits(input.githubUrl, input.githubToken);
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.user.userId!,
        },
        select: {
          credits: true,
        },
      });
      return { fileCount, userCredits: user?.credits || 0 };
    }),
});
