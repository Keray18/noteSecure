# Secure Note Sharing Application

A secure note-sharing application built with Next.js, Prisma, PostgreSQL, and JWT authentication.

---

# Tech Stack

- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- bcrypt
- Zod

---

# Setup Instructions

## 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env` file.

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Generate Prisma Client

```bash
npx prisma generate
```

## 5. Run database migrations

```bash
npx prisma migrate dev
```

## 6. Start the application

```bash
npm run dev
```

---

# Database Schema

## User

- id
- name
- email
- password

## Note

- id
- title
- content
- ownerId
- createdAt
- updatedAt

## ShareLink

- id
- noteId
- token
- shareType
- accessType
- hashedPassword
- expiresAt
- used
- revoked
- viewCount
- createdAt

---

# Share Link Flow

1. User logs in.
2. User creates a note.
3. User selects sharing options.
4. A unique UUID token is generated.
5. Share link is stored in the database.
6. Link is shared with another user.
7. Recipient opens the link.
8. Backend validates:
   - Link exists
   - Not revoked
   - Not expired
   - Password (if required)
9. Note is returned if validation succeeds.

---

# Password Generation Logic

- Password-protected links require the owner to enter a password.
- Password is hashed using bcrypt before storing.
- Plain password is never stored in the database.
- During access, entered password is compared using bcrypt.compare().

---

# Expiry Logic

- Time-based links store an expiry timestamp.
- Every request checks the current time against `expiresAt`.
- If expired, the API returns **410 Link Expired**.

---

# Invalidate / Revoke Logic

- Owners can revoke any generated share link.
- Revoking sets the `revoked` field to `true`.
- Every access request checks this flag.
- Revoked links return **410 Link Revoked**.

---

# View Count Logic

View count increases only after successful access.

It increases for:

- Public links opened successfully
- Password-protected links after correct password

It does NOT increase for:

- Wrong password
- Expired links
- Revoked links
- Invalid links

---

# Race Condition Handling

One-time links use a database transaction with an atomic update.

The application updates the link only when:

```
used = false
```

Only the first request succeeds.

If multiple users open the link simultaneously:

- First request marks the link as used.
- Remaining requests receive **410 Link Already Used**.

This prevents concurrent access to one-time links.

---

# Features

- User Registration
- User Login
- JWT Authentication
- Create Notes
- Delete Notes
- Public Share Links
- Password Protected Links
- One-Time Share Links
- Time-Based Share Links
- Share Link Revocation
- View Count Tracking
- Secure Password Hashing