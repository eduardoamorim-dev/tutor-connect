const { google } = require("googleapis");
const userRepository = require("../repositories/userRepository");
const logger = require("../config/logger");

require("dotenv").config();

const googleCalendarService = {
  createOAuth2Client(user) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });
    return oauth2Client;
  },

  async refreshTokenIfNeeded(user) {
    if (!user.googleTokenExpiry || !user.googleRefreshToken) return user;

    const now = new Date();
    const expiry = new Date(user.googleTokenExpiry);
    const fiveMinutes = 5 * 60 * 1000;

    if (expiry.getTime() - now.getTime() > fiveMinutes) {
      return user;
    }

    try {
      logger.info(`Renovando token Google para usuario ${user._id}`);
      const oauth2Client = this.createOAuth2Client(user);
      const { credentials } = await oauth2Client.refreshAccessToken();

      await userRepository.updateGoogleTokens(user._id, {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || user.googleRefreshToken,
        expiry_date: credentials.expiry_date,
      });

      user.googleAccessToken = credentials.access_token;
      if (credentials.refresh_token) {
        user.googleRefreshToken = credentials.refresh_token;
      }
      if (credentials.expiry_date) {
        user.googleTokenExpiry = new Date(credentials.expiry_date);
      }

      logger.info(`Token Google renovado com sucesso para usuario ${user._id}`);
      return user;
    } catch (error) {
      logger.error("Erro ao renovar token Google:", { error: error.message, userId: user._id });
      return user;
    }
  },

  async createEvent(user, eventData) {
    if (!user.googleAccessToken) return null;

    try {
      user = await this.refreshTokenIfNeeded(user);
      const oauth2Client = this.createOAuth2Client(user);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const response = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        resource: eventData,
        sendUpdates: "all",
      });

      return {
        googleEventId: response.data.id,
        htmlLink: response.data.htmlLink,
        linkMeet: response.data.conferenceData?.entryPoints?.[0]?.uri,
        conferenceStatus: response.data.conferenceData?.entryPoints?.[0]?.uri ? "success" : "failure",
      };
    } catch (error) {
      logger.error("Erro ao criar evento no Calendar:", { error: error.message });
      return null;
    }
  },

  async deleteEvent(user, eventId) {
    if (!user.googleAccessToken || !eventId) return false;

    try {
      user = await this.refreshTokenIfNeeded(user);
      const oauth2Client = this.createOAuth2Client(user);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      await calendar.events.delete({
        calendarId: "primary",
        eventId,
        sendUpdates: "all",
      });

      return true;
    } catch (error) {
      logger.error("Erro ao cancelar evento no Calendar:", { error: error.message });
      return false;
    }
  },
};

module.exports = googleCalendarService;
