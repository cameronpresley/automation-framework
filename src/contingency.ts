import {
  getFileContent,
  getMarkdownFilesFromDirectory,
} from "./integrations/fileSystem.ts";
import { cloneRepository } from "./integrations/github.ts";
import { DateTime } from "npm:luxon";
import { MessageBuilder, sendMessage } from "./integrations/slack.ts";
import { getEnvValueOrThrow } from "./utils.ts";

type StaleFile = {
  path: string;
  reason: "missing" | "invalid date" | "stale";
};

async function getStaleDocs(directory: string): Promise<StaleFile[]> {
  const results: StaleFile[] = [];
  for await (const file of await getMarkdownFilesFromDirectory(directory)) {
    const lines = (await getFileContent(file)).split("\n");

    const lastReviewedLine = lines.findLast((x) =>
      x.startsWith("Last Reviewed On: ")
    );
    if (!lastReviewedLine) {
      results.push({ path: file, reason: "missing" });
      continue;
    }
    const dateString = lastReviewedLine
      .replace("Last Reviewed On: ", "")
      .trim();
    const parsedDate = DateTime.fromFormat(dateString, "MM/dd/yyyy");
    if (!parsedDate.isValid) {
      results.push({ path: file, reason: "invalid date" });
      continue;
    }
    const now = DateTime.now();
    if (now > parsedDate.plus({ months: 3 })) {
      results.push({ path: file, reason: "stale" });
      continue;
    }
  }
  return results;
}

function formatReason(reason: "missing" | "invalid date" | "stale"): string {
  switch (reason) {
    case "missing":
      return "it's missing a date";
    case "invalid date":
      return "it's an invalid date";
    case "stale":
      return "it hasn't been reviewed recently";
  }
}

const tempDirectory = "/tmp/repoToScan";
await cloneRepository(getEnvValueOrThrow("GIT_REPO_URL"), tempDirectory);
const files = await getStaleDocs(tempDirectory);

const title = "Contingency Plans To Review";
if (!files.length) {
  await sendMessage(new MessageBuilder(title).addLine("_No plans to report!_"));
} else {
  const builder = files.reduce((b: MessageBuilder, file: StaleFile) => {
    return b.addLine(
      `• ${file.path.replace(
        tempDirectory,
        ""
      )} needs to be reviewed because ${formatReason(file.reason)}`
    );
  }, new MessageBuilder(title));
  await sendMessage(builder);
}
