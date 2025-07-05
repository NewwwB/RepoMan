import { Octokit } from "octokit";
import { db } from "~/server/db";
import axios from "axios";
import { AiSummarisedCommit } from "./gemini";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getDefaultBranch = async (githubUrl: string) => {
  const owner = githubUrl.split("/")[3];
  const repo = githubUrl.split("/")[4];
  if (!owner || !repo) return "main";
  const { data } = await octokit.rest.repos.get({
    owner,
    repo,
  });
  return data.default_branch; // e.g., "main", "master", "dev"
};

type Commit = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

async function getCommitHashes(githubUrl: string): Promise<Commit[]> {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) throw new Error("Invalid github url");
  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit) => {
    return {
      commitHash: commit.sha as string,
      commitMessage: commit.commit?.message ?? ("" as string),
      commitAuthorName: commit.commit?.author?.name ?? ("" as string),
      commitAuthorAvatar: commit.author?.avatar_url ?? ("" as string),
      commitDate: commit.commit?.author?.date ?? "",
    };
  });
}

export async function pollCommits(projectId: string) {
  const { project, githubUrl } = await fetchGithub(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summarisedCommit(githubUrl, commit.commitHash);
    }),
  );
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value;
    }
    return "";
  });
  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary: summary,
      };
    }),
  });

  return commits;
}

async function summarisedCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  return (await AiSummarisedCommit(data)) || "";
}

async function fetchGithub(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });
  if (!project?.githubUrl) {
    throw new Error("Project have no github URL");
  }
  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Commit[],
) {
  const processedCommit = await db.commit.findMany({
    where: {
      projectId,
    },
  });

  const unProcessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommit.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );
  return unProcessedCommits;
}
