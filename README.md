# reachjulian.com

A four-page static site with a lead form that pings you in Slack. No build step,
no framework — just upload the files. Hosted free on GitHub Pages.

## What's in here

| File | What it is |
|---|---|
| `index.html` | Home page (the one people land on) + the contact form |
| `about.html` | About Me |
| `privacy.html` | Privacy Policy |
| `disclaimer.html` | Disclaimer |
| `404.html` | Friendly "page not found" page |
| `CNAME` | Tells GitHub your custom domain is `reachjulian.com` |
| `.nojekyll` | Tells GitHub to serve the files as-is (skip Jekyll) |
| `google-apps-script.gs` | **Recommended** lead handler: drops each submission into a Google Sheet (+ optional Slack ping). **Not part of the website** — it gets pasted into Google Apps Script (see step 4). |
| `slack-relay-worker.js` | Alternative Slack-only handler. **Not part of the website** — it gets pasted into Cloudflare (see step 4). |

---

## Before you publish: fill in the blanks

Search the files for these and replace them:

- ~~Legal entity name~~ — **done:** set to **Caliza Group LLC** on the privacy and disclaimer pages.
- ~~Effective date~~ — **done:** set to **July 1, 2026** on both legal pages.
- **`julian@reachjulian.com`** — appears throughout. Change it if your real address differs.
- **Photo** — `about.html` shows a "J" tile. To use a real headshot, drop `julian.jpg` in this folder and follow the comment in that file.
- **Have a Texas attorney glance at the two legal pages** before going live. They're conservative starting templates, not legal advice.

---

## 1. Put the files on GitHub

1. Create a free account at <https://github.com>.
2. Click **New repository**. Name it **`reachjulian.com`** (any name works, but this is tidy). Set it to **Public**. Create it.
3. On the repo page, click **Add file -> Upload files**, then drag in **everything inside this folder** (including `CNAME` and `.nojekyll` — turn on "show hidden files" if you don't see `.nojekyll`). Commit.

## 2. Turn on GitHub Pages

1. In the repo, go to **Settings -> Pages**.
2. Under **Build and deployment**, set **Source = Deploy from a branch**, **Branch = `main`**, **Folder = `/ (root)`**. Save.
3. Wait ~1 minute. Your site goes live at `https://<your-username>.github.io/reachjulian.com/` — good enough to confirm it works while DNS propagates.

## 3. Point your domain at it

In **Settings -> Pages -> Custom domain**, type `reachjulian.com` and Save. Then, at
whatever company you bought the domain from (GoDaddy, Namecheap, Cloudflare, etc.),
open its **DNS settings** and add these records:

**Apex domain (`reachjulian.com`) — four A records, all with name `@`:**

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**`www` — one CNAME record:**

```
Type: CNAME   Name: www   Value: <your-username>.github.io
```

(Delete any pre-existing parking/redirect records for `@` or `www` first.)

DNS can take anywhere from a few minutes to 24 hours. Once it resolves, go back to
**Settings -> Pages** and tick **Enforce HTTPS**. Done — `https://reachjulian.com` is live.

## 4. Where the leads go

The form works the moment the site is up: until you finish this step, submitting
opens a pre-filled email to you, so no lead is ever lost. To capture leads properly,
pick one of these (you only need one).

### Recommended: Google Sheet (+ optional Slack) — `google-apps-script.gs`

Because you already use Google, this is the simplest path and gives you a running
spreadsheet of every lead. The same script can also ping Slack. Full step-by-step is
at the top of **`google-apps-script.gs`**; the short version:

1. Create a blank **Google Sheet**.
2. In it, open **Extensions -> Apps Script**, paste in `google-apps-script.gs`.
   (Optional: paste a Slack Incoming Webhook URL into the `SLACK_WEBHOOK_URL` line to
   get Slack pings too.)
3. **Deploy -> New deployment -> Web app**, *Execute as: Me*, *Who has access: Anyone*.
   Authorize, then copy the **Web app URL**.
4. In `index.html`, near the bottom, set:
   ```js
   var LEAD_CONFIG = {
     mode: "apps-script",
     appsScriptUrl: "PASTE_THE_WEB_APP_URL_HERE",
     ...
   };
   ```
5. Re-upload `index.html`. Every submission now adds a row to your Sheet (and pings
   Slack if you added the webhook).

### Alternative: Slack only — `slack-relay-worker.js`

If you'd rather not use a Sheet and just want Slack, use the Cloudflare Worker in
`slack-relay-worker.js` (setup at the top of that file), then set `mode: "relay"` and
`relayUrl` in `LEAD_CONFIG`. It keeps your webhook private and confirms delivery.

**Note on posting to Slack directly from the page:** browsers can't reliably do it
(Slack blocks cross-origin requests) and it would expose your webhook to spammers —
which is why both recommended paths use a tiny free middle step. A `slack-direct`
mode exists in the config for the brave, but it's not advised.

---

## Editing later

Every page is a single self-contained `.html` file — open it in any text editor,
change the words, re-upload to GitHub. Changes go live in about a minute. No build,
no dependencies.

## The Google Form qualifier

Your plan to send new leads a Google Form to pre-qualify them fits nicely: this site
captures the first "I'm interested" with just enough detail to be worth your time,
and your follow-up email carries the Google Form link for the deeper questions. If
you ever want that form embedded on a "thank you" page here instead, that's a small
addition.
