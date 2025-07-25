# Create Hedera AI Agent

A CLI tool to generate AI agent projects with Hedera integration. Quickly scaffold AI agents that can interact with Hedera's services.

## 🚀 Quick Start

### For Users

```bash
# Run the CLI
npx tsx /path/to/create-hedera-agent-app-package/src/index.ts

# Follow the prompts:
# 1. Enter your app name
# 2. Select Hedera services (HAM, HTS, HCS, HSCS)
```

### For Developers

```bash
# Clone and setup
cd create-hedera-agent-app-package
npm install

# Test locally
npx tsx src/index.ts
```

## ✨ Features

- **🎯 Service Selection**: Choose which Hedera services to include

  - HAM (Hedera Account Management)
  - HTS (Hedera Token Service)
  - HCS (Hedera Consensus Service)
  - HSCS (Hedera Smart Contract Service)

- **🔧 Environment Setup**: Comprehensive `.env` files with placeholders
- **📁 Project Structure**: Next.js app with service-specific directories
- **📦 Dependencies**: Automatic installation of required packages
- **📚 Documentation**: Custom README with setup instructions

## 📁 Generated Project Structure

```
my-ai-agent/
├── src/
│   ├── app/                    # Next.js app directory
│   └── services/               # Hedera service implementations
│       ├── ham/                # Account Management
│       ├── hts/                # Token Service
│       ├── hcs/                # Consensus Service
│       └── hscs/               # Smart Contract Service
├── .env                        # Environment variables
├── .env.example               # Environment template
├── package.json               # Project configuration
└── README.md                  # Project documentation
```

## 🔧 Environment Variables

The CLI generates comprehensive environment files with placeholders for:

### Hedera Configuration

- Network settings (testnet/mainnet)
- Account credentials
- Node configuration

### AI/LLM Services

- OpenAI API keys
- Anthropic API keys
- Google AI API keys
- LangChain configuration

### Service-Specific Variables

- Token service configuration
- Consensus service topics
- Smart contract settings
- Account management parameters

## 🛠️ Development

### Prerequisites

- Node.js v18+
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Run in development
npm start

# Build for production
npm run build
```

### Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing instructions.

## 📖 Documentation

- [Developer Notes](./DEVELOPER_NOTES.md) - Comprehensive development guide
- [Testing Guide](./TESTING_GUIDE.md) - Quick testing instructions

## 🎯 Next Steps

After generating your project:

1. **Configure Environment**:

   ```bash
   cd my-ai-agent
   # Edit .env with your actual credentials
   ```

2. **Start Development**:

   ```bash
   npm run dev
   ```

3. **Build Your AI Agent**:
   - Implement service methods in `src/services/`
   - Add AI logic using the configured APIs
   - Deploy to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (see testing guide)
5. Submit a pull request

## 📄 License

ISC License

## 🆘 Support

For issues or questions:

1. Check the [Developer Notes](./DEVELOPER_NOTES.md)
2. Review the [Testing Guide](./TESTING_GUIDE.md)
3. Test with different service combinations

---

**Status**: ✅ Ready for use
**Version**: 1.0.0
**Last Updated**: July 25, 2024
