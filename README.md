<div align="center">
   <h1>
      Chatee
   </h1>
<p>
Chatee is a chat application that provides you with full end-to-end encryption using the <b>PrivMX Platform (https://privmx.cloud)</b>.
</p>
</div>

![chatee](https://github.com/simplito/privmx-chatee0/assets/160479989/9a8f1195-a324-4d6d-8352-4d5a736cec3e)

## Chatee basics

Chatee Application consist of two parts: **Web Application** and **Server Backend** (both written in Next.js).
**Server Backend** utilizes MongoDB for persistent data storage and manages **domain names** and **users accounts**.

> **NOTE**
>
> While Chatee is multi-domain software, during testing on localhost, you can only use the default test domain.

All messages and files sent are managed by the <b>[PrivMX Platform](https://privmx.cloud)</b>, ensuring they are properly encrypted and are not stored in your server environment.

## Chatee features

Chatee provides essential chat features, including group chats and file attachments. All data exchanged within Chatee is end-to-end encrypted, meaning that only end users can read (decrypt) their messages. It means that ever platform hosting provider cannot access user data.

Chatee classifies users into three types:

-   Owner: Manages domains.
-   Staff: Manages users within a domain.
-   Regular users: Engage with the app.

When you create your initial account within a domain, it automatically becomes a Staff account. As a Staff member, you have the authority to invite users and assign varying permissions for app access.

All Staff users can invite others by sending them an invitation token generated inside the app. Before generating a token you can decide whether the account will have Staff permissions or be a regular user. Regular users can create new chats only with Staff members. Staff can add chats with all the users in the server, regardless of their status.

Chats occur in real-time. You can send text messages and files up to 50 MB.

## What do you need?

Chatee Requirements:

-   node.js in 20.10 version
-   MongoDB instance or Docker, which allows to run our docker compose file to run the database.
-   account on <b>[PrivMX Platform](https://privmx.cloud)</b>

## How to start?

To begin, clone this repository. It includes the Chatee sources along with various helpful files

#### **MongoDB Instance**

You need a **MongoDB** Instance with replica sets for transactions.

For demo purpose, you can use the `docker-compose-mongo.yml` from this repository. Run following command to start mongoDB docker in your local environment:

```sh
docker-compose -f docker-compose-mongo.yml up
```

This will create a mongodb instance running on `0.0.0.0:27017` with a replica set named **rs0**

> To proceed, ensure that Docker is up and running.

#### **Node.js**

You need Node.js preferably version **20.10 or higher**

## How to run this software?

### .env.local file

Create file `.env.local` in root of your project. You can copy **.env.example** or use snippets available in <b>[PrivMX Platform](https://privmx.cloud)</b>

This is an example `.env.local` file

```ENV
REPLICA_SET=rs0
MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=$REPLICA_SET
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

CLOUD_URL=https://api.privmx.cloud/main

PLATFORM_URL="{Replace with your PrivMX Platform organization's Api URL}"
SOLUTION_ID="{Replace with your Solution ID}"
INSTANCE_ID="{Optionally replace with instance id}"
ACCESS_KEY="{Replace with Solution's PubKey}"
ACCESS_KEY_SECRET="{Replace with Solution's Secret}"

JWT_SALT="{Generate JWT_SALT}"
```

### Populate file `.env.local` with proper data.

You can find all the necessary data to populate your `.env.local` file on the <b>[PrivMX Platform](https://privmx.cloud)</b>. The following lines explain which variables you need and how to use them.

##### MongoDB Settings

While using Docker and provided `docker-compose-mongo.yml` file, you can use following lines describing connection to Your local MongoDB database.

```ENV
REPLICA_SET=rs0
MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=$REPLICA_SET
```

Feel free to adjust these settings if you opt for a custom setup

##### Next Public Backend URL

For demo purposes You are runnign this software in localhost (port 3000). `NEXT_PUBLIC_BACKEND_URL` configures software default address. In production environment You can use fully qualified domain name.

```ENV
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

##### Cloud URL

Cloud URL is the URL used by the Chatee Backend for PrivMX Platform management. Especially it needs to create special [Context's](https://docs.privmx.cloud/faq#what-is-a-context) for each subdomain You will create. This context will store all users encrypted data.

Cloud URL is constant for all PrivMX Cloud accounts.

```ENV
CLOUD_URL=https://api.privmx.cloud/main
```

##### Other information from <b>[PrivMX Platform](https://privmx.cloud)</b>

Now it's time to create cloud container for All Your Encrypted data. It is called a [Solution](https://docs.privmx.cloud/faq#what-is-a-solution), which can be created inside an Organization.

**All things You need to do inside PrivMX Platform**:

-   **Create an Organization**:
    -   An Organization in PrivMX represents your company scope.
    -   If you haven’t already, create an Organization within the platform.
    -   When you log in to the PrivMX Platform panel for the first time, the quickstart guide will prompt you to create an Organization.
-   **Copy the API URL (Platform URL)**:

    -   Each Organization has a unique URL for connecting to the PrivMX Platform.
    -   This URL serves as the entry point for PrivMX Endpoint Library.
    -   Copy it's `API URL` and `Instance ID`.

        > **Note**
        >
        > `INSTANCE_ID` is optional to copy, since it is used only for accessing stat's data and You dont need this in demo setup.

-   **Create a Solution**

    -   Solution is always considered as Application Counterpart, so it can be called, for example, `Chatee test`.
    -   Go to Solution list by selecting `Solutions` from Pllatfom's sidebar.
    -   Copy it's `Solution ID`

-   **Create an Access Key**
    -   Access keys can be created automatically when You select `Create Access Keys` checkbox in previous step.
    -   If You need to create it manually, go to selected Solutions Details and select `Access Keys` tab.
    -   Click `Create an Access Key` and copy it and its `Acces Key Secret`
    -   Access Keys allows Your Backend to connect to PrivMX Platform, create Contexts and assign User public keys.

Basically You need to fill following `.env.local` variables:

```ENV
PLATFORM_URL="{Replace with your PrivMX Platform organization's Api URL}"
SOLUTION_ID="{Replace with your Solution ID}"
INSTANCE_ID="{Optionally replace with instance id}"
ACCESS_KEY="{Replace with Solution's PubKey}"
ACCESS_KEY_SECRET="{Replace with Solution's Secret}"
```

> **Note**
>
> All this data **can be copied at once** at the end of Creating Solution procedure, assuming that You will check "Create Access Key checkbox". Then you need to click **`Copy Access Key and solution settings as .env`** and paste it to your `.env.local` file

> **Note**
>
> Although PrivMX Platform #quickstart suggests You to create contexts manually, don't do that. Chatee deals with it automatically

##### JWT Salt

Generate random **JWT_SALT** using for example openssl:

```sh
openssl rand -base64 20
```

and paste it to your `.env.local`

```
JWT_SALT="{Replace with generated salt}"
```

### Running an app

In new terminal go to project root folder.

```sh
npm install
npm run dev
```

Check your app at <http://localhost:3000>

## Domain system and Owner Panel

As mentioned before Chatee has a subdomain system integrated.
Running it in localhost environment allows You only to use one domain called `test`.

In production, Chatee enables you to create user groups that are separated from each other. Each domain has its own set of users, administrators, and chat rooms. With this feature, you can easily divide your organization into sub-teams or provide each user with their own sub-domain.

> Additionally, each domain utilizes a separate context on Privmx Cloud, which is created automatically.

> **Important**
>
> To get started with Chatee you need to set up a minimum of one domain.

1. Create an `Owner Token`. As the owner of the application instance, you have access to the Owner Panel which allows you to manage domains.

    1.1 Navigate to <http://localhost:3000/owner/create-token>.

    1.2 Create a strong password for your owner panel (remember or store it safely).

2. Sign In to the Owner Panel

    2.1 You will be redirected to <http://localhost:3000/owner/sign-in>.

    2.2 Sign in using the owner token created in Step 1.

3. Create a New Domain

    3.1. To run Chatee locally, create a domain named `test`, which will serve as the default instance. All connections to either <http://test.localhost:3000> or <http://localhost:3000> will use this domain.

    3.2. Copy the generated `invite token`

    > This step is crucial because it’s the only way to create the first Staff user within a domain. The token used for this purpose is hashed in MongoDB, so you won’t be able to access it again.

### First user within a domain

You have a `invite token`, so You can create first Staff user of Your domain.

> After creating an `invite token` in the previous step, make sure to share it with the first Staff user of the domain. This way, you’ll be all set whenever you need to send it out.

1. Create your first Staff user

    1.1 Go to <http://localhost:3000/sign-up> and create first Staff account inside domain

    1.2 Log in

2. The Staff user can easily create additional invitations for other Staff members and Regular users using the straightforward Chatee interface: click on the domain name in the navigation bar and generate more tokens.

### Creating threads

When creating threads (chat rooms) you are given a list of all the users from your domain.  
Staff users can create chats with all the users in the domain.  
Regular users can create chats only with Staff.

### Production notes

#### Alternative way using our docker-compose-production.yml

1. Create the same .env file but name it **.env.production.local**
2. Run docker-compose

```sh
   docker-compose -f docker-compose-production.yml up
```

#### Subdomains

If run in production environment the localhost redirects to <http://yourdomain.com/home>. If you try to access a subdomain that does not exist it redirects you to <http://yourdomain.com/domain-not-found>.

After creating a subdomain you can access the <http://{subdomain}.yourdomain.com/> With the invitation token returned from creating a domain, you can create the first user. Go to <http://{subdomain}.yourdomain.com/sign-up> and register.

## License

[MIT](./LICENSE)
