import { getMembersOfOrganization } from "./integrations/github.ts";
import { MessageBuilder, sendMessage } from "./integrations/slack.ts";
import { createShuffledPairs, getEnvValueOrThrow } from "./utils.ts";

const result = await getMembersOfOrganization(
  getEnvValueOrThrow("GITHUB_ORG_NAME")
);
const shuffledPairs = createShuffledPairs(result);

const builder = shuffledPairs.reduce((prev: MessageBuilder, curr) => {
  const message = `• _${curr.a.name}_ is meeting with _${curr.b.name}_${
    curr.c ? ` and _${curr.c}_` : ""
  }`;
  return prev.addLine(message);
}, new MessageBuilder("Coffee Chat"));

await sendMessage(builder.addLine("@channel"));
