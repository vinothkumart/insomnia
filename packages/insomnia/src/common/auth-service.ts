import axios from 'axios';
import jwtDecode from 'jwt-decode';
import keytar from 'keytar';
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

  async refreshTokens() {
    const refreshToken = await keytar.getPassword(this.keytarService, this.keytarAccount);

    if (refreshToken) {
      const refreshOptions:any = {
        method: 'POST',
        url: `https://${getAuth0DomainURL()}/oauth/token`,
        headers: { 'content-type': 'application/json' },
        data: {
          grant_type: 'refresh_token',
          client_id: getClientId(),
          refresh_token: refreshToken,
        },
      };

      try {
        const response = await axios(refreshOptions);

        this.accessToken = response.data.access_token;
        this.profile = jwtDecode(response.data.id_token);
      } catch (error) {
        await this.logout();

        throw error;
      }
    } else {
      throw new Error('No available refresh token.');
    }
  }

  async loadTokens(callbackURL:any) {
    const urlParts = url.parse(callbackURL, true);
    const query = urlParts.query;

    const exchangeOptions = {
      grant_type: 'authorization_code',
      client_id: getClientId(),
      code: query.code,
      redirect_uri: this.redirectUri,
    };

    const options:any = {
      method: 'POST',
      url: `https://${getAuth0DomainURL()}/oauth/token`,
      headers: {
        'content-type': 'application/json',
      },
      data: JSON.stringify(exchangeOptions),
    };

    try {
      const response = await axios(options);

      this.accessToken = response.data.access_token;
      this.profile = jwtDecode(response.data.id_token);
      this.refreshToken = response.data.refresh_token;

      if (this.refreshToken) {
        await keytar.setPassword(this.keytarService, this.keytarAccount, this.refreshToken);
      }
    } catch (error) {
      await logout();

      throw error;
    }
  }

  async logout() {
    await keytar.deletePassword(this.keytarService, this.keytarAccount);
    this.accessToken = null;
    this.profile = null;
    this.refreshToken = null;
  }

  getLogOutUrl() {
    return `https://${getAuth0DomainURL()}/v2/logout`;
  }
}
