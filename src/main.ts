import { getOnCallInformation } from "./integrations/pagerduty.ts";
import { getMentionTokenForEmail, MessageBuilder, sendMessage } from "./integrations/slack.ts";
import {DateTime} from "npm:ts-luxon";

const escalationPolicy = Deno.env.get("ESCALATION_POLICY_ID")!;
const onCallInfo = await getOnCallInformation(escalationPolicy);

const mentionToken = await getMentionTokenForEmail(onCallInfo.email);

const formattedDate = DateTime.now().toLocaleString(DateTime.DATE_MED);
const builder = new MessageBuilder(`On-Call Rotation for ${formattedDate}`)
  .addLine("@id is on-call for the week!")
  .addMention("@id", mentionToken)

await sendMessage(builder);


