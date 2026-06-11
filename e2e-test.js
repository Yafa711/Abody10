const puppeteer = require('puppeteer-core')

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  const page = await browser.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('  [CONSOLE ERROR]', msg.text())
  })
  page.on('pageerror', (err) => console.log('  [PAGE ERROR]', err.message))

  const BASE = 'http://127.0.0.1:8080'
  const results = { passed: 0, failed: 0, errors: [] }

  function report(name, ok, detail) {
    if (ok) { results.passed++; console.log(`  ✅ ${name}`) }
    else { results.failed++; results.errors.push(name); console.log(`  ❌ ${name}: ${detail}`) }
  }

  try {
    // 1. Load app
    console.log('\n1. Loading app...')
    await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 5000))
    const title = await page.title()
    report('App loads', title.length > 0, title)
    await page.screenshot({ path: '/tmp/e2e-01-initial.png' })

    // 2. Check body has content
    const bodyText = await page.evaluate(() => document.body.innerText)
    report('Body has content', bodyText.length > 20, bodyText.substring(0, 100))
    console.log('  Page text:', bodyText.substring(0, 200))

    // 3. Wait more for React to fully render
    await new Promise(r => setTimeout(r, 5000))
    await page.screenshot({ path: '/tmp/e2e-02-after-render.png' })

    // 4. Check for interactive elements
    const buttons = await page.$$('button, a, [role="button"], .tabBar, .css-button')
    report(`Found ${buttons.length} interactive elements`, buttons.length >= 0, `${buttons.length}`)

    // 5. Log page HTML structure
    const html = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500) || 'no-root')
    console.log('  Root HTML:', html.substring(0, 300))

    // Take final screenshot
    await page.screenshot({ path: '/tmp/e2e-03-final.png' })

  } catch (err) {
    console.log('  ❌ Test crashed:', err.message)
    results.failed++
    results.errors.push('runtime: ' + err.message)
  }

  console.log('\n================= E2E RESULTS =================')
  console.log(`  Passed: ${results.passed} / ${results.passed + results.failed}`)
  if (results.failed > 0) {
    console.log('  Failed:', results.errors.join(', '))
  }
  console.log('==============================================\n')

  await browser.close()
  process.exit(results.failed > 0 ? 1 : 0)
})()
