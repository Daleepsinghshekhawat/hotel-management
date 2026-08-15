```# Hotel Management System 
– Interview Explanation

My  StayEase project is a comprehensive, full-stack multi-vendor hotel management platform that 
I developed using **React.js, Node.js,express.js, and MongoDB**. The frontend is optimized with **Vite** for speed.
The main purpose of the platform is to allow users to **search hotels, check room availability, apply coupons, and make bookings**, while providing separate dashboards for vendors and super admins to manage their respective operations.

##Roles
The system has four primary roles: **User, Admin , Hotel Owner, and Super Admin**. 
I implemented strict **Role-Based Access Control (RBAC)** and **backend authorization** so each role can access only the features 
and data they are authorized to use. 
I also maintain strict **data isolation**, so one hotel owner cannot access 
or modify another owner's hotel, rooms, or financial analytics.

##Problems
One of the most important features is the **booking concurrency system**. A major problem in hotel booking is double-booking 
when two users try to reserve the same room at almost the same time. To solve this, when a user starts checkout,
 I create a **TempBooking** record that temporarily locks the room. If the user doesn't complete the transaction in time, 
 I use **Node-Cron** to automatically release the room back to the available pool. Before creating the final booking,
the backend again validates the room availability.


I also implemented a complete **vendor onboarding workflow**. A new hotel vendor submits a request to join
 the platform, which is stored with a pending status. The **Super Admin reviews and approves or rejects** the request.
  Once approved, the vendor can manage their specific hotels, rooms, and view their analytics.

For authentication, I used **JWT (JSON Web Tokens) and bcrypt** for secure, stateless session management, 
along with **OTP-based authentication** using **NodeMailer**. Protected APIs use custom authentication 
and authorization middleware to verify the user, their role, and their resource ownership before allowing any database operation.

Another important part of the project is **data management and search optimization**. 
I implemented structured relational models mapping **States to Districts to Cities**, allowing users 
to execute extremely fast and accurate geographic search queries. 

For handling media and documents, I integrated third-party tools to improve performance. 
I use **Cloudinary** for seamless and optimized image uploads, and **PDFKit** for dynamically generating 
downloadable booking receipts and invoices for guests. 


The platform also supports a **dynamic coupon engine** where vendors can create custom discount codes
 that are validated in real-time at checkout, along with comprehensive booking history for users.


Overall, this project is much more than a basic CRUD application because it includes **RBAC, 
authentication, concurrency-safe booking, multi-tenant data isolation, geographic search optimization,
 and third-party API integrations**. Through this project, I gained practical experience in building
  a complete full-stack application and solving real-world problems related to **booking consistency,
   authorization, and complex business logic**.```
