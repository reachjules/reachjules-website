/* ============================================================================
   reachjulian — Slack relay (Cloudflare Worker)

   This file is NOT part of the website. It's the little server that sits between
   your contact form and Slack, so your Slack webhook URL stays private and the
   form can confirm that a lead was delivered.

   ONE-TIME SETUP (free, ~5 minutes, no command line needed):

   1. Create a Slack Incoming Webhook:
      Slack  ->  https://api.slack.com/apps  ->  Create New App  ->  From scratch
      ->  pick your workspace  ->  Incoming Webhooks  ->  turn On
      ->  "Add New Webhook to Workspace"  ->  choose the channel (e.g. #leads)
      ->  copy the webhook URL (looks like https://hooks.slack.com/services/T.../B.../xxxx)

   2. Create the Worker:
      https://dash.cloudflare.com  ->  Workers & Pages  ->  Create  ->  Create Worker
      ->  give it a name like "reachjulian-slack"  ->  Deploy
      ->  "Edit code"  ->  delete the sample, paste THIS whole file  ->  Deploy

   3. Add your webhook as a secret (so it's never in the website):
      The Worker's page  ->  Settings  ->  Variables and Secrets
      ->  Add variable, name it exactly:  SLACK_WEBHOOK_URL
      ->  paste the webhook URL, click "Encrypt", Save/Deploy.

   4. Copy your Worker URL (e.g. https://reachjulian-slack.<you>.workers.dev) and
      paste it into index.html -> LEAD_CONFIG.relayUrl, and set mode: "relay".

   That's it. Optionally add an email copy later — see the note at the bottom.
   ============================================================================ */

const ALLOWED_ORIGINS = [
  "https://reachjulian.com",
  "https://www.reachjulian.com",
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    try {
      const d = await request.json();

      // Honeypot: bots fill this; humans never see it. Pretend success, drop it.
      if (d.company) {
        return json({ ok: true }, cors);
      }

      const text = [
        ":round_pushpin: *New lead — reachjulian.com*",
        `*Name:* ${d.name || "—"}`,
        `*Email:* ${d.email || "—"}`,
        `*Phone:* ${d.phone || "—"}`,
        `*City / area:* ${d.city || "—"}`,
        `*Business:* ${d.biz || "—"}`,
        `*Annual revenue:* ${d.revenue || "—"}`,
        `*Notes:* ${d.note || "—"}`,
      ].join("\n");

      const slackRes = await fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!slackRes.ok) {
        return json({ ok: false, error: `Slack responded ${slackRes.status}` }, cors, 502);
      }
      return json({ ok: true }, cors);
    } catch (err) {
      return json({ ok: false, error: String(err) }, cors, 500);
    }
  },
};

function json(obj, cors, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/* ----------------------------------------------------------------------------
   WANT AN EMAIL COPY TOO?  Slack is the fast "new lead!" ping; email is a nice
   durable record. Easiest path: also create a second Incoming Webhook is not
   email — instead use a free email API (e.g. Resend / MailChannels) and add a
   second fetch() here. Ask and this can be dropped in. For most people, Slack
   alone is plenty, and you always have the mailto fallback in the form.
---------------------------------------------------------------------------- */
