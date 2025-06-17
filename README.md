# 🎯 AI Media Plan Generator

A sophisticated web application that generates intelligent media plan recommendations for digital marketing campaigns, specifically tailored for the Malaysian market. Built with Node.js, Express, and Google Gemini AI integration.

![AI Media Plan Generator](https://img.shields.io/badge/AI-Powered-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🤖 AI-Enhanced Recommendations
- **Google Gemini AI Integration**: Provides contextual, market-aware media plan suggestions
- **Malaysian Market Focus**: Optimized recommendations for Malaysian digital advertising landscape
- **Dual Strategy Options**: Generates two strategic approaches per campaign for comparison

### 📊 Comprehensive Platform Coverage
- **Meta (Facebook & Instagram)**: Advanced targeting and visual advertising
- **Google Ads**: Search, Display, and Shopping campaigns
- **LinkedIn**: B2B and professional targeting
- **TikTok**: Gen Z and Millennial engagement
- **Xiaohongshu (Little Red Book)**: Growing Malaysian market presence

### 💰 Budget Management
- **Malaysian Ringgit (MYR) Support**: Native currency formatting and calculations
- **Flexible Budget Tiers**: Low (500-5,000), Medium (5,001-50,000), High (50,001-500,000)
- **Intelligent Allocation**: AI-driven budget distribution across platforms

### 🎨 Modern User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Charts**: Visual budget allocation representations
- **Gradient UI**: Modern purple gradient design with smooth animations
- **Real-time Results**: Instant media plan generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key (optional but recommended for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zsaaad/TG-AI-Media-Plan-Generator.git
   cd TG-AI-Media-Plan-Generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (Optional - for AI features)
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Gemini API key:
   # GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google Gemini AI Configuration (Optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file
4. Restart the server

## 📱 Usage

### Basic Campaign Creation

1. **Select Industry**: Choose from 8+ industry categories
   - B2B Services
   - E-commerce
   - Education
   - Fashion & Apparel
   - F&B (Food & Beverage)
   - Health & Wellness
   - Real Estate
   - Travel & Hospitality

2. **Define Marketing Goal**
   - Lead Generation
   - Sales/Conversions
   - Brand Awareness
   - Website Traffic

3. **Set Budget Parameters**
   - Choose budget tier (Low/Medium/High)
   - Enter specific budget amount in MYR

4. **Generate Media Plan**
   - Click "Generate AI-Enhanced Media Plan"
   - Review two strategic options
   - Compare budget allocations and platform recommendations

### Example Output

```json
{
  "success": true,
  "mediaPlans": [
    {
      "optionName": "Multi-Channel Lead Generation",
      "description": "Balanced approach across multiple platforms",
      "strategy": "ai-enhanced",
      "recommendations": [
        {
          "platform": "Meta",
          "budgetSplitPercentage": 0.4,
          "allocatedBudget": 2000,
          "recommendedObjective": "Lead Generation Forms",
          "justification": "Meta's advanced targeting..."
        }
      ]
    }
  ]
}
```

## 🏗️ Architecture

### Backend Structure
```
├── server.js              # Main Express server
├── ai-service.js          # Google Gemini AI integration
├── data/
│   └── scenarios.json     # Marketing scenarios database
├── public/
│   ├── index.html        # Frontend interface
│   ├── style.css         # Styling and animations
│   └── script.js         # Client-side logic
└── package.json          # Dependencies and scripts
```

### Key Components

- **Express Server**: RESTful API endpoints for media plan generation
- **AI Service**: Google Gemini integration with Malaysian market context
- **Scenario Engine**: Rule-based matching system with 20+ predefined scenarios
- **Budget Calculator**: Intelligent allocation algorithms
- **Frontend**: Vanilla JavaScript SPA with modern UI/UX

## 🔌 API Endpoints

### GET `/api/options`
Returns available form options and AI availability status.

### POST `/api/generate-plan`
Generates media plan recommendations.

**Request Body:**
```json
{
  "industry": "Education",
  "marketingGoal": "Lead Generation",
  "budgetTier": "Medium",
  "totalBudget": 5000
}
```

### GET `/api/health`
Health check endpoint for monitoring.

## 🧪 Development

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent recommendations
- **Malaysian Digital Marketing Community** for market insights
- **Open Source Contributors** for various dependencies

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/zsaaad/TG-AI-Media-Plan-Generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/zsaaad/TG-AI-Media-Plan-Generator/discussions)

---

**Built with ❤️ for the Malaysian digital marketing community** 