// App State
let formOptions = {};
let currentResults = null;

// Platform colors for visual consistency
const platformColors = {
    'Google': '#4285F4',
    'Meta': '#1877F2', 
    'LinkedIn': '#0A66C2',
    'TikTok': '#000000',
    'Xiaohongshu': '#FF2442'
};

// DOM Elements
const elements = {
    form: document.getElementById('mediaForm'),
    industrySelect: document.getElementById('industry'),
    marketingGoalSelect: document.getElementById('marketingGoal'),
    budgetTierSelect: document.getElementById('budgetTier'),
    totalBudgetInput: document.getElementById('totalBudget'),
    generateBtn: document.getElementById('generateBtn'),
    spinner: document.getElementById('spinner'),
    resultsSection: document.getElementById('resultsSection'),
    errorSection: document.getElementById('errorSection'),
    resultsSummary: document.getElementById('resultsSummary'),
    platformsGrid: document.getElementById('platformsGrid'),
    budgetChart: document.getElementById('budgetChart'),
    chartLegend: document.getElementById('chartLegend'),
    errorMessage: document.getElementById('errorMessage')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadFormOptions();
    attachEventListeners();
});

// Load form options from API
async function loadFormOptions() {
    try {
        const response = await fetch('/api/options');
        if (!response.ok) throw new Error('Failed to load options');
        
        formOptions = await response.json();
        populateSelectOptions();
        updateAIStatus(formOptions.aiEnabled);
    } catch (error) {
        console.error('Error loading form options:', error);
        showError('Failed to load form options. Please refresh the page.');
    }
}

// Populate select elements with options
function populateSelectOptions() {
    // Populate industries
    formOptions.industries.forEach(industry => {
        const option = document.createElement('option');
        option.value = industry;
        option.textContent = industry;
        elements.industrySelect.appendChild(option);
    });

    // Populate marketing goals
    formOptions.marketingGoals.forEach(goal => {
        const option = document.createElement('option');
        option.value = goal;
        option.textContent = goal;
        elements.marketingGoalSelect.appendChild(option);
    });

    // Populate budget tiers
    formOptions.budgetTiers.forEach(tier => {
        const option = document.createElement('option');
        option.value = tier;
        option.textContent = tier;
        elements.budgetTierSelect.appendChild(option);
    });
}

// Attach event listeners
function attachEventListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
    
    // Removed budget input formatting to avoid conflicts with HTML5 number validation
}

// Budget input formatting removed to avoid HTML5 number input conflicts

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Show loading state
    setLoadingState(true);
    hideResults();
    hideError();
    
    try {
        // Get form data
        const formData = new FormData(elements.form);
        const requestData = {
            industry: formData.get('industry'),
            marketingGoal: formData.get('marketingGoal'),
            budgetTier: formData.get('budgetTier'),
            totalBudget: parseInt(formData.get('totalBudget').replace(/,/g, ''))
        };
        
        // Validate data
        if (!validateFormData(requestData)) {
            setLoadingState(false);
            return;
        }
        
        // Make API call
        const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentResults = data;
            displayResults(data);
        } else {
            throw new Error(data.error || 'Failed to generate media plan');
        }
        
    } catch (error) {
        console.error('Error generating plan:', error);
        showError(error.message);
    } finally {
        setLoadingState(false);
    }
}

// Validate form data
function validateFormData(data) {
    if (!data.industry || !data.marketingGoal || !data.budgetTier) {
        showError('Please fill in all required fields.');
        return false;
    }
    
    if (!data.totalBudget || data.totalBudget < 500) {
        showError('Please enter a budget amount of at least MYR 500.');
        return false;
    }
    
    if (data.totalBudget > 500000) {
        showError('Please enter a budget amount not exceeding MYR 500,000.');
        return false;
    }
    
    return true;
}

// Set loading state
function setLoadingState(loading) {
    if (loading) {
        elements.generateBtn.classList.add('loading');
        elements.generateBtn.disabled = true;
        elements.spinner.style.display = 'block';
    } else {
        elements.generateBtn.classList.remove('loading');
        elements.generateBtn.disabled = false;
        elements.spinner.style.display = 'none';
    }
}

// Display results
function displayResults(data) {
    const { input, mediaPlans, summary } = data;
    
    // Update summary
    elements.resultsSummary.innerHTML = `
        <div class="summary-item">
            <div class="summary-label">Total Budget</div>
            <div class="summary-value">MYR ${input.totalBudget.toLocaleString()}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Media Plan Options</div>
            <div class="summary-value">${summary.totalOptions}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Primary Platforms</div>
            <div class="summary-value">${summary.primaryPlatforms.join(', ')}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Industry</div>
            <div class="summary-value">${input.industry}</div>
        </div>
    `;
    
    // Display media plan options
    elements.platformsGrid.innerHTML = mediaPlans
        .map((plan, index) => createMediaPlanCard(plan, index))
        .join('');
    
    // Create budget charts for both options
    createBudgetChartsForOptions(mediaPlans);
    
    // Show results section
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.classList.add('fade-in');
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Create media plan option card HTML
function createMediaPlanCard(mediaPlan, index) {
    const optionNumber = index + 1;
    const strategyClass = mediaPlan.strategy || 'default';
    
    return `
        <div class="media-plan-option">
            <div class="option-header">
                <div class="option-badge">Option ${optionNumber}</div>
                <h3 class="option-title">${mediaPlan.optionName}</h3>
                <p class="option-description">${mediaPlan.description}</p>
                <div class="option-stats">
                    <span class="stat"><strong>${mediaPlan.totalPlatforms}</strong> platforms</span>
                    <span class="stat"><strong>MYR ${mediaPlan.totalAllocated.toLocaleString()}</strong> total</span>
                    <span class="stat">Focus: <strong>${mediaPlan.primaryPlatform}</strong></span>
                </div>
            </div>
            
            <div class="platforms-container">
                ${mediaPlan.recommendations
                    .sort((a, b) => b.budgetSplitPercentage - a.budgetSplitPercentage)
                    .map(platform => createPlatformCard(platform))
                    .join('')}
            </div>
            
            <div class="option-chart">
                <div class="chart-title">Budget Distribution - Option ${optionNumber}</div>
                <div class="budget-chart" id="chart-option-${index}"></div>
                <div class="chart-legend" id="legend-option-${index}"></div>
            </div>
        </div>
    `;
}

// Create platform card HTML (updated for use within media plans)
function createPlatformCard(platform) {
    const platformClass = platform.platform.toLowerCase().replace(/\s+/g, '');
    const percentage = Math.round(platform.budgetSplitPercentage * 100);
    
    return `
        <div class="platform-card platform-${platformClass}">
            <div class="platform-header">
                <div>
                    <h4 class="platform-name">${platform.platform}</h4>
                    <p class="platform-objective">${platform.recommendedObjective}</p>
                </div>
                <div class="platform-budget">
                    <span class="budget-amount">MYR ${platform.allocatedBudget.toLocaleString()}</span>
                    <span class="budget-percentage">${percentage}%</span>
                </div>
            </div>
            <div class="platform-justification">
                ${platform.justification}
            </div>
        </div>
    `;
}

// Create budget charts for both media plan options
function createBudgetChartsForOptions(mediaPlans) {
    mediaPlans.forEach((plan, index) => {
        const chartElement = document.getElementById(`chart-option-${index}`);
        const legendElement = document.getElementById(`legend-option-${index}`);
        
        if (chartElement && legendElement) {
            createIndividualBudgetChart(plan.recommendations, chartElement, legendElement);
        }
    });
}

// Create individual budget chart
function createIndividualBudgetChart(recommendations, chartElement, legendElement) {
    // Sort by budget percentage for consistent display
    const sortedRecommendations = recommendations.sort((a, b) => 
        b.budgetSplitPercentage - a.budgetSplitPercentage
    );
    
    // Create chart segments
    chartElement.innerHTML = sortedRecommendations
        .map(platform => {
            const percentage = platform.budgetSplitPercentage * 100;
            const color = platformColors[platform.platform] || '#6B7280';
            
            return `
                <div class="chart-segment" 
                     style="width: ${percentage}%; background-color: ${color};"
                     title="${platform.platform}: ${Math.round(percentage)}%">
                </div>
            `;
        })
        .join('');
    
    // Create legend
    legendElement.innerHTML = sortedRecommendations
        .map(platform => {
            const percentage = Math.round(platform.budgetSplitPercentage * 100);
            const color = platformColors[platform.platform] || '#6B7280';
            
            return `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${color};"></div>
                    <span>${platform.platform} (${percentage}%)</span>
                </div>
            `;
        })
        .join('');
}

// Show error
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorSection.style.display = 'block';
    elements.errorSection.classList.add('fade-in');
    elements.errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hide error
function hideError() {
    elements.errorSection.style.display = 'none';
    elements.errorSection.classList.remove('fade-in');
}

// Hide results
function hideResults() {
    elements.resultsSection.style.display = 'none';
    elements.resultsSection.classList.remove('fade-in');
}

// Reset form (called from error section button)
function resetForm() {
    elements.form.reset();
    hideError();
    hideResults();
    elements.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update AI status indicator
function updateAIStatus(aiEnabled) {
    const generateBtn = elements.generateBtn;
    const btnText = generateBtn.querySelector('.btn-text');
    
    if (aiEnabled) {
        btnText.textContent = '🤖 Generate AI-Enhanced Media Plan';
        generateBtn.title = 'Powered by Google Gemini AI';
    } else {
        btnText.textContent = 'Generate Media Plan';
        generateBtn.title = 'Using rule-based recommendations';
    }
}

// Export for global access
window.resetForm = resetForm; 