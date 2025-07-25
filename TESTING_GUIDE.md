# Quick Testing Guide

## 🚀 Fast Test (5 minutes)

### 1. Setup

```bash
cd create-hedera-agent-app-package
npm install
```

### 2. Test CLI

```bash
# Create a test directory
mkdir ~/quick-test
cd ~/quick-test

# Run the CLI
npx tsx /path/to/create-hedera-agent-app-package/src/index.ts
```

### 3. Test Inputs

- **App Name**: `test-agent`
- **Services**: Select any combination (HAM, HTS, HCS, HSCS)

### 4. Verify Output

Check that these files/directories exist:

```
test-agent/
├── src/services/          # Service directories
├── .env                   # Environment file
├── .env.example          # Environment template
├── package.json          # Updated with project name
├── README.md             # Custom documentation
└── node_modules/         # Dependencies installed
```

### 5. Test Generated Project

```bash
cd test-agent
npm run dev
# Should start Next.js dev server without errors
```

## ✅ Success Criteria

- [ ] CLI runs without errors
- [ ] Project directory created
- [ ] Service directories match selection
- [ ] Environment files contain placeholders
- [ ] Dependencies install successfully
- [ ] `npm run dev` works

## 🐛 If Issues Occur

1. **Dependencies missing**: `npm install` in CLI directory
2. **Path issues**: Check `STARTER_APP_PATH` in `src/index.ts`
3. **Permission errors**: Check file permissions
4. **TypeScript errors**: Run `npm run build` to see details

## 📝 Test Different Scenarios

### Single Service

- Select only HAM
- Verify only `src/services/ham/` created

### Multiple Services

- Select HAM + HTS + HCS
- Verify all three service directories created

### All Services

- Select all four services
- Verify complete environment file generated

## 🎯 Ready for Team Testing!

The CLI is functional and ready for other developers to test and provide feedback.
