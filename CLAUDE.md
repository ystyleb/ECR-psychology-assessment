# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
ECR亲密关系经历量表 - A professional psychology assessment system for evaluating adult attachment patterns in romantic relationships. Optimized as a static website suitable for GitHub Pages deployment.

## Development Commands

### Local Development
```bash
# Start local server using Python
python -m http.server 8000

# Start local server using Node.js
npx serve

# Open project in browser
open http://localhost:8000
```

### Testing & Validation
- No formal linting - validate by opening `index.html` in browser
- Test completed assessments on local server
- Check responsiveness using browser dev tools

### Key Debug Functions
- Add `?action=debug` to URL to access debug functions
- Use browser console to test `debugCheckStatus()` for payment/system state
- Test `debugHistoryStatus()` to check report storage

## Architecture & Structure

### Core Application Flow
1. **Entry Points**: `index.html` - Main assessment interface
2. **Assessment Process**: 36-question ECR inventory with 7-point Likert scale
3. **Analysis**: Uses Brennan, Clark & Shaver (1998) standard methodology
4. **Results**: Calculates attachment anxiety and avoidance dimensions

### File Structure
- `index.html` - Primary assessment + detailed report interface
- `payment-success.html` - Post-payment handler with session verification
- `payment-cancel.html` - Payment cancellation flow handler
- `quadrant-comparison.html` - Attachment type visualization
- Static payment pages integrate with Stripe Payment Links

### Data Flow
1. User responds to 36 questions → Local calculation → Attachment classification
2. Free basic report displayed immediately
3. Paid detailed report unlocked via Stripe Payment Links integration
4. No backend servers - all processing client-side using localStorage

### Key Features
- **Static-only design** - Works with GitHub Pages, no server required
- **Payment system** - Stripe Payment Links integration for ¥19.90 report unlock
- **Data persistence** - LocalStorage for report history and payment state
- **Responsive design** - Full mobile/desktop compatibility
- **Report sharing** - Base64-encoded URL-based report saving

### Configuration Points
- `PAYMENT_CONFIG.paymentLinkBase` - Update with actual Stripe Payment Link
- Configurable success/cancel URLs for Stripe integration
- Report generation parameters in `generateFileName()` and related functions