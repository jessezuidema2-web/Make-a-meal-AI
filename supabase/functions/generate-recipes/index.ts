// Supabase Edge Function: Generate Recipes
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
    if (!body.scanId) {
      return new Response(
        JSON.stringify({ error: 'Missing scanId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: scan } = await supabase
      .from('scans')
      .select('ingredients')
      .eq('id', body.scanId)
      .eq('user_id', user.id)
      .single();

    if (!scan || !scan.ingredients) {
      return new Response(
        JSON.stringify({ error: 'Scan not found or no ingredients' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipes = await generateRecipesWithAI(scan.ingredients);

    await supabase
      .from('scans')
      .update({ recipes })
      .eq('id', body.scanId)
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({ recipes }),
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

async function generateRecipesWithAI(ingredients: any[]): Promise<any[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('AI API key not configured');

  const ingredientList = ingredients.map(i => `${i.quantity}${i.unit} ${i.name}`).join(', ');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: 'You create recipes from given ingredients. Return JSON only. Use the EXACT ingredient names provided by the user in your recipe ingredients - do not rename or rephrase them.'
      }, {
        role: 'user',
        content: `Ingredients: ${ingredientList}

Make 5 recipes. Recipe 1-3: use EVERY single ingredient listed above, no exceptions. Use the exact same names I gave you. Recipe 4-5: use at least 80% of ingredients.

Each recipe needs: name, description (1 sentence), ingredients (use EXACT names from my list with quantity and unit), steps (3-5 short steps), prepTime, cookTime, servings, healthScore (1-10).

JSON: {"recipes":[{"name":"X","description":"X","ingredients":[{"name":"Oats","quantity":500,"unit":"g"}],"steps":["X"],"prepTime":10,"cookTime":15,"servings":4,"healthScore":8}]}`
      }],
    }),
  });

  if (!response.ok) throw new Error(`AI error: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('No AI response');

  const result = JSON.parse(content);
  const rawRecipes = result.recipes || [];

  return rawRecipes.map((recipe: any, index: number) => {
    const recipeIngredients = recipe.ingredients || [];

    let totalUsed = 0, totalAvailable = 0, matched = 0;

    for (const orig of ingredients) {
      const origQty = parseFloat(orig.quantity) || 0;
      totalAvailable += origQty;

      const found = recipeIngredients.find((ri: any) => {
        const a = (ri.name || '').toLowerCase().trim();
        const b = (orig.name || '').toLowerCase().trim();
        if (a === b) return true;
        if (a.includes(b) || b.includes(a)) return true;
        const aWords = a.split(/\s+/);
        const bWords = b.split(/\s+/);
        return aWords.some((w: string) => w.length > 2 && bWords.some((bw: string) => bw.length > 2 && (w.includes(bw) || bw.includes(w))));
      });

      if (found) {
        matched++;
        totalUsed += Math.min(parseFloat(found.quantity) || 0, origQty);
      }
    }

    const matchScore = Math.round(((matched / ingredients.length) * 0.5 + (totalUsed / totalAvailable) * 0.5) * 100) || 0;

    let macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const ri of recipeIngredients) {
      const orig = ingredients.find((o: any) => {
        const a = (ri.name || '').toLowerCase().trim();
        const b = (o.name || '').toLowerCase().trim();
        if (a === b) return true;
        if (a.includes(b) || b.includes(a)) return true;
        const aWords = a.split(/\s+/);
        const bWords = b.split(/\s+/);
        return aWords.some((w: string) => w.length > 2 && bWords.some((bw: string) => bw.length > 2 && (w.includes(bw) || bw.includes(w))));
      });
      if (orig?.macrosPer100g) {
        const m = (parseFloat(ri.quantity) || 0) / 100;
        macros.calories += (orig.macrosPer100g.calories || 0) * m;
        macros.protein += (orig.macrosPer100g.protein || 0) * m;
        macros.carbs += (orig.macrosPer100g.carbs || 0) * m;
        macros.fat += (orig.macrosPer100g.fat || 0) * m;
      }
    }
    macros = { calories: Math.round(macros.calories), protein: Math.round(macros.protein), carbs: Math.round(macros.carbs), fat: Math.round(macros.fat) };

    const total = (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9) || 1;
    const pPct = (macros.protein * 4) / total;
    const cPct = (macros.carbs * 4) / total;
    const fPct = (macros.fat * 9) / total;

    const mealTiming = cPct > 0.5 ? 'pre-workout' : pPct > 0.3 ? 'post-workout' : 'breakfast';
    const tags: string[] = [];
    if (pPct > 0.25) tags.push('high-protein');
    if (cPct > 0.5) tags.push('high-carb');
    if (fPct > 0.4) tags.push('high-fat');
    if (macros.calories > 600) tags.push('bulking');
    else if (macros.calories < 400) tags.push('cutting');

    const healthScore = Math.min(10, Math.max(1, recipe.healthScore || 5));

    return {
      id: String(index + 1),
      name: recipe.name || `Recipe ${index + 1}`,
      description: recipe.description || '',
      ingredients: recipeIngredients,
      steps: recipe.steps || ['Combine ingredients', 'Mix well', 'Serve'],
      macros,
      prepTime: recipe.prepTime || 10,
      cookTime: recipe.cookTime || 5,
      servings: recipe.servings || 1,
      matchScore,
      ingredientsUsed: matched,
      totalIngredients: ingredients.length,
      mealTiming,
      tags,
      healthScore,
      imageUrl: getRecipeImageUrl(recipe.name || `Recipe ${index + 1}`, index),
    };
  }).sort((a: any, b: any) => b.matchScore - a.matchScore);
}

// Reliable food images from Unsplash (static IDs that won't break)
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop',
];

function getRecipeImageUrl(name: string, index: number): string {
  return FOOD_IMAGES[index % FOOD_IMAGES.length];
}
