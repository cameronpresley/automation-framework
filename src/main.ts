import { getOnCallInformation } from "./integrations/pagerduty.ts";

const escalationPolicy = Deno.env.get("ESCALATION_POLICY_ID")!;
const onCallInfo = await getOnCallInformation(escalationPolicy);

console.log(`${onCallInfo.name} <${onCallInfo.email}> is currently on call!`);
