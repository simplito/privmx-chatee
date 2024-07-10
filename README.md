<div align="center">
   <h1>
      Chatee
   </h1>
<p>
Chatee is a chat application that provides you with full end-to-end encryption using the <b>PrivMX Endpoint</b>.
</p>
</div>

![chatee](https://github.com/simplito/privmx-chatee0/assets/160479989/9a8f1195-a324-4d6d-8352-4d5a736cec3e)

## Description

Chatee provides you with all the basic chat features, such as group chats or attaching files. All the data exchanged in Chatee is end-to-end encrypted, meaning that only the end users are able to read (decrypt) their messages. Even the hosting providers are not able to access the users' data.

Chatee differentiates two types of users - Staff and regular users. The first account you set up is a Staff account, which means that you're able to manage the access to your app - inviting users and granting them different permissions.

You invite users by sending them an invitation token generated inside the app. Before generating a token you can decide whether the account will have Staff permissions or be a regular user. Regular users can create new chats only with Staff members. Staff can add chats with all the users in the server, regardless of their status.

Chat is in real-time. You can send text messages and files up to 50 MB.

## What do you need?

#### **MongoDB Instance**

You need a **MongoDB** Instance with replica sets for transactions.

You can use the `docker-compose-mongo.yml` from this repository.
Run following command to start mongoDB docker in your local environment:

```sh
docker-compose -f docker-compose-mongo.yml up
```

This will create a mongodb instance running on `0.0.0.0:27017` with a replica set named **rs0**

#### **Node.js**

You need Node.js preferably version **20.10 or higher**

## How to run?

1. Create file **.env.local** in root of your project.
2. You need to have a running MongoDb instance with a replica set from previous section.

    Fill in the replica set name and MongoDB URI in your **./.env.local**

    ```ENV
    REPLICA_SET=rs0
    MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=$REPLICA_SET
    ```

3. On **cloud-public**

    - create an Organization and copy it's `Api URL` (more about PrivMX Platform can be found [here](https://docs.privmx.cloud/bridge))
    - create a Solution and copy it's ID
    - inside a Solution create new Access Key (more about keys generation can be found [here](https://docs.privmx.cloud/keys/))

4. In your `./.env.local`

    Copy your **PLATFORM_URL**, **INSTANCE_ID**, **SOLUTION_ID**, **ACCESS_KEY** and **ACCESS_KEY_SECRET** to **./.env.local**.
    You can find them in [privmx.cloud](https://privmx.cloud/) panel. \
    **NEXT_PUBLIC_BACKEND_URL** should be your server URL. For example **<http://localhost:3000>** if running in dev mode

    ```env
    PLATFORM_URL="{Replace with your PrivMX Platform organization's Api URL}"

    SOLUTION_ID="{Replace with your Solution ID}"
    ACCESS_KEY="{Replace with Solution's PubKey}"
    ACCESS_KEY_SECRET="{Replace with Solution's Secret}"

    INSTANCE_ID="{Replace with instance id}"

    NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
    CLOUD_URL=https://api.privmx.cloud/main
    ```

5. Generate random **JWT_SALT** using for example openssl:

    ```sh
    openssl rand -base64 20
    ```

    and fill in your `./.env.file`

    ```
    JWT_SALT={Replace with generated salt}
    ```

6. Run

    ```sh
    npm install
    npm run dev
    ```

7. Open dev server on <http://localhost:3000>

### Alternative way using our docker-compose-production.yml

1. Create the same .env file but name it **.env.production.local**
2. Run docker-compose

```sh
   docker-compose -f docker-compose-production.yml up
```

### Domain system & first user

Chatee has a subdomain system integrated. It allows you create groups of users separated from each other. Each domain has their own set of users, admins and chat rooms. With this, you can easily divide your organization into sub-teams, or provide each of your users with their own sub-domain.
To get started with Chatee you need to set up a minimum of one domain.

1. Create an Owner Token. As the owner of the application instance, you have access to the Owner Panel which allows you to manage domains. \
   1.1 Navigate to <http://localhost:3000/owner/create-token>. \
   1.2 Create a strong password for your owner panel.

2. Sign In to the Owner Panel \
   2.1 You will be redirected to <http://localhost:3000/owner/sign-in>. \
   2.2 Sign in using the owner token created in Step 1.

3. Create a New Domain \
   3.1. If you are in a development environment, the application defaults to a "test" domain so create one with the link "test" \
   After that you will have access to the urls: <http://test.localhost:3000> and <http://localhost:3000/>. \
   3.2. Copy the generated invite token

4. Create your first admin user \
   4.1 Go to /sign-up and create first admin account inside domain \
   4.2 Log in

(Check **middleware.ts**)

If run in production environment the localhost redirects to /home. If you try to access a subdomain that does not exist it redirects you to /domain-not-found.

After creating a subdomain you can access the "http://{subdomain}.localhost:3000/" With the invitation token returned from creating a domain, you can create the first user. Go to /sign up and register.

Afterwards, you can generate more invitation tokens as a Staff user. Click on the domain name in the navigation bar and generate more tokens.

You can choose whether the given invitation token registers the user as Staff or regular user.

#### Creating threads

When creating threads (chat rooms) you are given a list of all the users from your domain.  
Staff users can create chats with all the users in the domain.  
Regular users can create chats only with Staff.

### License

[MIT](./LICENSE)
