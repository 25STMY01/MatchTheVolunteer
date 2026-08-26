# Debug Scripts for Filter Data Issues

These scripts help diagnose why filter options (genders, religions, languages) are not loading properly.

## Scripts

### 1. `inspect-volunteer-data.mjs`
Raw inspection of the Volunteer Masterlist.xlsx file without using the repository layer.

**What it does:**
- Reads the Excel file directly
- Shows all headers and their indices
- Displays first 20 volunteer records with key data
- Analyzes unique values for gender, religion, and language
- Shows how the language parsing (comma/slash delimiters) works

**Usage:**
```bash
node scripts/debug_scripts/inspect-volunteer-data.mjs
```

**When to use:**
- You want to see the raw Excel data
- Need to understand the actual file structure
- Checking if the issue is in the Excel file itself

---

### 2. `inspect-case-data.mjs`
Raw inspection of the Case Masterlist.xlsx file.

**What it does:**
- Reads the Excel file directly
- Shows all headers
- Displays first 10 case records with all their data

**Usage:**
```bash
node scripts/debug_scripts/inspect-case-data.mjs
```

**When to use:**
- You want to see the raw case Excel data
- Need to understand case file structure

---

### 3. `test-repository-parsing.mjs`
Tests the actual VolunteerRepository parsing logic to see how it reads and parses the data.

**What it does:**
- Uses the actual VolunteerRepository class
- Shows what volunteers are retrieved
- Shows the extraction methods: `getUniqueGenders()`, `getUniqueReligions()`, `getUniqueLanguages()`
- Compares manual extraction vs. repository methods
- Shows data quality metrics (empty values)

**Usage:**
```bash
node scripts/debug_scripts/test-repository-parsing.mjs
```

**When to use:**
- You want to test the repository layer
- Checking if the parsing logic is working correctly
- Comparing what the repository returns vs. raw data

---

### 4. `test-api-handlers.mjs`
Tests the actual API handler functions that the client calls.

**What it does:**
- Calls the actual handlers: `getVolunteersList()`, `getAvailableGenders()`, etc.
- Shows what data is being returned
- Warns if any filter returns empty results
- Summarizes data availability

**Usage:**
```bash
npx tsx scripts/debug_scripts/test-api-handlers.mjs
# or via npm script:
npm run debug:api
```

**When to use:**
- You want to test what the client would receive
- Checking if the end-to-end flow works
- Most useful for debugging the actual filter issue

---

## Troubleshooting Flow

1. **Start with `inspect-volunteer-data.mjs`**
   - See if the Excel file contains the data
   - Check the actual values in gender, religion, languages columns

2. **Then run `test-repository-parsing.mjs`**
   - See how the repository is reading the data
   - Compare with step 1 results
   - Check if values are being lost in parsing

3. **Finally run `test-api-handlers.mjs`**
   - See what the client would receive
   - Verify the end-to-end flow
   - Identify where data is being lost

## Expected Output

For a healthy setup, `test-api-handlers.mjs` should show something like:

```
✓ Got 45 volunteers

Testing: getAvailableGenders()
✓ Result: ["male", "female"]
  Count: 2

Testing: getAvailableReligions()
✓ Result: ["buddhist", "christian", "hindu", "muslim", "others"]
  Count: 5

Testing: getAvailableLanguages()
✓ Result: ["cantonese", "chinese", "english", "hokkien", "malay", "tamil", "teochew"]
  Count: 7
```

If you see Count: 0 for any filter, the data isn't being extracted properly.
