---
name: test-discipline
description: Enforces consistent testing practices. Use when writing tests, creating new features, fixing bugs, or reviewing test coverage. Ensures tests are meaningful, isolated, and maintainable.
---

# Test Discipline

Tests are documentation that runs. Every test answers: "What should happen when...?"

## Rules

1. **Every feature and bug fix gets a test.** No exceptions. If you can't test it, the design needs rethinking.

2. **Test behavior, not implementation.** Test what the function DOES, not how it does it. If you refactor internals and tests break, the tests were wrong.

3. **Arrange-Act-Assert pattern:**
   ```
   // Arrange: set up the scenario
   const cart = createCart();
   cart.addItem({ id: 1, price: 10 });

   // Act: perform the action
   const total = cart.getTotal();

   // Assert: verify the result
   expect(total).toBe(10);
   ```

4. **Descriptive test names:** `should return total price when cart has items` — not `test1` or `testGetTotal`.

5. **Isolation:** Each test runs independently. No shared mutable state between tests. No test ordering dependencies.

6. **Mock external services, not internal modules.** Mock the HTTP client, the database connection, the payment API. Don't mock your own utility functions.

7. **Critical path integration tests:** Auth flow, payment processing, and core business logic get integration tests that hit real (test) infrastructure.

8. **Test file location:** Keep test files next to source files (`Component.tsx` + `Component.test.tsx`) OR in a mirror `/tests` structure. Pick one pattern for the whole project.

9. **No flaky tests.** If a test fails intermittently, fix it or delete it. Flaky tests erode trust in the entire suite.

10. **Run tests before committing.** The test suite must pass locally before pushing.
