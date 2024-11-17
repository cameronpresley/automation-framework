import { getEnvValueOrThrow } from "../utils.ts";

export async function getMentionTokenForEmail(email: string): Promise<string> {
  const apiToken = getEnvValueOrThrow("SLACK_OAUTH_TOKEN");
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const response = await fetch("https://slack.com/api/users.lookupByEmail", {
    headers: headers,
    method: "post",
    body: new URLSearchParams({
      email: email,
      token: apiToken!,
    }),
  });
  const payload = await response.json();

  return payload.user.id;
}

export class MessageBuilder {
  private content: string[] = [];
  constructor(private title: string) {}

  addLine(line: string): MessageBuilder {
    this.content.push(line);
    return this;
  }
  addMention(placeholder: string, token: string): MessageBuilder {
    this.content = this.content.map((x) =>
      x.replaceAll(placeholder, `<@${token}>`)
    );
    return this;
  }
  build() {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: this.title,
          },
        },
        ...this.content.map((c) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: c,
          },
        })),
      ],
    };
  }
}

export async function sendMessage(builder: MessageBuilder): Promise<void> {
  const webhook = getEnvValueOrThrow("SLACK_WEB_HOOK");

  await fetch(webhook, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(builder.build()),
    method: "post",
  });
}
