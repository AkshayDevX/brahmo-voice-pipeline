---
name: drizzle-best-practices
description: Best practices and strict rules for Drizzle ORM operations. Invokes when asked to query the database, write Drizzle logic, or read Postgres models.
---

# 🛑 Mandatory Drizzle Query Rules

When querying the Postgres database using Drizzle, you MUST ALWAYS use the **Relational Query Builder v2 (RQB v2)** syntax. 

## 1. Relational Queries syntax (RQB v2)
Pass traditional JavaScript objects into `where`, entirely dropping the `eq()` functions or arrow function callbacks.

### ✅ DO THIS:
```typescript
const match = await db.query.matches.findFirst({
	where: {
		id: matchId,
	}
});

const users = await db.query.users.findMany({
	where: {
		age: 15,
		name: 'John'
	}
});
```

### ❌ DO NOT DO THIS (Legacy arrow/eq syntax):
```typescript
// NEVER DO THIS
const existingUser = await db.query.user.findFirst({
	where: (users, { eq }) => eq(users.id, userId),
});

// AVOID UNLESS ABSOLUTELY NECESSARY FOR COMPLEX GROUP_BY / JOINS
const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);
```

## 2. Default ID Strategy
The schema heavily relies on:
```typescript
id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID())
```
When inserting new records via `db.insert(table).values({...})`, **never manually generate the `id` field** unless specifically requested. Drizzle will securely handle the string/UUID generation natively using the `$defaultFn()` fallback.
