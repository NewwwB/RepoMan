import { api } from "~/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects, error } = api.project.getProjects.useQuery();
  if (error) {
    console.error("Failed to fetch projects", error);
  }

  const [projectId, setProjectId] = useLocalStorage("RepoMan_project_id", "");

  const project = projects?.find((p) => p.id === projectId);

  return {
    project,
    projects,
    projectId,
    setProjectId,
  };
};

export default useProject;
