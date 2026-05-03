// ─────────────────────────────────────────────────────────────────────────────
// Operations_ICP_Seed.gs
// One-time seed functions for ICP profile data.
// Run each function once from the Apps Script editor:
//   Run → Run function → _seedSuperMom
//
// Safe to run multiple times — uses setIcpProfile() which upserts by id.
// Requires Operations_CampaignSheets.gs in the same project.
// ─────────────────────────────────────────────────────────────────────────────

function _seedSuperMom() {
  setIcpProfile({
    id:   'super_mom',
    name: 'Super Mom',
    code: 'super_mom',
    status: 'Active',

    demographics:
      'Female, 28–42, married, 2+ kids ages 3–12, suburban household, ' +
      'HHI $60–120K, primary grocery buyer, working full or part-time, ' +
      'drives minivan or SUV, household logistics manager.',

    primary_pain:
      'No time to plan meals. Hits the wall at 6:30 PM staring into an empty fridge ' +
      'while hungry kids circle the kitchen asking what\'s for dinner. ' +
      'Grocery runs are reactive and over budget. Food goes to waste because there was never a plan. ' +
      'The guilt of serving cereal for dinner sits on her all night.',

    value_trigger:
      'Saves $1,336 a year without couponing or spreadsheets. ' +
      'Gets dinner on the table in 30 minutes from what is already in the fridge. ' +
      'Feels like a good mom who has it together — without burning out every single night.',

    message_hierarchy:
      '1. Time relief first — she has zero left by 6 PM. ' +
      '2. Name the 6:30 PM moment exactly — that is the pain that gets the click. ' +
      '3. Real savings number — $1,336/year, not a vague promise. ' +
      '4. Kids actually eating the food — the emotional payoff she does not say out loud. ' +
      '5. Low friction — the app does the thinking so she does not have to.',

    channel_affinity:
      'Facebook primary — mom community groups and neighborhood pages. ' +
      'Pinterest for meal planning and recipe searches. ' +
      'Email: high open rate when subject line references time saved or the dinner hour. ' +
      'Instagram secondary — aspirational food content. ' +
      'Nextdoor for local word-of-mouth and trust.'
  });

  Logger.log('Super Mom ICP profile seeded.');
  try { SpreadsheetApp.getUi().alert('Super Mom profile written to ICPProfiles tab.'); } catch(e) {}
}
