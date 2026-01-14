
# Debugging Steps
1. Confirmed `.env` has `DATABASE_URL="file:./dev.db"`.
2. Confirmed `schema.prisma` has `provider = "sqlite"`.
3. Running `npm install && npx prisma generate && npx prisma db push` to ensure DB client and file exist.
4. If this succeeds, the backend should start.
