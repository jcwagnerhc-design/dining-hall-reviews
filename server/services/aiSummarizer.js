import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../db/supabase.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runSummarizer(monthYear) {
  // Fetch all recommendations for the month
  const { data: recs, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('month_year', monthYear);

  if (error) throw error;

  const cuisineRecs = (recs || []).filter((r) => r.rec_type === 'cuisine').map((r) => r.text);
  const dishRecs = (recs || []).filter((r) => r.rec_type === 'dish').map((r) => r.text);

  if (cuisineRecs.length === 0 && dishRecs.length === 0) {
    const emptySummary = {
      top_cuisines: [],
      top_dishes: [],
      total_cuisine_recommendations: 0,
      total_dish_recommendations: 0,
      summary: 'No recommendations were submitted this month.',
    };

    const { data, error: insertErr } = await supabase
      .from('ai_summaries')
      .insert({ month_year: monthYear, summary_json: emptySummary })
      .select()
      .single();

    if (insertErr) throw insertErr;
    return data;
  }

  const prompt = `You are analyzing food recommendations from students and staff at Blair Academy's dining hall for the month of ${monthYear}.

Here are all CUISINE recommendations submitted this month (${cuisineRecs.length} total):
${cuisineRecs.map((r, i) => `${i + 1}. "${r}"`).join('\n')}

Here are all specific DISH recommendations submitted this month (${dishRecs.length} total):
${dishRecs.map((r, i) => `${i + 1}. "${r}"`).join('\n')}

Analyze these recommendations and return ONLY a valid JSON object (no markdown, no code fences) with this structure:
{
  "top_cuisines": [
    { "cuisine": "Name", "count": <number of mentions>, "related_terms": ["term1", "term2"] }
  ],
  "top_dishes": [
    { "dish": "Name", "count": <number of mentions>, "related_terms": ["term1", "term2"] }
  ],
  "total_cuisine_recommendations": ${cuisineRecs.length},
  "total_dish_recommendations": ${dishRecs.length},
  "summary": "A brief 2-3 sentence summary of the trends and most popular requests."
}

Important rules:
- Group similar recommendations together (e.g., "sushi", "japanese food", "ramen" all count toward Japanese cuisine)
- Rank by count, highest first
- Be accurate with counts — each recommendation should be counted exactly once
- Return ONLY the JSON object, nothing else`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].text.trim();

  let summaryJson;
  try {
    summaryJson = JSON.parse(responseText);
  } catch {
    // Try to extract JSON from the response if it has extra text
    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) {
      summaryJson = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  const { data, error: insertErr } = await supabase
    .from('ai_summaries')
    .insert({ month_year: monthYear, summary_json: summaryJson })
    .select()
    .single();

  if (insertErr) throw insertErr;
  return data;
}
