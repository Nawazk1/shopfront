# ShopFront Admin Setup

The public storefront is available at `/`. Product management is available at `/admin/products` and requires the single admin account configured on the backend.

## Local setup

1. Copy `.env.example` to `.env` inside this `backend` folder.
2. Set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` with at least 12 characters.
3. Set `ADMIN_JWT_SECRET` to a private random value with at least 32 characters. Generate one with:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

4. Keep `SHOPFRONT_ORIGIN=http://localhost:3000` for local development.
5. Start the API from this folder with `npm start`, then open `http://localhost:3000/admin/login`.

The session cookie is HTTP-only, SameSite=Strict, and expires after eight hours. Five failed sign-in attempts from one address are temporarily blocked. The backend refuses admin access until all credentials and the session secret are configured.

## Customer accounts and order emails

Customer signup requires email verification. Customer passwords are stored as salted scrypt hashes. Verification links expire after 24 hours; password reset links expire after one hour and invalidate existing sessions. Orders are stored against the signed-in customer and the order API calculates prices from the server catalogue. Cash on Delivery is supported; card payment stays unavailable until a payment provider is connected.

In local development, verification and reset URLs are shown in the web UI and logged by the API for testing. For production, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, and `PUBLIC_SITE_URL` in the backend host's secret settings. Production registration is disabled until SMTP is configured. Never commit SMTP credentials.

## Production

Set the same environment values in the backend host's secret manager. Set `SHOPFRONT_ORIGIN` and `PUBLIC_SITE_URL` to the exact public storefront origin and use HTTPS; production cookies are Secure. Keep both cookie SameSite settings at `Strict` when the storefront and API are same-site. If they are on different sites, set both to `None` and keep HTTPS enabled. Never put credentials in a `NEXT_PUBLIC_*` variable or commit a `.env` file. The product-write API is protected on the server; hiding the admin page alone is not relied on for security.