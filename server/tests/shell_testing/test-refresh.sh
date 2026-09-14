set -e

BASE=http://localhost:3000/api/v1/auth
JAR=/tmp/kanban-cookies.txt

# 1. Login → establish session + cookie
echo "=== LOGIN ==="
curl -s -c "$JAR" -X POST "$BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"raj212558@gmail.com","password":"Imrajmishraa@2005","rememberMe":true}' \
  -w "\nstatus=%{http_code} time=%{time_total}s\n" \
  | tail -3

# 2. Refresh 5 times, rotating the cookie each time
for i in 1 2 3 4 5; do
  echo ""
  echo "=== REFRESH #$i ==="
  curl -s -b "$JAR" -c "$JAR" -X POST "$BASE/refresh" \
    -w "\nstatus=%{http_code} time=%{time_total}s\n" \
    | tail -3
done

# 3. Logout
echo ""
echo "=== LOGOUT ==="
curl -s -b "$JAR" -X POST "$BASE/logout" \
  -w "\nstatus=%{http_code}\n" \
  | tail -2

echo ""
echo "Done."