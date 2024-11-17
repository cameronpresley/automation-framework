import { api } from "npm:@pagerduty/pdjs";

type PDObject = {
  id: string;
  type: string;
  summary: string;
  self: string;
  html_url: string;
};
type EscalationRule = {
  id: string;
  escalation_delay_in_minutes: number;
  targets: PDObject[];
};

type EscalationPolicy = {
  id: string;
  type: "escalation_policy";
  summary: string;
  self: string;
  html_url: string;
  name: string;
  escalation_rules: EscalationRule[];
  services: PDObject[];
  num_loops: number;
  teams: any[];
  description: [];
};

type ScheduleLayer = {
  id: string;
  name: string;
  users: ScheduleUser[];
};
type ScheduleUser = {
  user: PDObject;
};

type RenderedScheduleEntry = ScheduleUser & {
  end: string;
  id: string;
  start: string;
};

type Schedule = PDObject & {
  description: string;
  escalation_policies: PDObject[];
  final_schedule: {
    name: string;
    rendered_coverage_percentage: number | null;
    rendered_schedule_entries: RenderedScheduleEntry[];
  };
  overrides_schedule: {
    name: string;
    rendered_coverage_percentage: number | null;
    rendered_schedule_entries: RenderedScheduleEntry[];
  };
  schedule_layers: ScheduleLayer[];
  users: ScheduleUser[];
};

export async function getOnCallInformation(
  escalationPolicy: string
): Promise<{ name: string; email: string }> {
  const apiToken = Deno.env.get("PAGERDUTY_API_TOKEN");
  if (!apiToken) {
    throw new Error("couldn't find token");
  }

  const pd = api({ token: apiToken });

  const policy = (await pd.get(`/escalation_policies/${escalationPolicy}`)).data
    .escalation_policy as EscalationPolicy;

  const scheduleId = policy.escalation_rules[0].targets[0].id;

  const now = new Date();
  const currentSchedule = (
    await pd.get(
      `/schedules/${scheduleId}?since=${now.toISOString()}&until=${now.toISOString()}`
    )
  ).data.schedule as Schedule;
  const onCallUserId =
    currentSchedule.final_schedule.rendered_schedule_entries[0].user.id;

  const user = await pd.get("/users/" + onCallUserId);
  return { email: user.data.user.email, name: user.data.user.name };
}
