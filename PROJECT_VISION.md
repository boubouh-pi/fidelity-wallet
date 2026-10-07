# Fidelity Wallet - Project Vision

## What Fidelity Wallet Is

Fidelity Wallet is a SaaS platform that provides digital loyalty programs to restaurants and, over time, other businesses. The platform is operated by Fidelity Wallet. Each restaurant is a client with its own loyalty program and management dashboard.

The product combines a digital loyalty card for Apple Wallet and Google Wallet with a web dashboard where the restaurant manages its program. It is not a loyalty product owned by one restaurant.

## Business Model

Fidelity Wallet provides the technology and operates the platform. Fidelity Wallet initially onboards each restaurant, creates and configures its loyalty card, sets up the initial loyalty program, and manages technical wallet integrations.

The restaurant is the client. It uses its Fidelity Wallet dashboard to operate its own program, including customers, loyalty progress, rewards, promotions, analytics, and the settings Fidelity Wallet makes available.

Restaurants cannot initially redesign their card. Fidelity Wallet controls the initial card appearance and configuration. Restaurant-controlled visual customization may be considered later.

## The Three Actors

- **Fidelity Wallet:** The platform provider. It creates and supports restaurant accounts, configures initial cards and programs, operates wallet integrations, and manages the overall platform.
- **Restaurant:** A paying/client business using Fidelity Wallet. It has its own card, loyalty program, customers, rewards, promotions, analytics, and dashboard.
- **Restaurant Customer:** The restaurant's end customer. They receive and use that restaurant's loyalty card, primarily through Apple Wallet or Google Wallet. They do not need a Fidelity Wallet account or a dedicated Fidelity Wallet mobile app.

In provider-side discussions, a Fidelity Wallet "customer" usually means a restaurant/business client. In a restaurant dashboard, "Customers" means that restaurant's end customers enrolled in its loyalty program. Use the label "Restaurants" or "Business clients" for provider-facing account lists to avoid ambiguity.

## Fidelity Wallet Responsibilities

- Create and onboard restaurant/business accounts.
- Create and initially configure each restaurant's digital loyalty card and program.
- Manage technical integrations with Apple Wallet and Google Wallet.
- Manage restaurant accounts and provide support.
- Maintain a provider-side view of all restaurant/business clients and the Fidelity Wallet loyalty cards configured for them.
- Monitor and operate the platform globally through a future internal admin platform.
- Decide which program settings restaurants are allowed to manage.

## Restaurant Responsibilities

From its own dashboard, a restaurant can:

- View its loyalty card and program details.
- View customers and manage loyalty progress.
- Manage rewards and promotions.
- Review program analytics.
- Manage its account and settings, including only the loyalty parameters Fidelity Wallet allows it to change.

The restaurant does not initially create its card from scratch or redesign its visual appearance.

## Customer Experience

The restaurant invites a customer to add the restaurant's loyalty card to Apple Wallet or Google Wallet. The customer uses that card for the restaurant's loyalty program; they do not install a separate Fidelity Wallet app or create a Fidelity Wallet account. Wallet integrations are part of the product direction but are not implemented in the current prototype.

## Core Value Proposition

Fidelity Wallet provides restaurants with digital loyalty cards that work with Apple Wallet and Google Wallet, while giving each restaurant a web dashboard to manage its loyalty program.

## Restaurant Dashboard

The current product priority is the restaurant-facing dashboard. It should consistently communicate both roles: Fidelity Wallet is the provider, and the selected restaurant is the client account being managed.

The dashboard sections are:

- Dashboard
- Loyalty Card
- Customers
- Rewards
- Promotions
- Analytics
- Settings

The active restaurant/business should be identifiable throughout the dashboard. Its customers and program data must remain scoped to that business. Restaurant users can manage promotions and explicitly permitted program settings, but cannot initially redesign the card.

## Fidelity Wallet Admin Platform

A separate internal/provider platform may eventually support restaurant creation and onboarding, account management, initial card and program configuration, wallet integrations, platform monitoring, support, and global settings.

At minimum, the provider experience needs a portfolio view listing all restaurant/business clients that have Fidelity Wallet cards, with their account status and card/program association. This view is distinct from the restaurant dashboard and is not part of the current MVP. Do not add provider-only navigation or capabilities to the restaurant interface as a shortcut.

## Multi-Restaurant Architecture

Fidelity Wallet must support many restaurant clients. Each restaurant has its own loyalty card, loyalty program, customers, rewards, promotions, and analytics. A restaurant must never see another restaurant's records.

The current prototype uses restaurant-scoped routes such as `/r/[restaurantId]` and service calls that receive a restaurant ID. Keep data access scoped to the active restaurant as the app grows. Route IDs and mock services are not authentication or authorization; real access control must be enforced server-side when accounts and a backend are introduced.

Use generic domain concepts such as Restaurant, Business, LoyaltyProgram, LoyaltyCard, Customer, Reward, and Promotion. Restaurant is the current MVP client type; keep the model open to other business clients without building a generalized multi-industry system prematurely.

"Chez Marcel" is fictional demonstration data only. It is not Fidelity Wallet, the platform owner, or a hard-coded business assumption. Other mock businesses demonstrate that the product is multi-restaurant. The current root redirect to a demo restaurant is only a prototype convenience, not a production tenant-selection or access-control model.

## Loyalty Card

Each restaurant has a digital loyalty card configured initially by Fidelity Wallet. The restaurant dashboard shows the card concept, program rules, sample loyalty progress, reward information, and relevant details. The card belongs to the restaurant's program, not to Fidelity Wallet as a customer-facing universal card.

For the current prototype, use mock data and show a representative preview. Do not imply that Apple Wallet or Google Wallet integrations are operational until they are built. Card visual customization is not an MVP capability; later customization may allow a restaurant to change its logo, colors, branding, or other approved visual elements.

## Current MVP

- A restaurant-facing dashboard for the selected restaurant client.
- Mock/demo restaurants and restaurant-scoped mock data.
- Dashboard overview and navigation for card, customers, rewards, promotions, analytics, and settings.
- A loyalty card preview that communicates the restaurant's program and provider-managed initial design.
- Clear indication of which restaurant account is being managed.

Some dashboard sections may remain placeholders while the product foundation is established.

## Future Features

- Restaurant onboarding and the Fidelity Wallet internal admin platform.
- Account authentication, roles, and server-side authorization.
- Persistent backend storage and operational restaurant data.
- Apple Wallet and Google Wallet pass creation, distribution, and updates.
- Customer, loyalty progress, reward, promotion, analytics, and account-management workflows.
- Optional, controlled restaurant card customization.
- Support for additional business types beyond restaurants when validated.

## What Is Explicitly Out of Scope for Now

- Apple Wallet integration.
- Google Wallet integration.
- Authentication and production authorization.
- Payments and subscriptions.
- The full Fidelity Wallet internal admin platform.
- Restaurant visual card customization.
- Complex backend infrastructure.

## Important Product Principles

- Fidelity Wallet is the provider/platform; restaurants are its clients.
- Restaurants are Fidelity Wallet's customers; "Customers" inside a restaurant dashboard are the restaurant's loyalty members.
- Fidelity Wallet initially creates and configures each restaurant's card and loyalty program.
- Restaurants manage their program through their own dashboard, including promotions and only the loyalty settings allowed to them.
- Restaurants cannot initially redesign their card; customization is a possible later feature.
- Every restaurant owns a separate set of customers, rewards, promotions, loyalty program, and analytics.
- The platform must support many restaurant clients; never treat Chez Marcel or any one restaurant as the product itself.
- Customers use the restaurant's card in Apple Wallet or Google Wallet and do not need a dedicated Fidelity Wallet mobile app or account.
- Keep the restaurant dashboard focused on restaurant operations. Keep provider administration separate.
- Build only what supports the validated MVP. Do not over-engineer hypothetical future needs.
- Demo data must be clearly understood as demo data, never as platform identity or a domain rule.

## Technical Architecture

The current foundation is Next.js 16 App Router, TypeScript, Tailwind CSS 4, and lucide-react. The restaurant dashboard uses a dynamic restaurant route, a shared restaurant layout, typed domain models, and a service layer currently backed by mock data.

Keep restaurant-specific data access behind the service layer and pass the active restaurant identity into reads and mutations. As the backend is added, enforce tenant isolation and authorization on the server. Do not add database, deployment, or multi-tenant infrastructure before the product needs it.

The current prototype is not a production-secure multi-tenant system: it has no authentication, authorization, wallet integrations, or persistent backend.

## Development Rules

- Preserve the distinction between the platform provider, restaurant clients, and restaurant customers.
- Keep restaurant dashboard routes and data scoped to a restaurant/business identifier.
- Use generic domain types and avoid hard-coding "Chez Marcel" outside demo data and demo-specific copy.
- Treat card appearance and initial program configuration as Fidelity Wallet-managed; expose only explicitly approved restaurant controls.
- Keep provider-admin concerns out of restaurant-facing navigation and workflows.
- Keep the provider's all-restaurants/card portfolio separate from restaurant loyalty-member management.
- Use mock data for the prototype, and make its demo nature clear where it could be mistaken for real account data.
- Prefer small, direct changes over speculative abstractions or infrastructure.
- Do not implement out-of-scope features without revisiting the product priorities.

## Open Questions

- What is the initial commercial model: subscription, per-location pricing, transaction-based pricing, or another model?
- Will one client account represent one restaurant location, or can it contain multiple locations?
- Which loyalty parameters can restaurants change in the MVP, and which always require Fidelity Wallet support?
- Which loyalty mechanics are required first: stamps, points, visits, spend, or a combination?
- What customer enrollment, consent, privacy, and data-retention policies will apply?
- Which Apple Wallet and Google Wallet integration approach and operational workflows will be used?
- What restaurant roles and permissions are needed after authentication is introduced?
- Which business types beyond restaurants should be supported, and when should the domain model generalize?