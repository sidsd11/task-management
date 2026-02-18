1) Install all the node_modules in both folders (client and server) using "npm i" or "npm install" command.
2) Create .env file in both folders.
   a) In client, add VITE_BACKEND_URL variable and give your link of your backend server.
   b) In server, add:
     i) MONGODB_URI: Your MongoDB database connection string
     ii) PORT: Port number on which you want to start your server
     iii) JWT_SECRET: Add any random text of your own choice
     iv) SMTP_USER, SMTP_PASS, SENDER_EMAIL: Create an account on any SMTP provider, then you'll find these three values from there.
3) Start both server and client using "npm run server" and "npm run dev" respectively.
4) You can create an account and then verify that account using OTP.
5) You can create, edit, delete tasks and mark their status as Pending/In-progress/Completed.
