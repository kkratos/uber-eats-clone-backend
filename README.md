# Uber Eats

The Backend of uber eats clone.

## User Model

- id
- createAt
- updatedAt
- email
- password
- role(client | owner | delivery)

## user CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

# Restaurant Model
- name
- category
- address
- coverImage

- Create Dish
- Edit Dish
- Delete Dish


- Orders CRUD
- Orders Subscription (owner, customer, delivery)
    - Pending Orders(s:newOrder)(t:createOrder(newOrder))
    - Order Status (Customer, Delivery, Owner) (s:orderUpdate)(t:editOrder
    (orderUpdate))
    - Pending Pickup Order(Delivery)(s:orderUpdate)(t:editOrder(orderUpdate))

- Payments (CRON)