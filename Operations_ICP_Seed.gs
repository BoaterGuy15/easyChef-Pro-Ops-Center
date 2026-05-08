// ─────────────────────────────────────────────────────────────────────────────
// Operations_ICP_Seed.gs
// Run _seedSuperMom() once from the Apps Script editor to fill the Super Mom
// ICP profile in the ICPProfiles tab of the Campaign Center sheet.
// Run → Run function → _seedSuperMom
// ─────────────────────────────────────────────────────────────────────────────

function _seedSuperMom() {
  setIcpProfile({
    id:     'super_mom',
    name:   'Super Mom',
    code:   'super_mom',
    status: 'Active',

    demographics:
      'Female, 28-42, married, 2+ kids ages 3-12, suburban household, ' +
      'HHI $40-100K, primary grocery buyer, working full or part-time, ' +
      'drives minivan or SUV, household logistics manager.',

    psychographics:
      'Carries the full mental load of household food decisions. ' +
      'Motivated by being a good parent without burning out. ' +
      'Wants efficiency not gourmet. Convenience over everything. ' +
      'Feels guilt about food waste and takeout nights. ' +
      'Loss aversion is strong — every dollar wasted is a dollar her family does not have.',

    primary_pain:
      'No time to plan meals. Hits the wall at 6:30 PM staring into an empty fridge ' +
      'while hungry kids circle the kitchen asking what is for dinner. ' +
      'Grocery runs are reactive and over budget. Food goes to waste because there was never a plan. ' +
      'The guilt of serving cereal for dinner sits on her all night.',

    secondary_pain:
      'Food waste — she knows she is throwing away $1,336 a year but does not know how to stop it. ' +
      'The fridge is always full of about-to-expire items with no plan for them.',

    value_trigger:
      'Saves $1,336 a year without couponing or spreadsheets. ' +
      'Gets dinner on the table in 30 minutes from what is already in the fridge. ' +
      'Feels like a good mom who has it together — without burning out every single night.',

    loss_aversion:
      'Every dollar wasted on groceries is a dollar her family does not have. ' +
      'Every takeout night is a failure she carries home with her.',

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
      'Nextdoor for local word-of-mouth and trust.',

    conversion_triggers:
      'Seeing the $1,336 number. Hearing the 6:30 PM moment described exactly. ' +
      'Free to try — no credit card removes the final barrier. ' +
      '$7.99 founding price with scarcity (first 5,000 families).',

    utm_campaign_codes:
      'fb_super_mom · tk_super_mom · ig_health · seq1_welcome · seq2_nurture · seq3_urgency · seq4_launch_day',

    lp_variants:
      '/lp/waitlist-a (Money Hook — pain + data) · /lp/waitlist-b (Narrative + scarcity)',

    validated: true,
    validation_notes: 'Seeded from Wireframe Builder v2.0 locked ICP definitions — May 2026'
  });

  Logger.log('Super Mom ICP profile seeded successfully.');
  try { SpreadsheetApp.getUi().alert('Super Mom profile written to ICPProfiles tab.'); } catch(e) {}
}