import axios from 'axios';
import jwtDecode from 'jwt-decode';
import os from 'os';
import url from 'url';
import { v4 } from 'uuid';

import { getApiIdentifier, getAuth0DomainURL, getClientId, isDevelopment } from './constants';

export class AuthService {

  keytarService = 'electron-openid-oauth';
  keytarAccount = os.userInfo().username;

  accessToken:any = null;
  profile:any = null;
  refreshToken:any = null;

  getAccessToken() {
    return this.accessToken;
  }

  getProfile() {
    return this.profile;
  }

  getAuthenticationURL(code:String) {
    const defaultProtocol:String = `rage${isDevelopment() ? 'dev' : ''}`;
    const fullDefaultProtocol:String = `${defaultProtocol}://`;
    const redirectUri:String = `${fullDefaultProtocol}oauth/github/authenticate`;
    return (
      getAuth0DomainURL() +
          '/authorize?' +
          'audience=' +
           getApiIdentifier() +
           '&' +
          'response_type=code&' +
          'code=' +
          code +
          '&' +
          'redirect_uri=' +
          redirectUri
    );
  }

}
