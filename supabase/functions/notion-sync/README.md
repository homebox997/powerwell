# Notion Sync Edge Function

This worker keeps the Notion API key out of the browser.

## Secrets

Set these Supabase function secrets:

```bash
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set NOTION_API_KEY="secret_xxx"
```

## Deploy

```bash
supabase functions deploy notion-sync
```

## Schedule

Create two scheduled triggers or external cron jobs:

- 08:00 Australia/Sydney: `{"action":"sync","trigger_type":"scheduled_0800"}`
- 20:00 Australia/Sydney: `{"action":"sync","trigger_type":"scheduled_2000"}`

Also run `{"action":"flush_callbacks"}` after approvals/rejections to mark Notion pages synced or add rejection comments.

