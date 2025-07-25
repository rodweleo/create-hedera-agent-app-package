# Hedera AI Agent CLI - Developer Notes

## 🚀 Overview

This CLI tool (`create-hedera-agent-app-package`) generates AI agent projects with Hedera integration. It clones the starter app template and customizes it based on selected Hedera services.

## 📁 Project Structure

```
hedera_Agent_Starter_Kit_project/
├── create-hedera-agent-app-package/     # CLI Tool (this directory)
├── create-hedera-agent-starter-app/     # Template to be cloned
├── hedera-tools/                        # Supporting utilities
└── test-cli/                           # Test directory (can be deleted)
```

## 🛠️ Development Setup

### Prerequisites

- Node.js v18+ (tested with v22.16.0)
- npm or yarn
- Git

### Installation

```bash
cd create-hedera-agent-app-package
npm install
```

### Building the CLI

```bash
npm run build
```

### Running in Development

```bash
npm start
# or
npx tsx src/index.ts
```

## 🧪 Testing the CLI

### Local Testing

1. Create a test directory outside the project:

```bash
mkdir ~/test-hedera-cli
cd ~/test-hedera-cli
```

2. Run the CLI:

```bash
npx tsx /path/to/create-hedera-agent-app-package/src/index.ts
```

3. Follow the prompts:
   - Enter app name (e.g., "my-ai-agent")
   - Select services (HAM, HTS, HCS, HSCS)

### Expected Output

The CLI should:

- ✅ Copy the starter app template
- ✅ Create service directories based on selection
- ✅ Generate `.env` and `.env.example` files
- ✅ Update `package.json` with project name
- ✅ Create custom `README.md`
- ✅ Install dependencies automatically
- ✅ Provide next steps instructions

### Verification Checklist

- [ ] Project directory created with selected name
- [ ] Next.js app structure intact
- [ ] Service directories created in `src/services/`
- [ ] Environment files generated with placeholders
- [ ] Dependencies installed successfully
- [ ] Can run `npm run dev` without errors

## 🔧 How It Works

### 1. User Interaction

- Prompts for app name
- Multi-select for Hedera services (HAM, HTS, HCS, HSCS)

### 2. Template Copying

- Copies `create-hedera-agent-starter-app` directory
- Removes `.git` directory for fresh start

### 3. Service Customization

- Creates `src/services/` directory structure
- Generates service-specific TypeScript files
- Creates index files for easy imports

### 4. Environment Generation

- Base environment variables (Hedera, AI, LangChain)
- Service-specific variables based on selection
- Both `.env` and `.env.example` files

### 5. Project Customization

- Updates `package.json` name and description
- Creates project-specific `README.md`
- Installs dependencies

## 📝 Key Files

### `src/index.ts`

- Main CLI entry point
- Handles user interaction and project generation
- Orchestrates the entire process

### `package.json`

- CLI configuration and dependencies
- Bin configuration for global installation

### Service Templates

Generated in `src/services/{service}/`:

- `{service}.service.ts` - Service implementation
- `index.ts` - Export file

## 🔄 Development Workflow

### Making Changes

1. Edit `src/index.ts`
2. Test locally: `npx tsx src/index.ts`
3. Build: `npm run build`
4. Test built version: `node dist/index.js`

### Adding New Services

1. Add to `SERVICE_OPTIONS` array
2. Add service-specific env vars in `generateEnvContent()`
3. Test with new service selection

### Updating Environment Variables

Modify the `generateEnvContent()` function to add/remove variables.

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module 'fs-extra'"**

```bash
npm install
```

**"Repository not found" error**

- Ensure `STARTER_APP_PATH` points to correct local directory
- Check that `create-hedera-agent-starter-app` exists

**TypeScript compilation errors**

```bash
npm run build
# Check for type errors in output
```

**Permission errors**

```bash
chmod +x dist/index.js
```

### Debug Mode

Add console.log statements in `src/index.ts` for debugging:

```typescript
console.log("Debug:", { targetDir, services, STARTER_APP_PATH });
```

## 📦 Publishing

### Local Testing

```bash
npm link
create-hedera-agent my-test-app
```

### Global Installation

```bash
npm install -g .
create-hedera-agent my-test-app
```

### Publishing to npm

```bash
npm publish
```

## 🤝 Team Collaboration

### Code Review Checklist

- [ ] CLI handles all service combinations
- [ ] Environment variables are comprehensive
- [ ] Error handling is robust
- [ ] User experience is smooth
- [ ] Generated projects are functional

### Testing Matrix

Test with different combinations:

- [ ] Single service (HAM only)
- [ ] Multiple services (HAM + HTS)
- [ ] All services (HAM + HTS + HCS + HSCS)
- [ ] Edge cases (empty name, invalid characters)

### Documentation Updates

- Update this file when making changes
- Update README.md for end users
- Update package.json description if needed

## 🎯 Next Steps

### Potential Enhancements

1. **Service Templates**: Pre-built templates for common AI agent patterns
2. **Environment Management**: Testnet → Mainnet migration utilities
3. **Dependency Management**: Version compatibility checks
4. **Interactive Setup**: Guided setup for Hedera credentials
5. **Validation**: Input validation and error recovery

### Integration with hedera-tools

- Import actual Hedera service implementations
- Include sample AI agent patterns
- Add testing utilities

## 📞 Support

For issues or questions:

1. Check this developer notes
2. Review the generated project structure
3. Test with different service combinations
4. Check console output for error messages

---

**Last Updated**: July 25, 2024
**Version**: 1.0.0
**Status**: ✅ Ready for testing
