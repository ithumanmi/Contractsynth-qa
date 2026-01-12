# ContractSynth QA - File Summary

## Root Configuration Files

### `package.json`
- **Purpose**: NPM package configuration and dependencies
- **Key Dependencies**: React 19.2.3, React DOM, Lucide React icons
- **Scripts**: `dev` (Vite dev server), `build` (production build), `preview` (preview build)

### `vite.config.ts`
- **Purpose**: Vite build tool configuration
- **Features**: 
  - React plugin integration
  - Environment variable injection (OPENAI_API_KEY, OPENAI_MODEL, OPENAI_BASE_URL)
  - Server config (port 3000, host 0.0.0.0)
  - Path alias `@` for root directory

### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Settings**: ES2022 target, ESNext modules, React JSX, path aliases

### `.env`
- **Purpose**: Environment variables
- **Variables**: OPENAI_API_KEY, OPENAI_MODEL, OPENAI_BASE_URL

## Entry Point Files

### `index.html`
- **Purpose**: HTML entry point
- **Features**: 
  - Tailwind CSS CDN
  - Google Fonts (Inter, JetBrains Mono)
  - Import map for React dependencies
  - html2pdf.js library for PDF export
  - Root div for React mounting

### `index.tsx`
- **Purpose**: React application entry point
- **Function**: Mounts App component to root element with StrictMode

### `index.css`
- **Purpose**: Global CSS styles
- **Styles**: Reset, body font, root container sizing

## Core Application Files

### `App.tsx`
- **Purpose**: Main application component
- **Features**:
  - State management for config, results, loading, errors
  - Orchestrates data generation workflow:
    1. Generate faker data (deterministic)
    2. Call OpenAI API for contract generation
    3. Display results in dashboard
  - UI layout: Sidebar (ConfigPanel) + Main content (ResultDashboard)
  - Error handling and display

## Type Definitions

### `types.ts`
- **Purpose**: TypeScript type definitions
- **Exports**:
  - `MutationCode`: Enum of 11 mutation types (E01-E21)
  - `MutationDef`: Mutation definition interface
  - `GeneratorConfig`: Configuration for contract generation
  - `ParsedResponse`: AI response structure
  - `CompanyInfo`: Company data structure
  - `PaymentPhase`: Payment phase information
  - `FakerData`: Generated synthetic data structure

## Constants & Configuration

### `constants.ts`
- **Purpose**: Application constants and system instructions
- **Exports**:

#### `MUTATIONS` (Array of 11 Mutation Definitions)
Mutation categories: **Formatting** (6), **Logic** (2), **Content** (3)

1. **E01** - Mơ hồ ngày tháng (Ambiguous Date) [Formatting]
   - Formats dates as 01/02/2025 causing day/month confusion

2. **E02** - Sai lệch VAT (VAT Mismatch) [Logic]
   - Text states "VAT 10%" but calculation uses 8%

3. **E03** - Sai đơn vị tiền tệ (Currency Mix) [Content]
   - Symbol is '₫' but text says "Đô la Mỹ"

4. **E04** - Nhiễu OCR (OCR Noise) [Formatting]
   - Character errors: l→1, O→0, S→5 in numbers

5. **E05** - Thiếu dòng Tổng (Missing Total) [Formatting]
   - Removes "Tổng cộng" line from price table

6. **E06** - Sai số học (Bad Arithmetic) [Logic]
   - Amount = Quantity × Rate but calculation is wrong

7. **E10** - Mâu thuẫn điều khoản (Conflicting Terms) [Content]
   - Header says "Thanh toán ngay", footer says "Net 30"

8. **E15** - Vỡ bảng (Table Degradation) [Formatting]
   - Converts table rows to list format text

9. **E20** - Bố cục lộn xộn (Layout Chaos) [Formatting]
   - Inserts random page breaks in value tables

10. **E21** - Thanh toán nhiều giai đoạn (Multi-phase Payment) [Content]
    - Splits payment into 2-6 phases (P1..Pn) with specific conditions

#### `CONTRACT_TYPES`
- Array: `["Hợp đồng dịch vụ", "Thỏa thuận hợp tác", "Đơn đặt hàng"]`
- Used in ConfigPanel dropdown

#### `LOCALES`
- Array: `["vi_VN"]`
- Currently supports Vietnamese locale only

#### `SYSTEM_INSTRUCTION` (132 lines)
Comprehensive prompt template for OpenAI API with 5 main sections:

**Section 1: AN TOÀN & TUÂN THỦ (Safety & Compliance)**
- PII protection: Only use data from VARS_JSON, no real personal info
- Watermark requirement: Must start OBSERVED_TEXT with "*** DỮ LIỆU THỬ NGHIỆM TỔNG HỢP – KHÔNG CÓ GIÁ TRỊ PHÁP LÝ ***"
- Refusal policy: Reject creating fraudulent documents

**Section 2: TÍNH XÁC ĐỊNH & KIỂM SOÁT (Determinism & Control)**
- VARS_JSON: Must use exact input values (company names, tax IDs, amounts)
- TRUTH_INTENDED: JSON reflecting correct contract logic (correct math, dates)
- OBSERVED_TEXT: Text reflecting requested MUTATIONS (errors)
- Example: If "Bad Arithmetic" mutation, text shows wrong numbers, TRUTH shows correct

**Section 3: CẤU TRÚC HỢP ĐỒNG (Contract Structure Template)**
10-part Vietnamese contract structure:
1. Header: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM... HỢP ĐỒNG DỊCH VỤ Số: [Contract Number]"
2. Parties: Bên A (Provider) and Bên B (Client) with full details
3. "Xét rằng" (Whereas): Brief need description
4. Điều 1: Service scope and execution
5. Điều 2: Service fees, deposit, payment (with price table, VAT, E21 payment phases)
6. Điều 3: Violation penalties and damages
7. Điều 4: Duration and termination
8. Điều 5: Information security
9. Điều 6: General terms
10. Signatures: Representatives from both parties

**Section 4: QUY TRÌNH (Process)**
4-step workflow:
1. Read VARS_JSON and MUTATIONS list
2. Draft OBSERVED_TEXT (Vietnamese) and insert E01-E21 errors if requested
   - Special handling for E21: Show payment phases table/list instead of single total
3. Create TRUTH_INTENDED_JSON (clean data)
4. Create TEXT_OBSERVED_ANOMALIES_JSON (list of inserted errors)

**Section 5: ĐỊNH DẠNG ĐẦU RA (Strict Output Format)**
Required delimited block structure:
```
---CASE_START---
case_id: {{CONTRACT_NUMBER}}
---VARS_JSON---
{...}
---END VARS_JSON---
---TRUTH_INTENDED_JSON---
{...}
---END TRUTH_INTENDED_JSON---
---TEXT_OBSERVED_ANOMALIES_JSON---
{ "anomalies": [ { "code": "E01", "description": "..." } ] }
---END TEXT_OBSERVED_ANOMALIES_JSON---
---OBSERVED_TEXT_MD---
*** DỮ LIỆU THỬ NGHIỆM TỔNG HỢP – KHÔNG CÓ GIÁ TRỊ PHÁP LÝ ***
[Contract text in Markdown]
---END OBSERVED_TEXT_MD---
---PASS_CRITERIA---
- Test validation criteria
...
---END PASS_CRITERIA---
---END OF CASE---
```

## Service Layer

### `services/simpleFaker.ts`
- **Purpose**: Deterministic synthetic data generator
- **Features**:
  - `SeededRandom`: Linear Congruential Generator for reproducible randomness
  - `generateFakerData()`: Creates Vietnamese contract data:
    - Company information (Party A & B)
    - Contract number, date
    - Service items with quantities and rates
    - Payment phases (for E21 mutation)
  - Uses Vietnamese names, addresses, banks, services
  - Seed-based for reproducibility

### `services/openaiService.ts`
- **Purpose**: OpenAI API integration for contract generation
- **Functions**:
  - `parseOpenAIResponse()`: Extracts structured data from AI response using block markers
  - `generateContractWithOpenAI()`: 
    - Constructs prompt with faker data and mutations
    - Calls OpenAI-compatible API endpoint
    - Parses response into ParsedResponse structure
- **Response Format**: Uses delimited blocks (---CASE_START---, ---VARS_JSON---, etc.)

## UI Components

### `components/ConfigPanel.tsx`
- **Purpose**: Configuration sidebar panel
- **Features**:
  - Seed input with random generator button
  - Contract type selector
  - Locale selector
  - Mutation selection (11 checkboxes with categories)
  - Generate button with loading state
- **UI**: Dark theme, scrollable, mutation cards with visual feedback

### `components/ResultDashboard.tsx`
- **Purpose**: Main results display and export
- **Features**:
  - Three-tab interface: Preview, Truth, Anomalies
  - Case ID and status display
  - Watermark validation indicator
  - PDF export functionality:
    - Markdown to HTML conversion
    - Metadata section
    - Anomalies list
    - Pass criteria display
    - Uses html2pdf.js library
  - JSON displays for truth and vars data
- **Tabs**:
  - Preview: Observed text (with mutations)
  - Truth: Ground truth JSON
  - Anomalies: Mutation list and pass criteria

### `components/JsonDisplay.tsx`
- **Purpose**: Reusable JSON viewer component
- **Features**: 
  - Syntax-highlighted JSON display
  - Scrollable container
  - Customizable title and color scheme
  - Monospace font for readability

## Data Flow

1. **User Input** → ConfigPanel (seed, mutations, contract type)
2. **Generation** → App.tsx calls:
   - `generateFakerData()` → Creates deterministic input data
   - `generateContractWithOpenAI()` → AI generates contract with mutations
3. **Parsing** → `parseOpenAIResponse()` extracts structured data
4. **Display** → ResultDashboard shows:
   - Observed text (with errors)
   - Ground truth JSON (correct data)
   - Anomalies list
   - Input variables
5. **Export** → PDF generation with all metadata

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI-compatible API
- **PDF**: html2pdf.js
- **Build**: Vite with React plugin

## File Structure

```
contractsynth-qa/
├── App.tsx                    # Main app component
├── index.tsx                  # React entry point
├── index.html                 # HTML entry
├── index.css                  # Global styles
├── types.ts                   # TypeScript definitions
├── constants.ts               # Constants & system prompt
├── package.json               # Dependencies
├── vite.config.ts             # Build config
├── tsconfig.json              # TypeScript config
├── .env                       # Environment variables
├── components/
│   ├── ConfigPanel.tsx        # Configuration UI
│   ├── ResultDashboard.tsx   # Results & export UI
│   └── JsonDisplay.tsx        # JSON viewer
└── services/
    ├── simpleFaker.ts         # Data generator
    └── openaiService.ts       # AI API integration
```

