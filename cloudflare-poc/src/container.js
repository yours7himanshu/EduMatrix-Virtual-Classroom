import { Container, getContainer, switchPort } from "@cloudflare/containers";

const containerEnvironmentKeys = [
  "NODE_ENV",
  "PORT",
  "WS_PORT",
  "CORS_ORIGINS",
  "FRONTEND_URL",
  "MONGO_URI",
  "JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GIMINI_API_KEY",
  "LIVEKIT_URL",
  "LIVEKIT_API_KEY",
  "LIVEKIT_API_SECRET"
];

function getContainerEnvironment(env) {
  return Object.fromEntries(
    containerEnvironmentKeys
      .filter((key) => env[key] !== undefined)
      .map((key) => [key, env[key]])
  );
}

export class EduMatrixContainer extends Container {
  defaultPort = 5000;
  requiredPorts = [5000, 8080];
  sleepAfter = "30m";
  enableInternet = true;
  pingEndpoint = "/";

  async startWithEnvironment(envVars) {
    await this.startAndWaitForPorts({
      ports: this.requiredPorts,
      startOptions: { envVars }
    });
  }
}

export default {
  async fetch(request, env) {
    const container = getContainer(env.EDUMATRIX_CONTAINER, "staging");
    await container.startWithEnvironment(getContainerEnvironment(env));

    const url = new URL(request.url);
    const isRawWebSocket =
      request.headers.get("Upgrade")?.toLowerCase() === "websocket" &&
      !url.pathname.startsWith("/socket.io");

    return isRawWebSocket
      ? container.fetch(switchPort(request, 8080))
      : container.fetch(request);
  }
};