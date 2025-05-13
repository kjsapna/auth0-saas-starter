## Installation for Local Development

### Prerequisites

1. Node.js v20 or later is required to run the bootstrapping process. 

2. You must have [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or a comparable package manager installed in your development environment. These instructions assume that you're using `npm`, which is automatically included as part of the Node.js installation from prerequisite 1.

3. Create a new Auth0 tenant. **This is important!** Using a new Auth0 tenant for this sample application ensures you don't encounter any conflicts due to existing configuration in an existing tenant.
   
   [Create Tenants](https://auth0.com/docs/get-started/auth0-overview/create-tenants) in the Auth0 docs if you need help.

   Once you've created a tenant, nothing else needs to be done inside Auth0 - you can return to this README.md and begin completing the steps below.

### Step One: Clone and install dependencies

1. Clone this repo to your development environment. To do this, navigate to a directory where you want to work in a terminal program, and run the following command:

   ```shell
   git clone https://bitbucket.org/nextgenhealthcareinc/mcs-delegated-admin-app/src
   ```

2. Navigate into the directory by typing the following command:

   ```shell
   cd mcs-delegated-admin-app
   ```

3. Install dependencies for the project using your favorite package manager. For example, if you're using npm, check that you're on the correct version of node:

   ```shell
   node -v
   ```
   This should return a version number higher than v20. If you have an earlier version installed, return to the prerequisites and follow step 1. 
   
   Otherwise, continue:

   ```shell
   npm install
   ```

4. Environment variable (.env)
    
    Add environment variable in the code

    



### Step Four: Run the  application

1. Run the development server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

   > Note: If you're running the application on a different port, adjust the provided localhost URL accordingly.

   You can proceed to interact with the app as if you were a user: create an account, navigate to the settings, explore the identity capabilities.

---

## B2B Identity Features to Explore

By clicking through the application's front-end, you can explore the management experience that your customers would have. This sample application comes preconfigured with key identity workflows that are crucial for anyone that wants their application to be adopted by business customers, so that you can focus on coding your own functionality instead.

### Sign up with Organziations
Each user that creates an account from scratch will be prompted to enter an organization name as part of their sign-up flow. Once an organization is created, users with admin roles can invite additional users who will automatically be added to the organization.

### User Management
Invite additional users, change users' roles (and thus what they have permission to do in the application), and delete users. You'll notice as you perform these operations in your app, you're changing the user database and organizations in your Auth0 tenant.

### Connections
Use the SSO tab in the settings section to connect an external IDP (eg, Okta WIC, Google Workforce, Azure AD, etc) via SAML or OIDC. This allows your business customers to set up their own Single Sign On connections right in your application. You can also optionally enable SCIM provisioning using the same connections.

### Security Policies
Configure multi-factor authentication (MFA) policies for your organization, including a selection of which MFA providers (eg, One-time Password, or Security Keys) your users are allowed to use. Optionally, you can configure email domains for which users be exempted from having to MFA in your app. This is useful when using SSO, and users are already completing MFA when they sign in to their workforce identity provider, so that they won't be prompted for a second MFA when they log in to your application.

### Organization Switching
Users can be invited to a company organization, but can also create their own hobby or personal organizations. This allows your app to handle scenarios like when contractors or external collaborators need to belong to multiple organizations, or when employees want to have their own personal accounts for experimentation or side projects. Switching contexts is easy.

### User Profile and Security
Your users can set their own user profile settings, set and reset their own passwords, and manage their own multi-factor authentication (MFA) enrollments. They can also manage and delete their own account data.

---



