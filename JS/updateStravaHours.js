// Script pour mettre à jour automatiquement les heures de vélo depuis Strava

async function updateVeloHours() {
  try {
    // Vérifier si la config est complète
    if (
      !window.STRAVA_CONFIG ||
      !window.STRAVA_CONFIG.clientId ||
      !window.STRAVA_CONFIG.clientSecret ||
      window.STRAVA_CONFIG.clientSecret === "YOUR_CLIENT_SECRET_HERE" ||
      !window.STRAVA_CONFIG.refreshToken ||
      window.STRAVA_CONFIG.refreshToken === "YOUR_REFRESH_TOKEN_HERE"
    ) {
      console.info(
        "ℹ️ Strava non configuré. Les heures de vélo affichées proviennent du JSON."
      );
      return null;
    }

    // Créer l'instance d'authentification
    const auth = new StravaAuth(
      window.STRAVA_CONFIG.clientId,
      window.STRAVA_CONFIG.clientSecret,
      window.STRAVA_CONFIG.refreshToken
    );

    // Obtenir un token valide
    const accessToken = await auth.getValidAccessToken();

    // Créer l'instance Strava avec le token frais
    const strava = new StravaIntegration(
      accessToken,
      window.STRAVA_CONFIG.athleteId
    );

    // Date de début: 15 septembre 2023
    const startDate = "2023-09-15";
    // Date de fin: maintenant
    const endDate = new Date().toISOString().split("T")[0];

    // Récupérer toutes les activités de vélo
    const activities = await strava.getAllActivitiesInRange(startDate, endDate);

    // Calculer le total d'heures
    const stats = strava.calculateStatsFromActivities(activities);
    const totalHours = Math.round(stats.moving_time / 3600);

    console.log(`✅ Heures de vélo depuis le 15/09/2023: ${totalHours}h`);
    console.log(`📊 Distance totale: ${(stats.distance / 1000).toFixed(2)} km`);
    console.log(`🚴 Nombre de sorties: ${activities.length}`);

    return {
      hours: totalHours,
      distance: stats.distance,
      activities: activities.length,
    };
  } catch (error) {
    console.error("❌ Erreur complète:", error);

    if (error.message.includes("401")) {
      console.error("❌ Authentification Strava échouée.");
      console.error("Vérifiez que:");
      console.error("1. Votre refresh_token est correct");
      console.error(
        "2. Votre application Strava a les permissions 'activity:read_all'"
      );
      console.error("3. Le token n'a pas été révoqué sur Strava");
    } else {
      console.error("❌ Erreur:", error.message);
    }
    console.info("ℹ️ Utilisation des heures du JSON.");
    return null;
  }
}

// Exporter pour utilisation
window.updateVeloHours = updateVeloHours;
