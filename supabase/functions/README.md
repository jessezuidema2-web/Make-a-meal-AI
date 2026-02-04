# Supabase Edge Functions

These serverless functions handle sensitive operations securely on the backend.

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

## Available Functions

### 1. `analyze-ingredients`
- **Purpose**: Analyzes ingredient photos using AI (OpenAI Vision)
- **Rate Limit**: Free tier = 10 scans/month, Premium = unlimited
- **Secrets Needed**: `OPENAI_API_KEY`

### 2. `generate-recipes`
- **Purpose**: Generates personalized recipes based on ingredients and user preferences
- **Rate Limit**: Free tier = 5 generations/hour, Premium = unlimited
- **Secrets Needed**: `OPENAI_API_KEY`

### 3. `check-limits` (TODO)
- **Purpose**: Checks if user has exceeded rate limits
- **Returns**: Boolean + remaining quota

## Setup Secrets

Store sensitive API keys as Supabase secrets:

```bash
# OpenAI API Key
supabase secrets set OPENAI_API_KEY=sk-...

# Anthropic API Key (if using Claude instead)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Stripe Secret Key (for webhooks)
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

View current secrets:
```bash
supabase secrets list
```

## Deploy Functions

Deploy all functions:
```bash
supabase functions deploy
```

Deploy a specific function:
```bash
supabase functions deploy analyze-ingredients
supabase functions deploy generate-recipes
```

## Test Functions Locally

1. Start local Supabase:
```bash
supabase start
```

2. Serve functions locally:
```bash
supabase functions serve
```

3. Test with curl:
```bash
# Test analyze-ingredients
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-ingredients' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"imageUrl":"https://example.com/image.jpg","scanId":"scan-id"}'

# Test generate-recipes
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-recipes' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"scanId":"scan-id"}'
```

## Environment URLs

After deployment, your functions are available at:

**Production:**
```
https://your-project-ref.supabase.co/functions/v1/analyze-ingredients
https://your-project-ref.supabase.co/functions/v1/generate-recipes
```

## Client-Side Integration

Update the client code to call Edge Functions instead of AI APIs directly:

```typescript
// src/services/aiService.ts
import { supabase } from '../config/supabase';

export async function analyzeIngredients(imageUrl: string, scanId: string) {
  const { data, error } = await supabase.functions.invoke('analyze-ingredients', {
    body: { imageUrl, scanId },
  });

  if (error) throw error;
  return data;
}

export async function generateRecipes(scanId: string) {
  const { data, error } = await supabase.functions.invoke('generate-recipes', {
    body: { scanId },
  });

  if (error) throw error;
  return data;
}
```

## Security Features

✅ **Authentication**: All requests verified with JWT
✅ **Rate Limiting**: Different limits for free/premium users
✅ **API Keys Protected**: Never exposed to client
✅ **Usage Tracking**: All API calls logged
✅ **Input Validation**: Sanitized on backend
✅ **RLS Enforcement**: Database access controlled

## Monitoring

View function logs:
```bash
supabase functions logs analyze-ingredients
supabase functions logs generate-recipes
```

## Cost Optimization

1. **Cache AI responses** for common ingredients
2. **Compress images** before sending to AI
3. **Batch requests** when possible
4. **Set reasonable timeouts** (60s max)
5. **Monitor usage** via usage_tracking table

## Troubleshooting

### Function returns 401 Unauthorized
- Check that Authorization header is included
- Verify user is logged in
- Ensure JWT token is valid

### Function returns 429 Rate Limit Exceeded
- User has exceeded free tier limits
- Prompt to upgrade to premium
- Check usage_tracking table for recent activity

### Function returns 500 Internal Error
- Check function logs: `supabase functions logs function-name`
- Verify secrets are set correctly
- Ensure AI API key is valid and has credits

### AI API returns errors
- Check API key balance/credits
- Verify API endpoint is correct
- Review AI API documentation for changes

## Alternative AI Providers

### Using Anthropic Claude

Replace OpenAI calls with:

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-opus-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  }),
});
```

### Using Custom AI Backend

Point to your own API:
```typescript
const response = await fetch('https://your-api.com/analyze', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${Deno.env.get('CUSTOM_API_KEY')}` },
  body: JSON.stringify({ imageUrl }),
});
```

## Next Steps

1. Deploy functions to production
2. Update client code to use Edge Functions
3. Test rate limiting works correctly
4. Monitor costs and usage
5. Implement caching for common requests
6. Add more sophisticated error handling
7. Implement webhook for Stripe payments
