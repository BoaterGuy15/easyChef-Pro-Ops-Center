import json, base64, urllib.request, ssl, sys

sys.stdout.reconfigure(encoding='utf-8')

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

def gas_upload(file_name, content):
    payload = json.dumps({
        'action': 'patch_website_files',
        'file': file_name,
        'content': content
    }).encode('utf-8')
    ctx = ssl.create_default_context()
    req = urllib.request.Request(GAS_URL, data=payload, headers={'Content-Type': 'text/plain'})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
        return json.loads(resp.read().decode('utf-8'))

# ── coming-soon.astro — full rewrite ──────────────────────────────────────────
coming_soon = """---
import Layout from '../layouts/Layout.astro';

const launchLabel = 'July 1, 2026';
---

<Layout
  title="easyChef Pro — Launching July 1, 2026"
  description="easyChef Pro is the system your kitchen was always missing. Launching July 1, 2026."
>
  <section class="coming">
    <div class="coming__bg" aria-hidden="true"></div>

    <div class="coming__inner container">
      <div class="coming__pill reveal">
        <span class="coming__pill-badge">SOON</span>
        <span class="coming__pill-text">Pre-launch · {launchLabel}</span>
      </div>

      <h1 class="coming__title reveal reveal--delay-1">
        Coming <span class="coming__title-accent">Soon</span>
      </h1>

      <p class="coming__sub reveal reveal--delay-2">
        The system your kitchen was always missing is almost here.
        We're putting the finishing touches on something special.
      </p>

      <div class="coming__founding reveal reveal--delay-3">
        <p class="coming__founding-title">Join the first 5,000.</p>
        <p class="coming__founding-body">
          Lifetime Pro at 60% off. Priority access when we launch on iOS and Android.
          A direct line to the team building it.
        </p>
        <a href="https://launch.easychefpro.com" class="coming__founding-cta">
          <span>Claim My Spot</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  </section>
</Layout>

<style>
  .coming {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: clamp(140px, 18vw, 220px) 0 clamp(80px, 12vw, 140px);
    overflow: hidden;
    isolation: isolate;
  }

  .coming__bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(60% 50% at 50% 20%, rgba(239, 68, 58, 0.10) 0%, rgba(239, 68, 58, 0) 70%),
      linear-gradient(90deg, rgba(194, 214, 255, 0.18) 0%, rgba(222, 33, 36, 0.10) 50%, rgba(251, 223, 177, 0.18) 100%),
      var(--color-bg-grey);
  }

  .coming__inner {
    max-width: 920px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(20px, 3vw, 28px);
  }

  .coming__pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: var(--r-pill);
    padding: 4px 14px 4px 4px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .coming__pill-badge {
    background: var(--color-brand);
    color: #fff;
    border-radius: var(--r-pill);
    padding: 2px 10px;
    font-family: var(--font-modern);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.04em;
  }
  .coming__pill-text {
    font-family: var(--font-modern);
    font-weight: 500;
    font-size: 15px;
    color: var(--color-muted);
    letter-spacing: -0.01em;
  }

  .coming__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(40px, 7vw, 80px);
    line-height: 1.05;
    letter-spacing: -0.025em;
    color: var(--color-ink-strong);
    max-width: 18ch;
  }
  .coming__title-accent { color: var(--color-brand); }

  .coming__sub {
    font-family: var(--font-sans);
    font-size: clamp(16px, 1.6vw, 18px);
    line-height: 1.55;
    color: var(--color-body);
    max-width: 56ch;
  }

  .coming__founding {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
    padding: 28px 32px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 20px;
    border: 1px solid rgba(239, 68, 58, 0.12);
    backdrop-filter: blur(8px);
    max-width: 520px;
    width: 100%;
  }
  .coming__founding-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(24px, 3vw, 32px);
    color: var(--color-brand);
    margin: 0;
    letter-spacing: -0.025em;
  }
  .coming__founding-body {
    font-family: var(--font-sans);
    font-size: 15px;
    line-height: 1.55;
    color: var(--color-body);
    margin: 0;
    max-width: 44ch;
  }
  .coming__founding-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--color-brand);
    color: #fff;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 15px;
    border-radius: 999px;
    margin-top: 4px;
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .coming__founding-cta:hover {
    background: #f25147;
    transform: translateY(-2px);
  }

  .coming__finep {
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--color-caption);
  }
</style>
"""

# ── about-us.astro — load, normalize CRLF→LF, patch ─────────────────────────
with open(r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_about_us_current.txt', 'r', encoding='utf-8', newline='') as f:
    about = f.read()

# Normalize CRLF → LF
about = about.replace('\r\n', '\n')

# Patch 1 – hero body paragraph
about = about.replace(
    "        We are a team of scientists, engineers, and nutritionists who believe that\n"
    "        your health shouldn&rsquo;t be a black box. We built easyChef Pro to replace\n"
    "        nutritional guesswork with deterministic, auditable science, giving you\n"
    "        the power to connect what you eat to how you feel.",
    "        Scientists, engineers, and nutritionists who believe your health shouldn&rsquo;t be a black box.\n"
    "        We built easyChef Pro to replace nutritional guesswork with clear, traceable science,\n"
    "        so you can connect what you eat to how you feel."
)

# Patch 2 – section 2 intro body (two paras → one)
about = about.replace(
    "        <p>\n"
    "          The modern health journey is brutally fragmented. You use one app to find\n"
    "          recipes, another to make a grocery list, a third to track your macros,\n"
    "          and a fourth to monitor a health condition. None of these systems talk\n"
    "          to each other, and none of them can provide a simple, verifiable answer\n"
    "          to the most important question: &ldquo;Is this food actually good for me?&rdquo;\n"
    "        </p>\n"
    "        <p>\n"
    "          This fragmentation leads to real consequences: decision fatigue, wasted\n"
    "          money, and a profound lack of confidence in our food choices. The data\n"
    "          shows a clear picture of this chaos.\n"
    "        </p>",
    "        <p>\n"
    "          One app for recipes. Another for macros. A third for groceries. A fourth for your health condition.\n"
    "          None of them talk to each other &mdash; and none of them can answer the one question that actually matters:\n"
    "          &ldquo;Is this food good for me?&rdquo; That gap costs you. Decision fatigue. Wasted money. Zero confidence\n"
    "          in what you&rsquo;re putting on the table.\n"
    "        </p>"
)

# Patch 3 – section 5 deterministic lead
about = about.replace(
    "          While competitors bolt on &ldquo;AI&rdquo; features that are little more than\n"
    "          guessing engines, easyChef Pro is built from the ground up on a\n"
    "          foundation of deterministic mathematics. This is our core, patented\n"
    "          differentiator.",
    "          Competitors bolt on &ldquo;AI&rdquo; features that guess differently every day. easyChef Pro is built on\n"
    "          deterministic mathematics. Same inputs. Same outputs. Every time. This is our core,\n"
    "          patent-pending differentiator."
)

# Patch 4 – remove PATENT 63/905.409 badges (3 instances)
about = about.replace(
    '          <span class="feature-block__badge">PATENT 63/905.409</span>\n',
    ''
)

# Patch 5 – Deterministic by Design body
about = about.replace(
    "            Our engine is not a probabilistic LLM. It is a deterministic system.\n"
    "            Give it the same recipe twice, and you will get the exact same\n"
    "            nutritional score, HPD insight, and UNL entry, down to the last\n"
    "            decimal. This reproducibility is what makes our data clinically\n"
    "            auditable.",
    "            Our engine is not a probabilistic LLM. It is a deterministic system. Give it the same recipe twice,\n"
    "            you get the exact same nutritional score, HPD insight, and UNL entry, down to the last decimal.\n"
    "            That reproducibility is what makes our data clinically auditable."
)

# Patch 6 – Powered by DNI body
about = about.replace(
    "            This is our central orchestration layer (Patent 63/905,596), a\n"
    "            system of 9 integrated, patented modules that work together to\n"
    "            analyze food, not just text. It understands that &ldquo;2 large eggs&rdquo; and\n"
    "            &ldquo;3 eggs, beaten&rdquo; are ingredients with specific nutritional\n"
    "            properties, not just words to be grouped.",
    "            Our central orchestration layer. Nine integrated modules that work together to analyze food,\n"
    "            not just text. It knows that &ldquo;1 cup raw spinach&rdquo; and &ldquo;1 cup cooked spinach&rdquo; are\n"
    "            nutritionally different ingredients, not the same word appearing twice."
)

# Patch 7 – Whole-Journey Coverage body
about = about.replace(
    "            From inspiration (personalized recipe suggestions powered by the\n"
    "            AMPE, Patent 63/905,649) to planning (waste reduction via the SPM,\n"
    "            Patent 63/905,682) and completion (auditable tracking in the UNL,\n"
    "            Patent 63/905,620), easyChef Pro covers the entire food journey\n"
    "            within a single, unified system.",
    "            From inspiration, personalized recipe suggestions, to planning with waste reduction built in,\n"
    "            to auditable tracking at completion. One system. The entire food journey."
)

# Patch 8 – Timeline Q2 2026 — 1,000 → 5,000
about = about.replace(
    "                Website launch. Early access waitlist open. Founding Member\n"
    "                program active &mdash; first 1,000 members receive lifetime Pro\n"
    "                access at 60% off.",
    "                Website launch. Early access waitlist open. Founding Member\n"
    "                program active &mdash; first 5,000 members receive lifetime Pro access at 60% off."
)

# Patch 9 – CTA body — founding member pitch
about = about.replace(
    "        Join the founding members who will be the first to experience the\n"
    "        complete easyChef Pro journey. The first 1,000 members get lifetime Pro\n"
    "        access at 60% off.",
    "        Lifetime Pro at 60% off. Priority access when we launch on iOS and Android.\n"
    "        A direct line to the team building it."
)

# Verification
checks = [
    ('Scientists, engineers, and nutritionists who believe', True),
    ('We are a team of scientists, engineers, and nutritionists who believe that', False),
    ('One app for recipes.', True),
    ('modern health journey is brutally fragmented', False),
    ('patent-pending differentiator', True),
    ('guessing engines', False),
    ('PATENT 63/905.409', False),
    ('1 cup raw spinach', True),
    ('From inspiration, personalized recipe suggestions', True),
    ('first 5,000 members', True),
    ('first 1,000 members', False),
    ('Lifetime Pro at 60% off. Priority access', True),
    ('That reproducibility', True),
]
print('Patch verification:')
all_ok = True
for text, expected in checks:
    found = text in about
    status = 'OK' if found == expected else 'FAIL'
    if status == 'FAIL': all_ok = False
    print(f'  [{status}] {repr(text[:70])} expected={expected} found={found}')

if not all_ok:
    print('\nSome patches failed — aborting upload')
    import sys; sys.exit(1)

print('\nAll patches verified.')

# Upload coming-soon.astro
print('\nUploading coming-soon.astro...')
r = gas_upload('coming-soon.astro', coming_soon)
print(json.dumps(r))

# Upload about-us.astro
print('\nUploading about-us.astro...')
r = gas_upload('about-us.astro', about)
print(json.dumps(r))

print('\nAll done.')
