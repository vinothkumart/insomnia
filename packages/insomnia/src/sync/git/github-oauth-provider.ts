import { v4 } from 'uuid';

import { AuthService } from '../../common/auth-service';
import { getApiBaseURL, getAppEnvironment, getAppWebsiteBaseURL, getGitHubGraphQLApiURL } from '../../common/constants';
import { axiosRequest } from '../../network/axios-request';

export const GITHUB_TOKEN_STORAGE_KEY = 'github-oauth-token';
export const GITHUB_GRAPHQL_API_URL = getGitHubGraphQLApiURL();
const getOauthPageURL = () => getAppWebsiteBaseURL() + '/oauth/github';

/**
 * This cache stores the states that are generated for the OAuth flow.
 * This is used to check if a command to exchange a code for a token has been initiated by the app or not.
 * More info https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
 */
const statesCache = new Set<string>();

export function generateAuthorizationUrl() {
  const state = v4();
  // const scopes = ['repo', 'read:user', 'user:email'];
  // const scope = scopes.join(' ');
  // console.log(getAppWebsiteBaseURL());
  // console.log(getAppEnvironment());

  // const url = new URL(getOauthPageURL());

  statesCache.add(state);

  // url.search = new URLSearchParams({
  //   scope,
  //   state,
  // }).toString();
  const authService:AuthService = new AuthService();

  const url = authService.getAuthenticationURL(state) + '&type=github';
  console.log(url);

  return url.toString();
}

// export function getAuthenticationURL() {
//   return (
//     'https://' +
//         authService.getAuthenticationURL() +
//         '/authorize?' +
//         'audience=' +
//         authService.getApiIdentifier() +
//          '&' +
//         'scope=openid profile offline_access&' +
//         'response_type=code&' +
//         'client_id=' +
//         authService.getClientId() +
//         '&' +
//         'redirect_uri=' +
//         authService.redirectUri()
//   );
// }

export async function exchangeCodeForToken({
  code,
  state,
}: {
  code: string;
  state: string;
}) {
  console.log('code', code);
  console.log('state', state);
  if (!statesCache.has(state)) {
    throw new Error(
      'Invalid state parameter. It looks like the authorization flow was not initiated by the app.'
    );
  }
  statesCache.delete(state);
  setAccessToken(code);

  // return axiosRequest({
  //   url: getApiBaseURL() + '/v1/oauth/github',
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data: {
  //     code,
  //   },
  // }).then(result => {
  //   statesCache.delete(state);
  //   setAccessToken(result.data.access_token);
  // });
}

export function getAccessToken() {
  return localStorage.getItem(GITHUB_TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string) {
  return localStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, token);
}

export function signOut() {
  localStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
}
