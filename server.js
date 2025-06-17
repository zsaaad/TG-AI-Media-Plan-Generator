require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const aiService = require('./ai-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load scenarios data
let scenarios;
try {
  const scenariosData = fs.readFileSync(path.join(__dirname, 'data', 'scenarios.json'), 'utf8');
  scenarios = JSON.parse(scenariosData);
} catch (error) {
  console.error('Error loading scenarios data:', error);
  process.exit(1);
}

// Helper function to check if arrays have intersection
function hasIntersection(arr1, arr2) {
  return arr1.some(item => arr2.includes(item));
}

// Helper function to match scenario conditions
function matchScenario(userInput, scenario) {
  const { industry, marketingGoal, budgetTier } = userInput;
  const conditions = scenario.conditions;
  
  // Check if industries match (handles both single and multiple industries)
  const industryMatch = hasIntersection(
    Array.isArray(industry) ? industry : [industry], 
    conditions.industry
  );
  
  // Check if marketing goals match (handles both single and multiple goals)
  const goalMatch = hasIntersection(
    Array.isArray(marketingGoal) ? marketingGoal : [marketingGoal], 
    conditions.marketingGoal
  );
  
  // Check if budget tier matches
  const budgetMatch = conditions.budgetTier === budgetTier;
  
  return industryMatch && goalMatch && budgetMatch;
}

// Calculate budget allocation based on total budget and percentages
function calculateBudgetAllocation(totalBudget, recommendations) {
  return recommendations.map(rec => ({
    ...rec,
    allocatedBudget: Math.round(totalBudget * rec.budgetSplitPercentage)
  }));
}

// Generate two different media plan options
function generateTwoMediaPlanOptions(matchingScenarios, totalBudget, userInput) {
  const plans = [];
  
  if (matchingScenarios.length >= 1) {
    // Option 1: Primary recommendation (exact match or first match)
    const primaryScenario = matchingScenarios[0];
    const primaryRecommendations = calculateBudgetAllocation(totalBudget, primaryScenario.recommendation);
    
    plans.push({
      optionName: "Balanced Strategy",
      description: "Our recommended approach based on industry best practices",
      strategy: "balanced",
      recommendations: primaryRecommendations,
      totalPlatforms: primaryRecommendations.length,
      totalAllocated: primaryRecommendations.reduce((sum, rec) => sum + rec.allocatedBudget, 0),
      primaryPlatform: primaryRecommendations.reduce((max, rec) => 
        rec.budgetSplitPercentage > max.budgetSplitPercentage ? rec : max
      ).platform
    });
    
    // Option 2: Generate alternative approach
    let alternativeRecommendations;
    let alternativeName;
    let alternativeDescription;
    
    if (matchingScenarios.length > 1) {
      // Use second matching scenario if available
      alternativeRecommendations = calculateBudgetAllocation(totalBudget, matchingScenarios[1].recommendation);
      alternativeName = "Alternative Strategy";
      alternativeDescription = "A different approach with varied platform focus";
    } else {
      // Create performance-focused variation of the primary scenario
      alternativeRecommendations = createPerformanceFocusedVariation(primaryRecommendations, totalBudget);
      alternativeName = "Performance-Focused Strategy";
      alternativeDescription = "Optimized for maximum performance and conversions";
    }
    
    plans.push({
      optionName: alternativeName,
      description: alternativeDescription,
      strategy: "performance",
      recommendations: alternativeRecommendations,
      totalPlatforms: alternativeRecommendations.length,
      totalAllocated: alternativeRecommendations.reduce((sum, rec) => sum + rec.allocatedBudget, 0),
      primaryPlatform: alternativeRecommendations.reduce((max, rec) => 
        rec.budgetSplitPercentage > max.budgetSplitPercentage ? rec : max
      ).platform
    });
  }
  
  return plans;
}

// Create performance-focused variation
function createPerformanceFocusedVariation(originalRecommendations, totalBudget) {
  // Create a more concentrated approach - boost top 2 platforms
  const sortedRecs = [...originalRecommendations].sort((a, b) => b.budgetSplitPercentage - a.budgetSplitPercentage);
  
  if (sortedRecs.length >= 2) {
    // Concentrate budget on top 2 platforms
    const newRecommendations = sortedRecs.slice(0, 2).map((rec, index) => {
      const newPercentage = index === 0 ? 0.7 : 0.3; // 70/30 split
      return {
        ...rec,
        budgetSplitPercentage: newPercentage,
        allocatedBudget: Math.round(totalBudget * newPercentage),
        justification: rec.justification + " (Performance-optimized allocation)"
      };
    });
    return newRecommendations;
  }
  
  // Fallback: return original if less than 2 platforms
  return originalRecommendations;
}

// API Routes
app.get('/api/options', (req, res) => {
  try {
    // Extract unique values from scenarios for form options
    const industries = [...new Set(scenarios.scenarios.flatMap(s => s.conditions.industry))];
    const marketingGoals = [...new Set(scenarios.scenarios.flatMap(s => s.conditions.marketingGoal))];
    const budgetTiers = [...new Set(scenarios.scenarios.map(s => s.conditions.budgetTier))];
    
    res.json({
      industries: industries.sort(),
      marketingGoals: marketingGoals.sort(),
      budgetTiers: budgetTiers.sort(),
      aiEnabled: aiService.isAIAvailable()
    });
  } catch (error) {
    console.error('Error getting options:', error);
    res.status(500).json({ error: 'Failed to get form options' });
  }
});

app.post('/api/generate-plan', async (req, res) => {
  try {
    const { industry, marketingGoal, budgetTier, totalBudget } = req.body;
    
    // Input validation
    if (!industry || !marketingGoal || !budgetTier || !totalBudget) {
      return res.status(400).json({ 
        error: 'Missing required fields: industry, marketingGoal, budgetTier, totalBudget' 
      });
    }
    
    if (totalBudget <= 0) {
      return res.status(400).json({ error: 'Total budget must be greater than 0' });
    }
    
    // Find matching scenarios (get multiple options)
    const matchingScenarios = scenarios.scenarios.filter(scenario => 
      matchScenario({ industry, marketingGoal, budgetTier }, scenario)
    );
    
    if (matchingScenarios.length === 0) {
      return res.status(404).json({ 
        error: 'No matching scenario found for the given criteria',
        availableOptions: {
          message: 'Try different combinations of industry, marketing goal, and budget tier'
        }
      });
    }
    
    // Generate media plan options (AI-enhanced if available)
    let mediaPlans;
    
    if (aiService.isAIAvailable()) {
      // Use AI to generate enhanced recommendations
      const baselineRecommendation = matchingScenarios[0].recommendation;
      mediaPlans = await aiService.generateEnhancedMediaPlan(
        { industry, marketingGoal, budgetTier, totalBudget },
        baselineRecommendation
      );
    } else {
      // Fallback to rule-based generation
      mediaPlans = generateTwoMediaPlanOptions(matchingScenarios, totalBudget, { industry, marketingGoal, budgetTier });
    }
    
    res.json({
      success: true,
      input: { industry, marketingGoal, budgetTier, totalBudget },
      mediaPlans,
      summary: {
        totalOptions: mediaPlans.length,
        primaryPlatforms: mediaPlans.map(plan => plan.primaryPlatform)
      }
    });
    
  } catch (error) {
    console.error('Error generating plan:', error);
    res.status(500).json({ error: 'Failed to generate media plan' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Media Plan Generator running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${scenarios.scenarios.length} scenarios`);
}); 