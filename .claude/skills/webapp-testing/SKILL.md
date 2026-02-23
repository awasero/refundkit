---
name: webapp-testing
description: Test web applications using Python Playwright scripts. Use when asked to "test the app", "QA this", "check if this works", "verify the UI", "run browser tests", "E2E test", or when verifying that a web application works correctly end-to-end. Writes and runs Playwright scripts to navigate pages, click elements, fill forms, take screenshots, and assert behavior. Works with both static HTML and dynamic JavaScript apps.
---

# Web Application Testing

Test web applications by writing native Python Playwright scripts. This skill handles end-to-end browser testing — navigating real pages, clicking real buttons, and verifying real behavior.

## Decision Tree: Choosing Your Approach

```
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         ├─ Success → Write Playwright script using selectors
    │         └─ Fails/Incomplete → Treat as dynamic (below)
    │
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Start the server first, then test
        │
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Identify selectors from rendered state
            4. Execute actions with discovered selectors
```

## Setup

Ensure Playwright is installed:
```bash
pip install playwright
playwright install chromium
```

## Writing Test Scripts

### Basic pattern:
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)  # Always headless
    page = browser.new_page()
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')  # CRITICAL: Wait for JS to execute

    # ... your test logic here

    browser.close()
```

### Starting servers before testing:

**Single server:**
```bash
# Start the dev server in background, wait for it, then run tests
npm run dev &
sleep 5  # or use a wait-for-port utility
python test_script.py
```

**Or use a helper script** that manages server lifecycle:
```python
import subprocess, time, signal

# Start server
server = subprocess.Popen(['npm', 'run', 'dev'], cwd='.')
time.sleep(5)  # Wait for server to be ready

try:
    # Run your Playwright tests
    run_tests()
finally:
    server.terminate()
    server.wait()
```

## Reconnaissance-Then-Action Pattern

For dynamic apps where you don't know the selectors upfront:

1. **Navigate and wait:**
   ```python
   page.goto('http://localhost:3000')
   page.wait_for_load_state('networkidle')
   ```

2. **Inspect the rendered DOM:**
   ```python
   # Take a screenshot to see what rendered
   page.screenshot(path='/tmp/inspect.png', full_page=True)

   # Or inspect the DOM directly
   content = page.content()
   buttons = page.locator('button').all()
   links = page.locator('a').all()
   inputs = page.locator('input').all()
   ```

3. **Identify selectors** from the inspection results

4. **Execute actions** using discovered selectors:
   ```python
   page.locator('text=Sign In').click()
   page.locator('#email').fill('test@example.com')
   page.locator('button[type="submit"]').click()
   ```

## Common Test Patterns

### Form submission:
```python
page.locator('#name').fill('John Doe')
page.locator('#email').fill('john@example.com')
page.locator('button[type="submit"]').click()
page.wait_for_selector('.success-message')
assert page.locator('.success-message').is_visible()
```

### Navigation and page content:
```python
page.locator('text=Dashboard').click()
page.wait_for_url('**/dashboard')
assert 'Dashboard' in page.title()
```

### Checking for errors:
```python
# Capture console errors
errors = []
page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)

page.goto('http://localhost:3000')
page.wait_for_load_state('networkidle')

assert len(errors) == 0, f"Console errors found: {errors}"
```

### Screenshot comparison:
```python
# Take screenshots for visual verification
page.screenshot(path='/tmp/homepage.png', full_page=True)
page.locator('text=Login').click()
page.wait_for_load_state('networkidle')
page.screenshot(path='/tmp/login-page.png', full_page=True)
```

### Responsive testing:
```python
# Test at different viewport sizes
for width, label in [(375, 'mobile'), (768, 'tablet'), (1280, 'desktop')]:
    page.set_viewport_size({'width': width, 'height': 800})
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')
    page.screenshot(path=f'/tmp/{label}.png', full_page=True)
```

## Common Pitfalls

❌ **Don't** inspect the DOM before waiting for `networkidle` on dynamic apps
✅ **Do** wait for `page.wait_for_load_state('networkidle')` before inspection

❌ **Don't** use hardcoded sleep times for waiting on elements
✅ **Do** use `page.wait_for_selector()` or `page.wait_for_load_state()`

❌ **Don't** write tests that depend on specific data in the database
✅ **Do** seed test data before running tests or test against UI structure

❌ **Don't** skip cleanup — always close the browser
✅ **Do** use try/finally or context managers

## Best Practices

- Always use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or `data-testid` attributes
- Add appropriate waits: `page.wait_for_selector()`, `page.wait_for_load_state()`
- Take screenshots at key steps for visual verification
- Test the critical user flow first, then edge cases
- Run at multiple viewport sizes for responsive testing
- Capture console errors to catch JS exceptions

## Integration with Other Skills

- **test-discipline**: Handles unit/integration tests (code level). This skill handles E2E tests (browser level). Use both.
- **frontend-lean**: Defines the performance budget and accessibility standards that webapp-testing can verify.
- **project-discovery**: The core user journey identified during discovery becomes the first E2E test to write.
