const fs = require('fs');
const path = require('path');

class PDFService {
    constructor() {
        this.platformColors = {
            'Meta': '#1877F2',
            'Google': '#4285F4',
            'TikTok': '#FF0050',
            'LinkedIn': '#0A66C2',
            'Xiaohongshu': '#FF2442',
            'YouTube': '#FF0000',
            'Twitter': '#1DA1F2',
            'Pinterest': '#E60023'
        };
    }

    generateHTML(data) {
        const { input, selectedPlan, planIndex } = data;
        const formattedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const platformColors = this.platformColors;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Toggle Media Plan - Option ${planIndex}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        
        .date {
            color: #6b7280;
            font-size: 14px;
        }
        
        .summary {
            background: #f8fafc;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 32px;
            border-left: 4px solid #3b82f6;
        }
        
        .summary h2 {
            color: #1f2937;
            margin-bottom: 16px;
            font-size: 20px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
        
        .summary-item {
            display: flex;
            flex-direction: column;
        }
        
        .summary-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        
        .summary-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
        }
        
        .plan-overview {
            margin-bottom: 32px;
        }
        
        .plan-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .plan-description {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 20px;
        }
        
        .plan-stats {
            display: flex;
            gap: 24px;
            margin-bottom: 24px;
        }
        
        .stat {
            text-align: center;
            padding: 16px;
            background: #f1f5f9;
            border-radius: 8px;
            flex: 1;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            display: block;
        }
        
        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .platforms {
            margin-bottom: 32px;
        }
        
        .platforms h3 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #1f2937;
        }
        
        .platform {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .platform-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        
        .platform-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .platform-objective {
            color: #6b7280;
            font-size: 14px;
        }
        
        .platform-budget {
            text-align: right;
        }
        
        .budget-amount {
            display: block;
            font-size: 20px;
            font-weight: bold;
            color: #059669;
        }
        
        .budget-percentage {
            font-size: 14px;
            color: #6b7280;
        }
        
        .platform-justification {
            color: #4b5563;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .budget-chart {
            margin-top: 32px;
        }
        
        .chart-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 16px;
            color: #1f2937;
        }
        
        .chart-bar {
            height: 40px;
            border-radius: 6px;
            display: flex;
            overflow: hidden;
            margin-bottom: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .chart-segment {
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 12px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .legend {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
        
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        @media print {
            body { padding: 20px; }
            .header { margin-bottom: 20px; }
            .summary, .platforms { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">toggle Media Plan Generator</div>
        <div class="date">Generated on ${formattedDate}</div>
    </div>
    
    <div class="summary">
        <h2>Campaign Summary</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Industry</div>
                <div class="summary-value">${input.industry}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Primary Goal</div>
                <div class="summary-value">${input.marketingGoal}</div>
            </div>
            ${input.secondaryMarketingGoal ? `
            <div class="summary-item">
                <div class="summary-label">Secondary Goal</div>
                <div class="summary-value">${input.secondaryMarketingGoal}</div>
            </div>
            ` : ''}
            <div class="summary-item">
                <div class="summary-label">Monthly Budget</div>
                <div class="summary-value">MYR ${input.monthlyBudget.toLocaleString()}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Selected Platforms</div>
                <div class="summary-value">${input.selectedPlatforms.join(', ')}</div>
            </div>
        </div>
    </div>
    
    <div class="plan-overview">
        <h1 class="plan-title">${selectedPlan.optionName}</h1>
        <p class="plan-description">${selectedPlan.description}</p>
        
        <div class="plan-stats">
            <div class="stat">
                <span class="stat-number">${selectedPlan.totalPlatforms}</span>
                <span class="stat-label">Platforms</span>
            </div>
            <div class="stat">
                <span class="stat-number">MYR ${selectedPlan.totalAllocated.toLocaleString()}</span>
                <span class="stat-label">Total Budget</span>
            </div>
            <div class="stat">
                <span class="stat-number">${selectedPlan.primaryPlatform}</span>
                <span class="stat-label">Primary Focus</span>
            </div>
        </div>
    </div>
    
         <div class="platforms">
         <h3>Platform Breakdown</h3>
         ${selectedPlan.recommendations
             .sort((a, b) => b.budgetSplitPercentage - a.budgetSplitPercentage)
             .map(platform => {
                 const percentage = Math.round(platform.budgetSplitPercentage * 100);
                 const color = platformColors[platform.platform] || '#6B7280';
                
                return `
                <div class="platform">
                    <div class="platform-header">
                        <div>
                            <div class="platform-name" style="color: ${color};">${platform.platform}</div>
                            <div class="platform-objective">${platform.recommendedObjective}</div>
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
            }).join('')}
    </div>
    
    <div class="budget-chart">
        <div class="chart-title">Budget Distribution</div>
        <div class="chart-bar">
                         ${selectedPlan.recommendations
                 .sort((a, b) => b.budgetSplitPercentage - a.budgetSplitPercentage)
                 .map(platform => {
                     const percentage = platform.budgetSplitPercentage * 100;
                     const color = platformColors[platform.platform] || '#6B7280';
                    
                    return `<div class="chart-segment" style="width: ${percentage}%; background-color: ${color};">
                        ${percentage >= 10 ? `${Math.round(percentage)}%` : ''}
                    </div>`;
                }).join('')}
        </div>
        <div class="legend">
                         ${selectedPlan.recommendations
                 .sort((a, b) => b.budgetSplitPercentage - a.budgetSplitPercentage)
                 .map(platform => {
                     const percentage = Math.round(platform.budgetSplitPercentage * 100);
                     const color = platformColors[platform.platform] || '#6B7280';
                    
                    return `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: ${color};"></div>
                        <span>${platform.platform} (${percentage}%)</span>
                    </div>
                    `;
                }).join('')}
        </div>
    </div>
    
    <div class="footer">
        <p>Generated by Toggle Media Plan Generator</p>
        <p>This report provides strategic recommendations based on your campaign requirements.</p>
    </div>
</body>
</html>
        `;
    }

    // For now, we'll return HTML content that can be printed as PDF by the browser
    // This is a simple fallback until we can install proper PDF libraries
    async generatePDF(data) {
        const html = this.generateHTML(data);
        return html;
    }
}

module.exports = new PDFService(); 