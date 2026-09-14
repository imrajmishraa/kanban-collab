#!/usr/bin/env bash
set -e

BASE=http://localhost:3000/api/v1/auth
JAR=/tmp/kanban-login.txt
EMAIL="raj212558@gmail.com"
PASSWORD="Imrajmishraa@2005"

echo "==============================="
echo "LOGIN FLOW TEST"
echo "Email: $EMAIL"
echo "==============================="
echo ""

# 1. Login — no rememberMe (default false, session cookie)
echo "── Login (rememberMe: false) ──"
echo ""

echo "=== LOGIN #1 (rememberMe: false) ==="
curl -s -c "$JAR" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"rememberMe\":false}" \
  -w "\nstatus=%{http_code} time=%{time_total}s\n" \
  | tail -2
echo ""

# Check cookie has NO Max-Age (session cookie)
echo "Cookie set:"
grep refreshToken "$JAR" | awk '{print "  ", $1, $2, $3, $4, $5, $6, $7}' || echo "  (none)"
echo ""

# 2. Login — with rememberMe (persistent cookie, 30d)
echo "── Login (rememberMe: true) ──"
echo ""

echo "=== LOGIN #2 (rememberMe: true) ==="
curl -s -c "$JAR" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"rememberMe\":true}" \
  -w "\nstatus=%{http_code} time=%{time_total}s\n" \
  | tail -2
echo ""

# Check cookie HAS Max-Age / Expires
echo "Cookie set:"
grep refreshToken "$JAR" | awk '{print "  ", $1, $2, $3, $4, $5, $6, $7}' || echo "  (none)"
echo ""

# 3. Login — wrong password (expect 401)
echo "── Login (wrong password) ──"
echo ""

echo "=== LOGIN #3 (wrong password) ==="
curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrong-password\"}" \
  -w "\nstatus=%{http_code} time=%{time_total}s\n" \
  | tail -2
echo ""

# 4. Login — nonexistent email (expect 401)
echo "── Login (nonexistent email) ──"
echo ""

echo "=== LOGIN #4 (nonexistent email) ==="
curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com","password":"anything123"}' \
  -w "\nstatus=%{http_code} time=%{time_total}s\n" \
  | tail -2
echo ""

# 5. Login — invalid email format (expect 422)
echo "── Login (invalid email format) ──"
echo ""

echo "=== LOGIN #5 (invalid format) ==="
curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email","password":"hunter2secret"}' \
  -w "\nstatus=%{http_code} time=%{time_total}s\n" \
  | tail -2
echo ""

# 6. Login — missing password (expect 422)
echo "── Login (missing password) ──"
echo ""

echo "=== LOGIN #6 (missing password) ==="
curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"raj212558@gmail.com"}' \
  -w "\nstatus=%{http_code} time=%{time_total}s\n" \
  | tail -2
echo ""

echo "Done."