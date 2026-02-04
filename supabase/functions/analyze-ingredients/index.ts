// Supabase Edge Function: Analyze Ingredients
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  macrosPer100g?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { imageData, scanId, isBase64, imageUrl } = body;
    
    if (!scanId || (!imageData && !imageUrl)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const canProceed = await checkRateLimit(supabase, user.id);
    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finalImageUrl = isBase64 && imageData
      ? `data:image/jpeg;base64,${imageData}`
      : (imageUrl || imageData);

    const ingredients = await analyzeImageWithAI(finalImageUrl);

    const { error: updateError } = await supabase
      .from('scans')
      .update({ ingredients })
      .eq('id', scanId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update scan with ingredients:', updateError);
    }

    return new Response(
      JSON.stringify({ ingredients }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkRateLimit(supabase: any, userId: string): Promise<boolean> {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('user_id', userId)
    .single();

  if (subscription?.plan_type === 'premium' && subscription?.status === 'active') {
    return true;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  return (count ?? 0) < 15;
}

function normalizeUnit(raw?: string): string {
  const u = (raw || 'g').trim().toLowerCase();
  if (['ml', 'milliliter', 'milliliters', 'millilitres'].includes(u)) return 'ml';
  if (['l', 'liter', 'liters', 'litres'].includes(u)) return 'l';
  if (['g', 'gram', 'grams'].includes(u)) return 'g';
  if (['kg', 'kilogram', 'kilograms'].includes(u)) return 'kg';
  if (['pcs', 'pieces', 'piece', 'stuks', 'stuk'].includes(u)) return 'pcs';
  if (['tbsp', 'tablespoon', 'tablespoons'].includes(u)) return 'tbsp';
  if (['tsp', 'teaspoon', 'teaspoons'].includes(u)) return 'tsp';
  if (['cup', 'cups'].includes(u)) return 'cup';
  if (['oz', 'ounce', 'ounces'].includes(u)) return 'oz';
  if (['lb', 'lbs', 'pound', 'pounds'].includes(u)) return 'lb';
  return u.slice(0, 10) || 'g';
}

async function analyzeImageWithAI(imageUrl: string): Promise<Ingredient[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('AI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and identify ALL visible food products.

For each item:
1. Read the BRAND NAME and PRODUCT NAME from the label if visible.
2. Read the PACKAGE SIZE from the label (e.g. "500g", "1L"). If not readable, estimate a typical package size for that product.
3. If the package appears opened or partially used, estimate the remaining quantity.
4. Provide accurate macros PER 100g (or per 100ml for liquids) based on the specific product.

Return ONLY a valid JSON array with NO additional text:
[{"name": "Brand Product Name", "quantity": 500, "unit": "g", "macrosPer100g": {"calories": 200, "protein": 10, "carbs": 25, "fat": 8, "fiber": 3}}]

Rules:
- quantity must be a positive number (never 0)
- unit must be "g", "ml", "kg", "l", or "pcs"
- For loose items (eggs, fruits), use "pcs" as unit and estimate weight per piece in the name
- Always include macrosPer100g with all 5 fields
- If unsure about exact quantity, use a reasonable estimate for a standard package`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const ingredients = JSON.parse(jsonStr);

    return ingredients.map((ing: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      name: ing.name?.trim().replace(/[<>]/g, '').slice(0, 100) || 'Unknown',
      quantity: parseFloat(ing.quantity) > 0 ? parseFloat(ing.quantity) : 100,
      unit: normalizeUnit(ing.unit),
      macrosPer100g: {
        calories: Number(ing.macrosPer100g?.calories) || 0,
        protein: Number(ing.macrosPer100g?.protein) || 0,
        carbs: Number(ing.macrosPer100g?.carbs) || 0,
        fat: Number(ing.macrosPer100g?.fat) || 0,
        fiber: Number(ing.macrosPer100g?.fiber) || 0,
      },
    }));
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse ingredient data from AI response');
  }
}