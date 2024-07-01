Chatee

![chatee](https://github.com/simplito/privmx-chatee0/assets/160479989/9a8f1195-a324-4d6d-8352-4d5a736cec3e)

Chatee is a chat application that provides you with full end-to-end encryption using the **PrivMX Endpoint**.

## Description

Chatee provides you with all the basic chat features, such as group chats or attaching files. All the data exchanged in Chatee is end-to-end encrypted, meaning that only the end users are able to read (decrypt) their messages. Even the hosting providers are not able to access the users' data.

Chatee differentiates two types of users - Staff and regular users. The first account you set up is a Staff account, which means that you're able to manage the access to your app - inviting users and granting them different permissions.

You invite users by sending them an invitation token generated inside the app. Before generating a token you can decide whether the account will have Staff permissions or be a regular user. Regular users can create new chats only with Staff members. Staff can add chats with all the users in the server, regardless of their status.

Chat is in real-time. You can send text messages and files up to 50 MB.

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
3. On **[PrivMX Cloud](https://privmx.cloud)**

    - create an Organization and copy it's API URL
    - create a Solution and copy it's ID
    - inside a Solution create new Access Key
    - Copy your **SOLUTION_ID**, **API_URL**, **ACCESS_KEY** and **ACCESS_KEY_SECRET** to **.env.local**.
    - **NEXT_PUBLIC_BACKEND_URL** should be your server URL. For example **<http://localhost:3000>** if running in dev mode

4. Generate random **JWT_SALT** and **OWNER_TOKEN** and fill in your .env.file
    - You can run the following command in the terminal to generate these values: `openssl rand -base64 20`
5. Run **npm install**

6. Run **npm run dev**

### Domain system & first user

Chatee has a subdomain system integrated.

1. Create an Owner Token \
   1.1 Navigate to /owner/create-token. \
   1.2 Create a password for your owner panel. This will generate your owner token, which you will use to sign in. 

2. Sign In to the Owner Panel \
   2.1 Go to /owner/sign-in. \
   2.2 Sign in using the owner token generated in Step 1. 

3. Create a New Domain \
   3.1. If you are in a development environment, the application defaults to a "test" domain so create one with the link "test" \
   So the urls: '<http://test.localhost:3000> and <http://localhost:3000/> should work. \
   3.2. Copy the generated invite token 

4. Create your first admin user \
   4.1 Go to /sign-up and create your account \
   4.2 Log in 

(Check **middleware.ts**)

If run in production environment the localhost redirects to /home. If you try to access a subdomain that does not exist it redirects you to /domain-not-found.

After creating a subdomain you can access the [http://subdomain.localhost/](http://subdomain.localhost/) With the invitation token returned from the /api/new-domain endpoint, you can create the first user. Go to /sign up and register.

Afterwards, you can generate more invitation tokens as a Staff user. Click on the domain name in the navigation bar and generate more tokens.

You can choose whether the given invitation token registers the user as Staff or regular user.

#### Creating threads

When creating threads (chat rooms) you are given a list of all the users from your domain.  
Staff users can create chats with all the users in the domain.  
Regular users can create chats only with Staff.
