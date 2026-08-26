#!/usr/bin/env node

/**
 * Debug script to test the full API handler flow
 * Usage: node scripts/debug_scripts/test-api-handlers.mjs
 *
 * This script imports and runs the actual handler functions to see what they return
 */

import {
  getAvailableGenders,
  getAvailableReligions,
  getAvailableLanguages,
  getVolunteersList,
} from '../../src/server/handlers/volunteer';

console.log('═'.repeat(80));
console.log('API HANDLER FLOW TEST');
console.log('═'.repeat(80));
console.log();

try {
  console.log('Testing: getVolunteersList()\n');
  const volunteers = getVolunteersList();
  console.log(`✓ Got ${volunteers.length} volunteers\n`);

  if (volunteers.length > 0) {
    console.log('First volunteer:');
    const vol = volunteers[0];
    console.log(`  Code: ${vol.code}`);
    console.log(`  Gender: "${vol.gender}"`);
    console.log(`  Religion: "${vol.religion}"`);
    console.log(`  Languages: "${vol.spokenLanguages}"\n`);
  }

  console.log('─'.repeat(80));
  console.log('Testing: getAvailableGenders()\n');
  const genders = getAvailableGenders();
  console.log(`✓ Result: [${genders.map((g) => `"${g}"`).join(', ')}]`);
  console.log(`  Count: ${genders.length}\n`);

  if (genders.length === 0) {
    console.warn(
      '⚠ WARNING: No genders found. This might indicate a parsing issue.\n'
    );
  }

  console.log('─'.repeat(80));
  console.log('Testing: getAvailableReligions()\n');
  const religions = getAvailableReligions();
  console.log(`✓ Result: [${religions.map((r) => `"${r}"`).join(', ')}]`);
  console.log(`  Count: ${religions.length}\n`);

  if (religions.length === 0) {
    console.warn(
      '⚠ WARNING: No religions found. This might indicate a parsing issue.\n'
    );
  }

  console.log('─'.repeat(80));
  console.log('Testing: getAvailableLanguages()\n');
  const languages = getAvailableLanguages();
  console.log(`✓ Result: [${languages.map((l) => `"${l}"`).join(', ')}]`);
  console.log(`  Count: ${languages.length}\n`);

  if (languages.length === 0) {
    console.warn(
      '⚠ WARNING: No languages found. This might indicate a parsing issue.\n'
    );
  }

  // Summary
  console.log('═'.repeat(80));
  console.log('SUMMARY');
  console.log('═'.repeat(80));
  console.log(`\nData available for filtering:`);
  console.log(`  Volunteers: ${volunteers.length}`);
  console.log(`  Unique Genders: ${genders.length}`);
  console.log(`  Unique Religions: ${religions.length}`);
  console.log(`  Unique Languages: ${languages.length}`);

  if (
    genders.length === 0 ||
    religions.length === 0 ||
    languages.length === 0
  ) {
    console.log('\n⚠ Some filters have no data. Check:');
    if (genders.length === 0)
      console.log('  • How gender values are being read from Excel');
    if (religions.length === 0)
      console.log('  • How religion values are being read from Excel');
    if (languages.length === 0)
      console.log(
        '  • How language values are being parsed (comma/slash delimiter)'
      );
  } else {
    console.log('\n✓ All filter data is available!');
  }

  console.log(`\n${'═'.repeat(80)}\n`);
} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
