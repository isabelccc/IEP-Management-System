/**
 * Assistant API – stub responses. Replace with real AI service later.
 */

export async function chat(req, res) {
  try {
    const { message, context } = req.body || {};
    const text = (message || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'message is required' });
    }
    // Stub: echo-style reply
    const reply = `You said: "${text.slice(0, 200)}". This is a stub reply. Connect a real LLM later.`;
    return res.status(200).json({ reply, draftGenerated: false });
  } catch (err) {
    console.error('assistant/chat:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function generatePresentLevels(req, res) {
  try {
    const { studentId } = req.body || {};
    const draft = `[Stub] Present levels draft for student ${studentId || 'unknown'}. Replace with real AI generation.`;
    return res.status(200).json({ draft, draftGenerated: true });
  } catch (err) {
    console.error('assistant/present-levels:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function generateGoals(req, res) {
  try {
    const { areaOfNeed, baseline, targetDate } = req.body || {};
    const suggestions = [
      { goalStatement: '[Stub] Sample measurable goal.', criteria: '80% accuracy', measurementMethod: 'Teacher observation' },
    ];
    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('assistant/goals/generate:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function analyzeGoal(req, res) {
  try {
    const { goalStatement } = req.body || {};
    return res.status(200).json({
      score: 7,
      feedback: '[Stub] Goal quality analysis. Connect a real model later.',
      suggestions: ['Ensure criteria are measurable.'],
    });
  } catch (err) {
    console.error('assistant/goals/analyze:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function suggestAccommodations(req, res) {
  try {
    const { needs, gradeLevel } = req.body || {};
    const suggestions = [
      { accommodationId: 1, title: '[Stub] Extended time', rationale: 'Suggested based on needs.' },
    ];
    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('assistant/accommodations/suggest:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
