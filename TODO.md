# TODO - Fix Parent Dashboard login

- [x] Identify root cause of parent login failure: login throws `Firebase: Error (auth/invalid-credential)`.
- [x] Fix AuthContext/Firebase mock-vs-live mode so demo parent login works: added `VITE_FORCE_MOCK_AUTH` to force mock auth even when Firebase env vars are present.

- [x] Ensure correct role + studentId mapping for parent demo user (mock DB already contains `parent@school.com` with `studentId: "student-1"`).
- [ ] Verify login works for: parent@school.com / parent123.
- [ ] Build/run quick smoke test: start dev server, login, confirm /parent loads.
