
from playwright.sync_api import sync_playwright

def generate_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Block getInitialData
        page.route('**/exec?action=getInitialData*', lambda route: route.abort())

        # Mock the API response for "Closed" state
        page.route('**/exec?action=getConfig*', lambda route: route.fulfill(
            status=200,
            content_type='application/json',
            headers={'Cache-Control': 'no-store'},
            body='{"registrationOpen": false, "eventDate": "2026-03-01"}'
        ))

        page.goto('http://localhost:8080/index.html')
        page.wait_for_selector('#registration-status')
        page.wait_for_function('document.getElementById("registration-status").textContent === "접수마감"')

        # Take screenshot
        page.screenshot(path='verification/closed_status.png')
        print("Screenshot saved to verification/closed_status.png")

        browser.close()

if __name__ == '__main__':
    generate_screenshot()
