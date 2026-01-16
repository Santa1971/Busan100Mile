
from playwright.sync_api import sync_playwright

def run_test_case(browser, case_name, mock_body, expected_text):
    context = browser.new_context()
    page = context.new_page()

    # Block getInitialData
    page.route('**/exec?action=getInitialData*', lambda route: route.abort())

    # Mock the API response
    # Added wildcard * at the end to match potential trailing query params (e.g. &)
    page.route('**/exec?action=getConfig*', lambda route: route.fulfill(
        status=200,
        content_type='application/json',
        headers={'Cache-Control': 'no-store'},
        body=mock_body
    ))

    print(f"--- Running {case_name} ---")
    try:
        page.goto('http://localhost:8080/index.html')
        page.wait_for_selector('#registration-status')

        # Check against expectation
        page.wait_for_function(
            f'document.getElementById("registration-status").textContent === "{expected_text}"',
            timeout=5000
        )
        print(f"{case_name}: Passed")
    except Exception as e:
        try:
            actual = page.eval_on_selector('#registration-status', 'el => el.textContent')
            print(f"{case_name}: Failed. Expected '{expected_text}', got '{actual}'")
        except:
            print(f"{case_name}: Failed with error: {e}")

    finally:
        context.close()

def verify_registration_status():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test Case 1: registrationOpen is boolean true
        run_test_case(
            browser,
            "Test Case 1 (boolean true)",
            '{"registrationOpen": true, "eventDate": "2026-03-01"}',
            "접수중"
        )

        # Test Case 2: registrationOpen is string "true"
        run_test_case(
            browser,
            "Test Case 2 (string 'true')",
            '{"registrationOpen": "true", "eventDate": "2026-03-01"}',
            "접수중"
        )

        # Test Case 3: registrationOpen is boolean false
        run_test_case(
            browser,
            "Test Case 3 (boolean false)",
            '{"registrationOpen": false, "eventDate": "2026-03-01"}',
            "접수마감"
        )

        browser.close()

if __name__ == '__main__':
    verify_registration_status()
