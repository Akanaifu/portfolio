class StravaAuth {
  constructor(clientId, clientSecret, refreshToken) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getValidAccessToken() {
    // Si on a déjà un token valide, le retourner
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Sinon, obtenir un nouveau token
    return await this.refreshAccessToken();
  }

  async refreshAccessToken() {
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur refresh token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      console.log("✅ Nouveau token Strava obtenu");
      return this.accessToken;
    } catch (error) {
      console.error("❌ Erreur lors du refresh du token:", error);
      throw error;
    }
  }
}

window.StravaAuth = StravaAuth;
