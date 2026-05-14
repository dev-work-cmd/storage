# SaaS Product and Billing Plan

This document turns the current secure PDF QR app into a concrete SaaS roadmap with product positioning, pricing, data-model changes, and Stripe integration boundaries.

## Why this product should be SaaS

Do not position the app as generic personal cloud storage.

That market is crowded, expensive to compete in, and weakly differentiated for this codebase.

Position the product as:

- secure PDF distribution
- QR-based document verification
- controlled file access after scan
- revocation, expiry, and audit-backed delivery

The current repo already supports the right product direction:

- private original and processed document storage
- QR replacement and QR insertion workflows
- verification, open, and download modes
- PIN, expiry, max access counts, and revoke controls
- audit logs and access counters

## Core SaaS promise

The product promise should be:

> Upload a PDF, place a managed QR code on it, control what happens when someone scans it, and keep an audit trail of document access.

This is stronger than "store files" because the value continues after the document is sent.

## Recommended ICP

Start narrow.

Recommended initial customer types:

- small businesses sharing sensitive PDFs
- HR and recruiting teams
- legal and compliance-heavy service firms
- training and certification issuers
- property managers and document-heavy operators

Avoid broad messaging like:

- secure storage for everyone
- cloud drive replacement
- file sharing for any use case

## Recommended v1 product shape

The v1 product should work like this:

1. A customer creates an account and a workspace.
2. The workspace uploads original PDFs.
3. The workspace chooses one editing workflow:
   - replace an existing QR
   - insert a new QR
4. The workspace configures access behavior:
   - verify only
   - open file
   - download file
   - optional PIN
   - optional expiry
   - optional maximum access count
5. The app generates and manages the QR destination URL.
6. Each scan resolves through the app, not a raw storage URL.
7. The workspace can revoke, disable, regenerate, or review access activity later.

## Product positioning

Use messaging closer to:

- controlled PDF distribution
- QR-managed document access
- verification-first document sharing
- private storage with scan-time policy enforcement

Do not lead with "QR replacement" in the main positioning. That is a workflow feature, not the category.

## Business model recommendation

Use subscription billing first.

Use usage limits and plan entitlements second.

Do not start with one-time payments only.

Do not start with pay-per-document only.

The product creates ongoing value through:

- active managed documents
- continued verification traffic
- access governance
- audit visibility

That fits recurring billing.

## Recommended pricing model

Start with 3 plans.

### Starter

Best for solo operators.

Suggested limits:

- low active document cap
- low monthly scan cap
- one workspace
- one member
- replace or insert QR
- revoke and expiry controls

### Pro

Best for serious independent operators and small teams.

Suggested limits:

- higher active document cap
- higher monthly scan cap
- more storage
- audit log access
- PIN protection
- custom verification branding

### Business

Best for teams and operations workflows.

Suggested limits:

- much higher document and scan caps
- multiple members
- role-based access
- workspace branding
- priority support
- future API access

## What to meter

Prefer a simple pricing model in v1:

- active documents
- monthly scans or access events
- storage volume
- member seats on higher plans

Recommended commercial default:

- base subscription includes a fixed amount of documents and scans
- overages are not required in v1
- when limits are reached, block new document creation or further processing until upgrade

This is simpler to explain and simpler to enforce than hybrid overage billing at launch.

## Recommended Stripe architecture

Use Stripe Billing, not custom recurring payment logic.

Recommended Stripe components:

- Stripe Checkout Sessions for subscription signup
- Stripe Billing for recurring subscriptions
- Stripe Customer Portal for self-serve billing management
- Stripe webhooks for subscription lifecycle sync

Recommended Stripe mode:

- hosted Checkout first
- hosted Customer Portal first

Do not build a custom card form in v1.

## Stripe product catalog recommendation

Create Stripe products and recurring prices for:

- Starter monthly
- Starter yearly
- Pro monthly
- Pro yearly
- Business monthly
- Business yearly

Keep annual pricing as a discounted yearly term, not a separate feature plan.

## Stripe customer lifecycle

Recommended flow:

1. User signs up in the app.
2. User creates or activates a workspace.
3. User selects a plan on `/pricing`.
4. App creates a Stripe Checkout Session for the selected recurring price.
5. Stripe redirects back to the app after successful checkout.
6. Webhook confirms subscription state and updates local billing records.
7. App unlocks the workspace entitlements.
8. Billing changes later happen through Stripe Customer Portal.

## Stripe webhook events to handle

Handle at least:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Use webhook events as the source of truth for subscription state.

Do not trust only the browser return URL.

## Workspace-based SaaS model

The current app is still single-owner oriented.

That is fine for the current prototype, but SaaS requires workspace ownership boundaries.

Recommended model:

- a `User` logs in
- a `Workspace` owns documents
- a `WorkspaceMember` grants access to users
- billing attaches to the workspace
- documents, audit records, and usage counters attach to the workspace

This allows:

- one paying account per workspace
- multiple members later without schema rewrite
- team billing and permissions

## Required data model changes

Add these new concepts.

### Workspace

Represents the customer account boundary.

Suggested fields:

- `id`
- `name`
- `slug`
- `ownerUserId`
- `planKey`
- `status`
- `createdAt`
- `updatedAt`

### WorkspaceMember

Represents membership and roles.

Suggested fields:

- `id`
- `workspaceId`
- `userId`
- `role`
- `createdAt`

Suggested initial roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

### BillingCustomer

Stores Stripe customer linkage.

Suggested fields:

- `id`
- `workspaceId`
- `stripeCustomerId`
- `email`
- `createdAt`
- `updatedAt`

### WorkspaceSubscription

Stores current subscription state.

Suggested fields:

- `id`
- `workspaceId`
- `stripeSubscriptionId`
- `stripePriceId`
- `stripeProductId`
- `planKey`
- `status`
- `currentPeriodStart`
- `currentPeriodEnd`
- `cancelAtPeriodEnd`
- `createdAt`
- `updatedAt`

### WorkspaceUsagePeriod

Tracks billable or enforceable usage by billing period.

Suggested fields:

- `id`
- `workspaceId`
- `periodStart`
- `periodEnd`
- `documentCount`
- `scanCount`
- `storageBytes`
- `memberCountSnapshot`
- `createdAt`
- `updatedAt`

### PlanEntitlement

Optional as a database table.

For v1, keep plan definitions in code and only persist subscription state.

Recommended code-owned entitlements:

- `maxActiveDocuments`
- `maxMonthlyScans`
- `maxMembers`
- `canUsePinProtection`
- `canUseBranding`
- `canUseApi`

## Existing model changes

Transition these existing records away from single-owner assumptions.

### User

Keep `User`, but stop treating it as the sole business account boundary.

### Document

Add:

- `workspaceId`
- optional `createdByUserId`

Keep `ownerId` only temporarily during migration if needed.

Long term, documents should authorize through workspace membership rather than direct owner matching.

### AuditLog

Add:

- `workspaceId`
- optional `actorMembershipId`

This keeps audit queries aligned with the paying customer boundary.

## Auth and onboarding changes

The current `/setup` flow is first-owner bootstrap logic.

That must change for SaaS.

Recommended onboarding target:

1. Public signup is allowed.
2. New user creates a workspace during onboarding.
3. Workspace starts on:
   - free trial, or
   - free starter workspace, or
   - immediate paid checkout
4. User lands in dashboard scoped to that workspace.

Recommended v1:

- allow public signup
- create one default workspace during onboarding
- require plan selection before meaningful production usage

## Free plan versus free trial

Recommended default:

- free trial for 7 to 14 days
- no permanent free tier at launch

Reason:

- permanent free plans often attract abuse in document workflows
- trials are easier to understand operationally
- support and storage cost stays more predictable

If a free tier is needed later, keep it constrained:

- very low document cap
- very low monthly scan cap
- watermarking or restricted branding

## SaaS authorization model

Move from:

- "does this user own the document?"

To:

- "is this user a member of the document's workspace, and does their role allow this action?"

Recommended permission examples:

- workspace owner/admin can manage billing
- workspace owner/admin can upload and process documents
- member can view document workspace depending on role

Keep billing permissions narrower than document permissions.

## Entitlement enforcement

Before allowing key actions, check workspace entitlements.

Gate at least:

- create document
- process document
- invite member
- enable branded verification page
- use PIN protection if that becomes a paid feature

Suggested enforcement points:

- server actions
- route handlers
- dashboard summaries

Never enforce plan limits in client-only code.

## Recommended app routes to add

Add product and billing routes:

- `/pricing`
- `/billing`
- `/billing/success`
- `/billing/cancel`

Add Stripe route handlers:

- `/api/stripe/checkout`
- `/api/stripe/customer-portal`
- `/api/stripe/webhooks`

Add onboarding routes if needed:

- `/signup`
- `/onboarding`

## Dashboard changes for SaaS

Update the dashboard shell and copy away from "owner-only" language.

Replace language like:

- owner workspace
- owner session
- first owner setup

With language like:

- workspace
- team
- billing
- members

This must happen in both UI copy and authorization code.

## Recommended billing UI scope for v1

Build only the essentials:

- pricing page with monthly and yearly options
- current plan display in dashboard billing page
- upgrade button
- manage billing button
- usage summary

Do not build:

- custom invoice history UI
- custom tax logic UI
- custom proration explainer UI
- internal plan editor

Stripe-hosted surfaces cover most of this early.

## Billing source of truth

Use this ownership model:

- Stripe is source of truth for payment state
- app database is source of truth for entitlements currently granted to a workspace

When webhook state changes:

1. verify webhook signature
2. load Stripe object IDs
3. update `WorkspaceSubscription`
4. recompute effective plan access
5. revalidate affected billing pages

## Failure and downgrade behavior

Define this before implementation.

Recommended behavior:

- if payment fails, preserve read access for a short grace period
- block new processing and new uploads during unpaid or canceled states after grace period
- do not delete customer documents automatically

This is safer and less hostile than instant lockout.

## Storage and cost control

Billing and storage design should reduce operational surprises.

Recommended defaults:

- private storage only
- strict file size limits
- track per-workspace storage bytes
- surface storage usage on billing page
- keep delete and archival behavior explicit

Do not offer unlimited storage in v1.

## Analytics and product signals

Track business metrics in addition to audit events.

Suggested metrics:

- trial started
- pricing page viewed
- checkout started
- checkout completed
- workspace activated
- first document uploaded
- first document processed
- first successful verification scan
- upgrade initiated
- upgrade completed
- churned subscription

Audit logs are not the same as SaaS product analytics.

## Concrete repo implementation plan

Implement the SaaS transition in these slices.

### Slice A: Product and copy realignment

Goals:

- add `/pricing`
- replace owner-only marketing copy
- reframe app around workspace-based document control

Done when:

- homepage, dashboard shell, and billing surfaces use SaaS language consistently

### Slice B: Workspace schema

Goals:

- add `Workspace`
- add `WorkspaceMember`
- attach documents to workspace
- attach audit logs to workspace

Done when:

- authorization can be expressed through workspace membership

### Slice C: Onboarding migration

Goals:

- replace first-owner bootstrap model with public signup
- create default workspace on onboarding
- redirect into workspace-scoped dashboard

Done when:

- new users can self-serve into the app without manual bootstrap

### Slice D: Stripe foundation

Goals:

- install Stripe SDK
- add env vars
- add billing server modules
- add Checkout Session creation route
- add Customer Portal route
- add webhook route

Done when:

- a workspace can start a subscription and webhook state persists locally

### Slice E: Plan and entitlement enforcement

Goals:

- define plan config in code
- check limits before document creation and processing
- block over-limit work with clear errors

Done when:

- plan state materially changes what the workspace can do

### Slice F: Billing dashboard

Goals:

- add `/billing`
- show current plan
- show limits and current usage
- provide upgrade and manage-billing actions

Done when:

- users can understand and manage billing without support help

### Slice G: Multi-member groundwork

Goals:

- add member invitations later if needed
- keep schema and authorization ready for team expansion

Done when:

- the system no longer assumes one direct document owner forever

## Suggested implementation order relative to current roadmap

Do not interrupt document-core correctness for premature billing work.

Recommended sequence:

1. finish document workflow correctness
2. complete testing hardening
3. then start SaaS conversion

If billing must begin earlier, do only:

- schema design
- pricing page
- Stripe wiring scaffolding

Do not deeply refactor auth and ownership mid-stage unless necessary.

## Risks to avoid

- bolting Stripe onto a single-owner schema
- adding plan checks only in UI
- using browser success redirects as payment truth
- making free tier too generous
- promising unlimited storage
- rewriting all document logic before introducing workspace compatibility layers

## Recommended next implementation prompt

If this plan is accepted, the next planning artifact should be a bounded execution file such as:

- `plans/saas-stage-01-workspace-and-billing-foundation.md`

That file should define the first concrete implementation step:

- workspace schema
- workspace membership authorization helper
- Stripe env contract
- billing route skeletons

## Reference links

- Stripe subscriptions overview: https://docs.stripe.com/subscriptions
- Stripe Checkout for subscriptions: https://docs.stripe.com/billing/subscriptions/set-up-subscription
- Stripe customer portal: https://docs.stripe.com/billing/subscriptions/integrating-customer-portal
- Stripe pricing table: https://docs.stripe.com/payments/checkout/pricing-table
