"use server"

import slugify from "@sindresorhus/slugify"
import { redirect } from "next/navigation"

import { managementClient, onboardingClient } from "@/lib/auth0"
import { ConnectionCreateOptionsPasswordPolicyEnum, ConnectionCreateStrategyEnum } from "auth0"
import { config } from "@/config"
import { PATHS } from "@/lib/constants"
import { Result, error, handleError } from "@/lib/utils"


export async function createOrganization(formData: FormData): Promise<Result> {
  const session = await onboardingClient.getSession()

  if (!session) {
    return redirect(PATHS.ONBOARDING.SIGNUP)
  }

  const organizationName = formData.get("organization_name")

  if (!organizationName || typeof organizationName !== "string") {
    return error("Organization name is required.")
  }

  let connection
  let organization

  try {
    const adDomain = formData.get("ad_domain");
    const username = formData.get("sa_user")
    const password = formData.get("sa_password")

    if (!adDomain || typeof adDomain !== "string") {
      return error("AD Domain name is required.")
    }

    if (!username || typeof username !== "string") {
      return error("Username is required.")
    }
    if (!password || typeof password !== "string") {
      return error("Password is required.")
    }

    connection = await createConnection(organizationName, adDomain, username, password);
    if (!connection) {
      throw new Error("Failed to create connection: No connection ID returned")
    }
    ; ({ data: organization } = await managementClient.organizations.create({
      name: slugify(organizationName),
      display_name: organizationName,
      metadata: {
        AD_Group: process.env.AD_GROUP
      },
      enabled_connections: [
        {
          connection_id: connection.id,
        },
        {
          connection_id: config.auth0.defaultConnectionId,
        },
      ],
    }))

    await managementClient.organizations.addMembers(
      {
        id: organization.id,
      },
      {
        members: [session.user.sub],
      }
    )

    await managementClient.organizations.addMemberRoles(
      {
        id: organization.id,
        user_id: session.user.sub,
      },
      {
        roles: [config.auth0.role.nextgenAdminId],
      }
    )

  } catch (error) {
    return handleError("create an organization", error)
  }

  const authParams = new URLSearchParams({
    organization: organization.id,
    returnTo: PATHS.DASHBOARD.ROOT,
  })

  redirect(`${PATHS.AUTH.LOGIN}?${authParams.toString()}`)
}

// Custom scripts for Auth0 connection
const CUSTOM_SCRIPTS = {
  login: `
    function login(email, password, callback) {
      const request = require('request');
      request.post({
        url: configuration.apiUrl + '/api/User/login',
        headers: {
          'content-type': 'application/json',
          'AD_domain': configuration.AD_domain,
          'SA_user': configuration.SA_user,
          'SA_password': configuration.SA_password
        },
        json: { username: email, password: password }
      }, function(err, response, body) {
        if (err) return callback(new Error('Login request failed: ' + err.message));
        if (response.statusCode === 404 || (body && body.success === false)) {
          return callback(new Error('Invalid credentials provided'));
        }
        if (!body || !body.data) {
          return callback(new Error('Invalid response from login API'));
        }
        callback(null, {
          user_id: body.data.user_id || email,
          email: email
        });
      });
    }
  `,
  create: `
    function create(user, callback) {
      const request = require('request');
      request.post({
        url: configuration.apiUrl + '/api/User',
        headers: {
          'content-type': 'application/json',
          'AD_domain': configuration.AD_domain,
          'SA_user': configuration.SA_user,
          'SA_password': configuration.SA_password
        },
        json: {
          Username: user.username,
          Password: user.password,
          Email: user.email,
          FirstName: user.firstName,
          LastName: user.lastName,
          Enabled: false,
          Name: user.firstName + ' ' + user.lastName
        }
      }, function(err, response, body) {
        if (err) return callback(new Error('User creation request failed: ' + err.message));
        if (response.statusCode === 404 || (body && body.success === false)) {
          return callback(new Error('Invalid credentials provided'));
        }
        if (!body || !body.data) {
          return callback(new Error('Invalid response from user creation API'));
        }
        callback(null, {
          user_id: body.data.user_id || email,
          email: user.email
        });
      });
    }
  `,
  verify: `
    function verify(email, callback) {
      const request = require('request');
      request.get({
        url: configuration.apiUrl + '/api/User/Verify/' + encodeURIComponent(email),
        headers: {
          'content-type': 'application/json',
          'AD_domain': configuration.AD_domain,
          'SA_user': configuration.SA_user,
          'SA_password': configuration.SA_password
        }
      }, function(err, response, body) {
        if (err) return callback(new Error('Verification request failed: ' + err.message));
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          return callback(new Error('Invalid response from verification API'));
        }
        if (response.statusCode === 404 || (data && data.success === false)) {
          return callback(new Error('Invalid user provided'));
        }
        if (!data) {
          return callback(new Error('Invalid response from verification API'));
        }
        callback(null, true);
      });
    }
  `,
  change_password: `
    function changePassword(email, newPassword, callback) {
      const request = require('request');
      request.post({
        url: configuration.apiUrl + '/api/User/changepassword',
        headers: {
          'content-type': 'application/json',
          'AD_domain': configuration.AD_domain,
          'SA_user': configuration.SA_user,
          'SA_password': configuration.SA_password
        },
        json: {
          username: email,
          newPassword: newPassword
        }
      }, function(err, response, body) {
        if (err) return callback(new Error('Password change request failed: ' + err.message));
        if (response.statusCode === 404 || (body && body.success === false)) {
          return callback(new Error('User not allowed. Contact System Admin.'));
        }
        if (!body) {
          return callback(new Error('Invalid response from password change API'));
        }
        callback(null);
      });
    }
  `,
  get_user: `
    function getByEmail(email, callback) {
      const request = require('request');
      request.get({
        url: configuration.apiUrl + '/api/User?username=' + encodeURIComponent(email),
        headers: {
          'content-type': 'application/json',
          'AD_domain': configuration.AD_domain,
          'SA_user': configuration.SA_user,
          'SA_password': configuration.SA_password
        }
      }, function(err, response, body) {
        if (err) return callback(new Error('User retrieval request failed: ' + err.message));
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          return callback(new Error('Invalid response from user retrieval API'));
        }
        if (response.statusCode === 404 || (data && data.success === false)) {
          return callback();
        }
        if (!data) {
          return callback();
        }
        callback(null, {
          user_id: data.user_id || email,
          email: email,
          username: data.username || email,
          firstName: data.firstName,
          lastName: data.lastName,
          name: data.name
        });
      });
    }
  `,
  delete: `
    function remove(id, callback) {
      const request = require('request');
      request.delete({
        url: configuration.apiUrl + '/api/User/' + encodeURIComponent(id),
        headers: {
          'content-type': 'application/json',
          'AD_domain': configuration.AD_domain,
          'SA_user': configuration.SA_user,
          'SA_password': configuration.SA_password
        }
      }, function(err, response, body) {
        if (err) return callback(new Error('User deletion request failed: ' + err.message));
        let data;
        try {
          data = JSON.parse(body);
        } catch (e) {
          return callback(new Error('Invalid response from user deletion API'));
        }
        if (response.statusCode === 404 || (data && data.success === false)) {
          return callback(new Error('User deletion failed'));
        }
        if (!data) {
          return callback(new Error('Invalid response from user deletion API'));
        }
        callback(null);
      });
    }
  `
};

const createConnection = async (name: string, adDomain: string, saUser: string, saPassword: string) => {
  const connectionConfig = {
    name,
    display_name: name,
    strategy: ConnectionCreateStrategyEnum.auth0,
    is_domain_connection: false,
    enabled_clients: [config.auth0.clientId, config.auth0.managementClientId],
    options: {
      passwordPolicy: ConnectionCreateOptionsPasswordPolicyEnum.good,
      password_complexity_options: {
        min_length: 8
      },
      password_history: {
        enable: true,
        size: 5
      },
      password_no_personal_info: {
        enable: true
      },
      validation: {
        username: {
          min: 3,
          max: 16
        }
      },
      enabledDatabaseCustomization: true,
      configuration: {
        AD_domain: adDomain,
        SA_user: saUser,
        SA_password: saPassword,
        apiUrl: config.api.middlewareUrl
      },
      customScripts: CUSTOM_SCRIPTS
    }
  };

  try {
    const response = await managementClient.connections.create(connectionConfig);
    console.log('Custom DB Connection created:', response);
    return response.data;
  } catch (error) {
    console.error("Failed to create connection:", error);
    throw error;
  }
};
