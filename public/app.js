// App State
let formOptions = {};
let currentResults = null;
let selectedIndustry = '';
let selectedMarketingGoal = '';
let selectedSecondaryMarketingGoal = '';
let availableGoals = [];
let selectedPlatforms = [];

// Platform colors for visual consistency
const platformColors = {
    'Google': '#4285F4',
    'Meta': '#1877F2', 
    'LinkedIn': '#0A66C2',
    'TikTok': '#000000',
    'Xiaohongshu': '#FF2442'
};

// Industry-specific marketing goals mapping
const industryMarketingGoals = {
    'B2B Services': [
        'Lead Generation',
        'Brand Awareness',
        'Website Traffic',
        'Appointment Bookings',
        'Demo Requests',
        'White Paper Downloads',
        'Webinar Registrations',
        'Contact Form Submissions'
    ],
    'E-commerce': [
        'Online Sales',
        'Brand Awareness', 
        'Website Traffic',
        'Add to Cart',
        'Newsletter Signups',
        'Product Page Views',
        'Customer Retention',
        'Mobile App Downloads'
    ],
    'Education': [
        'Course Enrollments',
        'Lead Generation',
        'Brand Awareness',
        'Webinar Registrations',
        'Brochure Downloads',
        'Campus Visits',
        'Application Submissions',
        'Student Recruitment'
    ],
    'F&B': [
        'Online Orders',
        'Brand Awareness',
        'Store Visits',
        'Table Reservations',
        'Menu Downloads',
        'Delivery App Downloads',
        'Loyalty Program Signups',
        'Event Bookings'
    ],
    'Fashion & Apparel': [
        'Online Sales',
        'Brand Awareness',
        'Store Visits',
        'Catalog Downloads',
        'Newsletter Signups',
        'Lookbook Views',
        'Size Guide Downloads',
        'Style Consultation Bookings'
    ],
    'Health & Wellness': [
        'Appointment Bookings',
        'Lead Generation',
        'Brand Awareness',
        'Service Inquiries',
        'Health Assessment Downloads',
        'Consultation Requests',
        'Membership Signups',
        'Wellness Program Enrollments'
    ],
    'Real Estate': [
        'Property Inquiries',
        'Lead Generation',
        'Property Viewings',
        'Brochure Downloads',
        'Site Visits',
        'Valuation Requests',
        'Mortgage Consultations',
        'Investment Seminars'
    ],
    'Travel & Hospitality': [
        'Bookings',
        'Brand Awareness',
        'Booking Inquiries',
        'Brochure Downloads',
        'Package Inquiries',
        'Travel Guide Downloads',
        'Newsletter Signups',
        'Virtual Tour Views'
    ]
};

// Platform options for word cloud selection
const platformOptions = [
    { name: 'Meta', displayName: 'Meta (Facebook & Instagram)', color: '#1877F2', size: 'large' },
    { name: 'Google', displayName: 'Google Ads', color: '#4285F4', size: 'large' },
    { name: 'TikTok', displayName: 'TikTok Ads', color: '#FF0050', size: 'medium' },
    { name: 'LinkedIn', displayName: 'LinkedIn Ads', color: '#0A66C2', size: 'medium' },
    { name: 'Xiaohongshu', displayName: 'Xiaohongshu (Little Red Book)', color: '#FF2442', size: 'small' },
    { name: 'YouTube', displayName: 'YouTube Ads', color: '#FF0000', size: 'medium' },
    { name: 'Twitter', displayName: 'Twitter Ads', color: '#1DA1F2', size: 'small' },
    { name: 'Pinterest', displayName: 'Pinterest Ads', color: '#E60023', size: 'small' }
];

// DOM Elements
const elements = {
    form: document.getElementById('mediaForm'),
    industrySelect: document.getElementById('industry'),
    marketingGoalSelect: document.getElementById('marketingGoal'),
    secondaryMarketingGoalSelect: document.getElementById('secondaryMarketingGoal'),
    platformWordCloud: document.getElementById('platformWordCloud'),
    monthlyBudgetInput: document.getElementById('monthlyBudget'),
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
    createPlatformWordCloud();
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

    // Marketing goals will be populated dynamically based on industry selection
    // Keep the marketing goal selects disabled initially
    elements.marketingGoalSelect.disabled = true;
    elements.marketingGoalSelect.innerHTML = '<option value="">Select an industry first</option>';
    
    elements.secondaryMarketingGoalSelect.disabled = true;
    elements.secondaryMarketingGoalSelect.innerHTML = '<option value="">Select an industry first</option>';
}

// Create platform word cloud
function createPlatformWordCloud() {
    if (!elements.platformWordCloud) return;
    
    elements.platformWordCloud.innerHTML = '';
    
    platformOptions.forEach(platform => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `platform-tag ${platform.size}`;
        button.textContent = platform.displayName;
        button.style.borderColor = platform.color;
        button.style.color = platform.color;
        button.style.backgroundColor = 'transparent';
        
        button.addEventListener('click', () => handlePlatformToggle(platform.name));
        
        elements.platformWordCloud.appendChild(button);
    });
}

// Handle platform toggle
function handlePlatformToggle(platformName) {
    const platformOption = platformOptions.find(p => p.name === platformName);
    if (!platformOption) return;
    
    if (selectedPlatforms.includes(platformName)) {
        // Remove platform
        selectedPlatforms = selectedPlatforms.filter(p => p !== platformName);
    } else {
        // Add platform
        selectedPlatforms.push(platformName);
    }
    
    updatePlatformButtonStates();
    updateFormValidation();
}

// Update platform button visual states
function updatePlatformButtonStates() {
    const buttons = elements.platformWordCloud.querySelectorAll('.platform-tag');
    
    buttons.forEach(button => {
        const platformName = platformOptions.find(p => p.displayName === button.textContent)?.name;
        const platformOption = platformOptions.find(p => p.name === platformName);
        
        if (selectedPlatforms.includes(platformName)) {
            button.classList.add('selected');
            button.style.backgroundColor = platformOption.color;
            button.style.color = 'white';
        } else {
            button.classList.remove('selected');
            button.style.backgroundColor = 'transparent';
            button.style.color = platformOption.color;
        }
    });
}

// Attach event listeners
function attachEventListeners() {
    elements.form.addEventListener('submit', handleFormSubmit);
    elements.industrySelect.addEventListener('change', handleIndustryChange);
    elements.marketingGoalSelect.addEventListener('change', handleMarketingGoalChange);
    elements.secondaryMarketingGoalSelect.addEventListener('change', handleSecondaryMarketingGoalChange);
    
    // Update form validation on input changes
    [elements.industrySelect, elements.marketingGoalSelect, elements.secondaryMarketingGoalSelect, elements.monthlyBudgetInput]
        .forEach(element => {
            element.addEventListener('change', updateFormValidation);
            element.addEventListener('input', updateFormValidation);
        });
    
    // Initial form validation check
    updateFormValidation();
}

// Handle industry selection change
function handleIndustryChange(e) {
    selectedIndustry = e.target.value;
    availableGoals = industryMarketingGoals[selectedIndustry] || [];
    
    // Reset marketing goal selections
    selectedMarketingGoal = '';
    selectedSecondaryMarketingGoal = '';
    elements.marketingGoalSelect.value = '';
    elements.secondaryMarketingGoalSelect.value = '';
    
    // Update marketing goals dropdowns
    if (selectedIndustry) {
        // Primary marketing goal dropdown
        elements.marketingGoalSelect.disabled = false;
        elements.marketingGoalSelect.innerHTML = '<option value="">Choose your primary goal...</option>';
        
        // Secondary marketing goal dropdown
        elements.secondaryMarketingGoalSelect.disabled = false;
        elements.secondaryMarketingGoalSelect.innerHTML = '<option value="">Choose a secondary goal (optional)...</option>';
        
        availableGoals.forEach(goal => {
            // Add to primary dropdown
            const primaryOption = document.createElement('option');
            primaryOption.value = goal;
            primaryOption.textContent = goal;
            elements.marketingGoalSelect.appendChild(primaryOption);
            
            // Add to secondary dropdown
            const secondaryOption = document.createElement('option');
            secondaryOption.value = goal;
            secondaryOption.textContent = goal;
            elements.secondaryMarketingGoalSelect.appendChild(secondaryOption);
        });
        
        // Add smooth transition effect
        elements.marketingGoalSelect.parentElement.style.opacity = '0.7';
        elements.secondaryMarketingGoalSelect.parentElement.style.opacity = '0.7';
        setTimeout(() => {
            elements.marketingGoalSelect.parentElement.style.opacity = '1';
            elements.secondaryMarketingGoalSelect.parentElement.style.opacity = '1';
        }, 150);
    } else {
        elements.marketingGoalSelect.disabled = true;
        elements.marketingGoalSelect.innerHTML = '<option value="">Select an industry first</option>';
        elements.secondaryMarketingGoalSelect.disabled = true;
        elements.secondaryMarketingGoalSelect.innerHTML = '<option value="">Select an industry first</option>';
    }
    
    updateFormValidation();
}

// Handle marketing goal selection change
function handleMarketingGoalChange(e) {
    selectedMarketingGoal = e.target.value;
    updateFormValidation();
}

// Handle secondary marketing goal selection change
function handleSecondaryMarketingGoalChange(e) {
    selectedSecondaryMarketingGoal = e.target.value;
    updateFormValidation();
}

// Update form validation and button state
function updateFormValidation() {
    const industry = elements.industrySelect.value;
    const marketingGoal = elements.marketingGoalSelect.value;
    const monthlyBudget = elements.monthlyBudgetInput.value;
    
    const isFormValid = industry && marketingGoal && selectedPlatforms.length > 0 && monthlyBudget && 
                       parseInt(monthlyBudget) >= 500 && parseInt(monthlyBudget) <= 500000;
    
    elements.generateBtn.disabled = !isFormValid;
    
    // Update button appearance based on validation
    if (isFormValid) {
        elements.generateBtn.classList.remove('disabled');
    } else {
        elements.generateBtn.classList.add('disabled');
    }
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
            secondaryMarketingGoal: formData.get('secondaryMarketingGoal') || '',
            selectedPlatforms: selectedPlatforms,
            monthlyBudget: parseInt(formData.get('monthlyBudget').replace(/,/g, ''))
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
    if (!data.industry || !data.marketingGoal) {
        showError('Please fill in all required fields.');
        return false;
    }
    
    if (!data.selectedPlatforms || data.selectedPlatforms.length === 0) {
        showError('Please select at least one advertising platform.');
        return false;
    }
    
    if (!data.monthlyBudget || data.monthlyBudget < 500) {
        showError('Please enter a budget amount of at least MYR 500.');
        return false;
    }
    
    if (data.monthlyBudget > 500000) {
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
            <div class="summary-label">Monthly Budget</div>
            <div class="summary-value">MYR ${input.monthlyBudget.toLocaleString()}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Media Plan Options</div>
            <div class="summary-value">${summary.totalOptions}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Selected Platforms</div>
            <div class="summary-value">${input.selectedPlatforms.join(', ')}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Industry</div>
            <div class="summary-value">${input.industry}</div>
        </div>
        ${input.secondaryMarketingGoal ? `
        <div class="summary-item">
            <div class="summary-label">Secondary Goal</div>
            <div class="summary-value">${input.secondaryMarketingGoal}</div>
        </div>
        ` : ''}
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