          ┌───────────────┐
          │ API Gateway   │
          └─────┬─────────┘
                │
   ┌────────────┴─────────────┐
   │                          │
┌───────┐                 ┌────────┐
│ Identity│                 │ Product│
│ Service │                 │ Service│
└───────┘                 └────────┘
   │                          │
┌────────┐                 ┌───────────┐
│ Cart   │                 │ Wishlist  │
│ Service│                 │ Service   │
└────────┘                 └───────────┘
   │                          │
   └─────────────┬────────────┘
                 │
            ┌───────────────┐
            │ Checkout      │
            │ Service       │
            └───────────────┘
                 │
          ┌──────┴───────┐
          │ Order Service│
          └──────┬───────┘
                 │
          ┌──────┴────────┐
          │ Shipping      │
          │ Service       │
          └───────────────┘
Redis is used for caching frequently accessed data (cart, checkout previews).

Features
User Management: Sign up, login, JWT-based authentication, role-based access
Products: CRUD operations, product images, pricing
Cart & Wishlist: Add/remove products, view cart, wishlist management
Checkout: Cart validation, coupon/discount application, preview total
Order Management: Place order, track status (PENDING → PAID → FULFILLED)
Shipping: Integration with shipping service
Coupon & Discounts: Create, validate, update, delete, and list coupons
Caching: Redis caching for fast data retrieval


