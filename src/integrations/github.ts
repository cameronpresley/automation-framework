import { getEnvValueOrThrow } from "../utils.ts";

export type OrgMember = {
  name: string;
};

type GitHubMembersOfOrgResponse = {
  login: string;
};

export async function getMembersOfOrganization(
  orgName: string
): Promise<OrgMember[]> {
  const bearerToken = getEnvValueOrThrow("GITHUB_PAT");
  const url = `https://api.github.com/orgs/${orgName}/members`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${bearerToken}`,
    "X-GitHub-Api-Version": "2022-11-28",
  } as HeadersInit;

  const resp = await fetch(url, {
    headers: headers,
    method: "get",
  });

  const data = (await resp.json()) as GitHubMembersOfOrgResponse[];

  return data.map(
    (x) =>
      ({
        name: x.login,
      } as OrgMember)
  );
}

export async function cloneRepository(
  repoUrl: string,
  location: string
): Promise<void> {
  const command = new Deno.Command("git", {
    args: [`clone`, `${repoUrl}`, `${location}`],
  });
  await command.output();
}
