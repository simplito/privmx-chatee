# Chatee

Chatee is a chat application that provides you with full end-to-end encryption using the **PrivMX Endpoint**

## What do you need?

#### **MongoDB Instance**

You need a **MongoDB** Instance with replica sets for transactions.

You can use the `docker-compose-mongo.yml` from this repository.

This will create a mongodb instance running on `0.0.0.0:27017` with a replica set named **rs0**

#### **Node.js**

You need Node.js preferably version **20.10 or higher**

## How to run?

1. Copy **.env.example** to **.env.local**
2. You need to have a running MongoDb instance with a replica set
    - Fill in the replica set name and MongoDB URI in your **.env.local**
3. On **cloud-public**

    - create an organization
    - create an instance
    - create a solution
    - Copy your **SOLUTION_ID**, **SEVER_ID**, **API_URL**, and **CLOUD_DEV_TOKEN** to **.env.local**.
    - **NEXT_PUBLIC_BACKEND_URL** should be your server URL. For example **http://localhost:3000** if running in dev mode

4. Generate random **JWT_SALT** and **OWNER_TOKEN** and fill in your .env.file
    - You can run the following command in the terminal to generate these values: `openssl rand -base64 20`
5. Run **npm install**

6. Run **npm run dev**

### Domain system & first user

Chatee has a subdomain system integrated.
You can create subdomains by fetching the **/api/new-domain** endpoint. It returns an invitation token for the first staff user in this domain.

The first thing you have to do is create a domain.
The application defaults to the **test** subdomain in development environment.
If run on development environment create a subdomain named **test**.

So the url: 'http://test.localhost:3000 and http://localhost:3000/ should work.

(Check **middleware.ts**)

If run in production environment the localhost redirects to /home.
If you try to access a subdomain that does not exist it redirects you to /domain-not-found.

After creating a subdomain you can access the http://subdomain.localhost/
With the invitation token returned from the /api/new-domain endpoint, you can create the first user.
Go to /sign up and register.

Afterwards, you can generate more invitation tokens as a staff user.
Click on the domain name in the navigation bar and generate more tokens.


You can choose whether the given invitation token registers the user as a staff or normal member.


### Creating threads

When creating threads (chat rooms) you are given a contact list from your domain. \
Staff users are given all members from the domain. \
Non-staff users are given only the staff members from the domain.

Chat is in real-time. You can send text messages and files up to 50 MB.
