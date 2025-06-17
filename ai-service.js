const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate enhanced media plan recommendations using Gemini AI
 * @param {Object} userInput - Campaign details
 * @param {Array} baselineRecommendations - Rule-based recommendations
 * @returns {Promise<Object>} Enhanced recommendations
 */
async function generateEnhancedMediaPlan(userInput, baselineRecommendations) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = createMediaPlanPrompt(userInput, baselineRecommendations);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return parseAIResponse(text, userInput, baselineRecommendations);
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    // Fallback to rule-based recommendations if AI fails
    return createFallbackRecommendations(userInput, baselineRecommendations);
  }
}

/**
 * Create a detailed prompt for Gemini AI
 */
function createMediaPlanPrompt(userInput, baseline) {
  const { industry, marketingGoal, budgetTier, totalBudget } = userInput;
  
  return `
As a senior digital marketing strategist, create 2 distinct media plan options for this campaign:

**Campaign Details:**
- Industry: ${industry}
- Marketing Goal: ${marketingGoal}
- Budget Tier: ${budgetTier}
- Total Budget: MYR ${totalBudget.toLocaleString()}

**Current Baseline Recommendation:**
${baseline.map(rec => `- ${rec.platform}: ${Math.round(rec.budgetSplitPercentage * 100)}% (${rec.recommendedObjective})`).join('\n')}

**Instructions:**
1. Create 2 different strategic approaches
2. Each option should have 2-4 platforms
3. Budget allocations should total 100%
4. Provide specific justifications for each platform choice
5. Consider Malaysian market dynamics and cultural factors

**Required JSON Format:**
{
  "option1": {
    "name": "Strategy Name",
    "description": "Brief strategy description",
    "platforms": [
      {
        "platform": "Platform Name",
        "percentage": 0.5,
        "objective": "Specific campaign objective",
        "justification": "Why this platform and allocation"
      }
    ]
  },
  "option2": {
    "name": "Strategy Name", 
    "description": "Brief strategy description",
    "platforms": [
      {
        "platform": "Platform Name",
        "percentage": 0.3,
        "objective": "Specific campaign objective", 
        "justification": "Why this platform and allocation"
      }
    ]
  }
}

**Available Platforms:** Google, Meta, LinkedIn, TikTok, Xiaohongshu

Respond with ONLY the JSON, no additional text.
`;
}

/**
 * Parse AI response and format for the application
 */
function parseAIResponse(aiText, userInput, baseline) {
  try {
    // Extract JSON from the response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const aiRecommendations = JSON.parse(jsonMatch[0]);
    
    // Format the response for our application
    const mediaPlans = [];
    
    // Option 1
    if (aiRecommendations.option1) {
      mediaPlans.push(formatAIOption(
        aiRecommendations.option1,
        userInput.totalBudget,
        'ai-enhanced'
      ));
    }
    
    // Option 2  
    if (aiRecommendations.option2) {
      mediaPlans.push(formatAIOption(
        aiRecommendations.option2,
        userInput.totalBudget,
        'ai-alternative'
      ));
    }
    
    return mediaPlans;
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return createFallbackRecommendations(userInput, baseline);
  }
}

/**
 * Format AI option to match our application structure
 */
function formatAIOption(aiOption, totalBudget, strategy) {
  const recommendations = aiOption.platforms.map(platform => ({
    platform: platform.platform,
    budgetSplitPercentage: platform.percentage,
    recommendedObjective: platform.objective,
    justification: platform.justification,
    allocatedBudget: Math.round(totalBudget * platform.percentage)
  }));
  
  const totalAllocated = recommendations.reduce((sum, rec) => sum + rec.allocatedBudget, 0);
  const primaryPlatform = recommendations.reduce((max, rec) => 
    rec.budgetSplitPercentage > max.budgetSplitPercentage ? rec : max
  ).platform;
  
  return {
    optionName: aiOption.name,
    description: aiOption.description,
    strategy: strategy,
    recommendations: recommendations,
    totalPlatforms: recommendations.length,
    totalAllocated: totalAllocated,
    primaryPlatform: primaryPlatform
  };
}

/**
 * Create fallback recommendations if AI fails
 */
function createFallbackRecommendations(userInput, baseline) {
  const { totalBudget } = userInput;
  
  // Option 1: Use baseline recommendations
  const option1Recommendations = baseline.map(rec => ({
    ...rec,
    allocatedBudget: Math.round(totalBudget * rec.budgetSplitPercentage)
  }));
  
  // Option 2: Create performance-focused variation
  const sortedBaseline = [...baseline].sort((a, b) => b.budgetSplitPercentage - a.budgetSplitPercentage);
  const option2Recommendations = sortedBaseline.slice(0, 2).map((rec, index) => {
    const newPercentage = index === 0 ? 0.7 : 0.3;
    return {
      ...rec,
      budgetSplitPercentage: newPercentage,
      allocatedBudget: Math.round(totalBudget * newPercentage),
      justification: rec.justification + " (Performance-optimized allocation)"
    };
  });
  
  return [
    {
      optionName: "Balanced Strategy",
      description: "Our recommended approach based on industry best practices",
      strategy: "balanced",
      recommendations: option1Recommendations,
      totalPlatforms: option1Recommendations.length,
      totalAllocated: option1Recommendations.reduce((sum, rec) => sum + rec.allocatedBudget, 0),
      primaryPlatform: option1Recommendations.reduce((max, rec) => 
        rec.budgetSplitPercentage > max.budgetSplitPercentage ? rec : max
      ).platform
    },
    {
      optionName: "Performance-Focused Strategy", 
      description: "Optimized for maximum performance and conversions",
      strategy: "performance",
      recommendations: option2Recommendations,
      totalPlatforms: option2Recommendations.length,
      totalAllocated: option2Recommendations.reduce((sum, rec) => sum + rec.allocatedBudget, 0),
      primaryPlatform: option2Recommendations.reduce((max, rec) => 
        rec.budgetSplitPercentage > max.budgetSplitPercentage ? rec : max
      ).platform
    }
  ];
}

/**
 * Check if AI service is available
 */
function isAIAvailable() {
  return process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;
}

module.exports = {
  generateEnhancedMediaPlan,
  isAIAvailable
}; 