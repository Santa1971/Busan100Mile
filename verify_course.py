from playwright.sync_api import sync_playwright

def verify_course_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock API
        page.route("**/exec?action=getCheckpoints*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id":1,"name":"Start","km":0,"cutoff":"16:00","lat":35.0,"lon":129.0,"elevation":10},{"id":2,"name":"Finish","km":100,"cutoff":"10:00","lat":35.0,"lon":129.0,"elevation":10}]'
        ))
        page.route("**/exec?action=getInitialData*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{}'
        ))
        page.route("**/exec?action=getConfig*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{}'
        ))

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        page.goto("http://localhost:8080/course.html")

        # Wait a bit for JS to run
        page.wait_for_timeout(3000)

        page.screenshot(path="verification_course.png")

        print("Finished.")
        if console_errors:
            print("Console Errors:", console_errors)
        else:
            print("No console errors.")

        browser.close()

if __name__ == "__main__":
    verify_course_page()
