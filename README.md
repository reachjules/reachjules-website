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
| `slack-relay-worker.js` | The tiny free "server" that sends form entries to Slack. **Not part of the website** — it gets pasted into Cloudflare (see step 4). |

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

## 4. Send the form to Slack

The form works the moment the site is up: until you finish this step, submitting
opens a pre-filled email to you, so no lead is ever lost. To get the nicer Slack
ping, do the one-time setup in **`slack-relay-worker.js`** (step-by-step at the top
of that file). The short version:

1. Make a Slack **Incoming Webhook** for your `#leads` channel.
2. Create a free **Cloudflare Worker**, paste in `slack-relay-worker.js`, and add
   your webhook as an encrypted variable named `SLACK_WEBHOOK_URL`.
3. Copy your Worker URL and open `index.html`. Near the bottom, in `LEAD_CONFIG`:
   ```js
   var LEAD_CONFIG = {
     mode: "relay",
     relayUrl: "https://reachjulian-slack.<you>.workers.dev",
     ...
   };
   ```
4. Re-upload `index.html`. New leads now land in Slack instantly.

**Why the relay instead of posting to Slack directly?** Browsers can't reliably
post straight to a Slack webhook (Slack blocks it), and doing so would expose your
webhook publicly for spammers. The Worker keeps the webhook private, confirms
delivery, and only accepts submissions from your domain. It's free.

*Prefer the quick-and-dirty route anyway?* Set `mode: "slack-direct"` and paste your
webhook into `slackWebhook`. It'll usually work, but the webhook is visible in the
page source and delivery can't be confirmed. The relay is the better call.

*Want email instead of / in addition to Slack?* There's a note at the bottom of the
Worker file — easy to add.

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
