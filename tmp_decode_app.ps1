# Read the base64 from file, decode, apply changes, save
$b64 = [System.IO.File]::ReadAllText('C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_app_b64.txt', [System.Text.UTF8Encoding]::new($false)).Trim()
$bytes = [System.Convert]::FromBase64String($b64)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)

# Change 1: hero body text
$old1 = "Nine capabilities in one system, each solving a part of your food life `u{2014}`r`n        scoring, personalizing, planning, shopping, tracking `u{2014} all connected.`r`n        No other app does this."
$new1 = "Nine capabilities. One system. Scoring, personalizing, planning, shopping, tracking, all connected.`r`n        No other app does this."
$text2 = $text.Replace(
  "Nine capabilities in one system, each solving a part of your food life " + [char]0x2014 + "`n        scoring, personalizing, planning, shopping, tracking " + [char]0x2014 + " all connected.`n        No other app does this.",
  "Nine capabilities. One system. Scoring, personalizing, planning, shopping, tracking, all connected.`n        No other app does this."
)

# Change 2 & 3: 1,000 -> 5,000
$text3 = $text2.Replace('aria-label="Join the first 1,000"', 'aria-label="Join the first 5,000"')
$text4 = $text3.Replace('>Join the first 1,000</h2>', '>Join the first 5,000</h2>')

# Change 4: body paragraph
$text5 = $text4.Replace(
  "The first 1,000 members get lifetime Pro access at 60% off, priority mobile`r`n        app access when we launch on iOS and Android, and a direct line to the`r`n        founding team.",
  "Lifetime Pro at 60% off. Priority access when we launch on iOS and Android.`r`n        A direct line to the team building it."
)
$text6 = $text5.Replace(
  "The first 1,000 members get lifetime Pro access at 60% off, priority mobile`n        app access when we launch on iOS and Android, and a direct line to the`n        founding team.",
  "Lifetime Pro at 60% off. Priority access when we launch on iOS and Android.`n        A direct line to the team building it."
)

[System.IO.File]::WriteAllText('C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_app_modified.txt', $text6, [System.Text.UTF8Encoding]::new($false))
Write-Output "Done. Length: $($text6.Length)"
Write-Output "Contains 5000: $(($text6 -match '5,000'))"
Write-Output "Contains 1000: $(($text6 -match '1,000'))"
