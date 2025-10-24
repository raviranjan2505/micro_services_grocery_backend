
Features
User Management: Sign up, login, JWT-based authentication, role-based access
Products: CRUD operations, product images, pricing
Cart & Wishlist: Add/remove products, view cart, wishlist management
Checkout: Cart validation, coupon/discount application, preview total
Order Management: Place order, track status (PENDING → PAID → FULFILLED)
Shipping: Integration with shipping service
Coupon & Discounts: Create, validate, update, delete, and list coupons
Caching: Redis caching for fast data retrieval

Redis is used for caching frequently accessed data (cart, checkout previews).




| Service          | Port | Description                          |
| ---------------- | ---- | ------------------------------------ |
| API Gateway      | 3000 | Entry point for all API requests     |
| Identity Service | 5001 | User authentication & JWT management |
| Product Service  | 5000 | Product catalog management           |
| Cart Service     | 5002 | User cart management                 |
| Checkout Service | 5003 | Checkout flow with coupon & discount |
| Order Service    | 5004 | Order creation, status updates       |
| Shipping Service | 5005 | Shipping and delivery integration    |
| Wishlist Service | 5006 | User wishlist management             |
| Coupon Service   | 5007 | Coupons & discounts management       |



Future Improvements
Payment gateway integration (Stripe, Razorpay)
Email/SMS notifications for orders
Analytics & reporting service
RabbitMQ event-driven workflows (shipping, notifications)
Docker + Kubernetes deployment



