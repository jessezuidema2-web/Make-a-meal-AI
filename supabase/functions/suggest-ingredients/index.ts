import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { ingredients, userPreferences } = await req.json();
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(JSON.stringify({ error: 'No ingredients provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ingredientNames = ingredients.map((i: string) => i).join(', ');

    const cuisinePrefs = userPreferences?.cuisinePreferences?.length
      ? userPreferences.cuisinePreferences.join(', ')
      : 'no specific preference';
    const tastePrefs = userPreferences?.tastePreferences?.length
      ? userPreferences.tastePreferences.join(', ')
      : 'no specific preference';
    const fitnessGoal = userPreferences?.fitnessGoal || 'general health';

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a culinary expert. Given a list of ingredients and user preferences, suggest 3-5 complementary ingredients that:\n1. Match the user's cuisine preferences: ${cuisinePrefs}\n2. Align with their taste preferences: ${tastePrefs}\n3. Support their fitness goal: ${fitnessGoal}\n4. Would make delicious, well-balanced recipes together\n\nReturn a JSON array of objects with: name (string), quantity (number), unit (string, one of: g, ml, pcs, tsp, tbsp). Only return the JSON array, no other text.`,
          },
          {
            role: 'user',
            content: `Current ingredients: ${ingredientNames}. Suggest 3-5 extra ingredients that complement these well.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content || '[]';

    let suggestions;
    try {
      // Parse the JSON, handling potential markdown code blocks
      const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [];
    }

    // Add IDs to suggestions
    const suggestionsWithIds = suggestions.map((s: any, i: number) => ({
      id: `suggestion-${Date.now()}-${i}`,
      name: s.name || '',
      quantity: s.quantity || 1,
      unit: s.unit || 'g',
    }));

    return new Response(JSON.stringify({ suggestions: suggestionsWithIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate suggestions' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
