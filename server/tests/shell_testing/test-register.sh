#!/usr/bin/env bash
set -e

BASE=http://localhost:3000/api/v1/auth
JAR=/tmp/kanban-register-flow.txt
PASSWORD="hunter2secret"
FULLNAME="Flow Test User"
TS=$(date +%s)

echo "==============================="
echo "REGISTER FLOW TEST"
echo "Base timestamp: $TS"
echo "==============================="
echo ""

# ─────────────────────────────────────────────
# 1. Register 5 new users
# ─────────────────────────────────────────────
echo "── Registering 5 fresh users ──"
echo ""

for i in 1 2 3 4 5; do
  EMAIL="flow-${TS}-${i}@example.com"
  echo "=== REGISTER #$i ($EMAIL) ==="
  curl -s -X POST "$BASE/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"fullName\":\"$FULLNAME $i\"}" \
    -w "\nstatus=%{http_code} time=%{time_total}s\n"
  echo ""
done

# ─────────────────────────────────────────────
# 2. Login as user #1
# ─────────────────────────────────────────────
FIRST_EMAIL="flow-${TS}-1@example.com"

echo "── Login as user #1 ──"
echo ""
echo "=== LOGIN ($FIRST_EMAIL) ==="
curl -s -c "$JAR" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$FIRST_EMAIL\",\"password\":\"$PASSWORD\",\"rememberMe\":true}" \
  -w "\nstatus=%{http_code} time=%{time_total}s\n"
echo ""

# ─────────────────────────────────────────────
# 3. Try to register user #1 again (duplicate)
# ─────────────────────────────────────────────
echo "── Register user #1 again (duplicate) ──"
echo ""
echo "=== REGISTER DUPLICATE ($FIRST_EMAIL) ==="
curl -s -X POST "$BASE/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$FIRST_EMAIL\",\"password\":\"$PASSWORD\",\"fullName\":\"$FULLNAME 1\"}" \
  -w "\nstatus=%{http_code} time=%{time_total}s\n"
echo ""

# ─────────────────────────────────────────────
# 4. Logout user #1
# ─────────────────────────────────────────────
echo "── Logout user #1 ──"
echo ""
echo "=== LOGOUT ($FIRST_EMAIL) ==="
curl -s -b "$JAR" -X POST "$BASE/logout" \
  -w "\nstatus=%{http_code} time=%{time_total}s\n"
echo ""

# ─────────────────────────────────────────────
# 5. Try to refresh after logout (should 401)
# ─────────────────────────────────────────────
echo "── Refresh after logout (expect 401) ──"
echo ""
echo "=== REFRESH AFTER LOGOUT ==="
curl -s -b "$JAR" -X POST "$BASE/refresh" \
  -w "\nstatus=%{http_code} time=%{time_total}s\n"
echo ""

echo "Done."