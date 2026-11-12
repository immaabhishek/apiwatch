const dns = require("node:dns").promises;
const ipaddr = require("ipaddr.js");
const http = require("node:http");
const https = require("node:https");
const axios = require("axios");

const ALLOWED_PROTOCOLS = ["http:", "https:"];

const BLOCKED_HOSTS = [
  "localhost",
  ".localhost",
  ".local",
  ".internal",
  ".test",
  ".home.arpa",
];

const isPublicIp = (address) => {
  try {
    const parsedIp = ipaddr.process(address);

    return parsedIp.range() === "unicast";
  } catch {
    return false;
  }
};

const getValidatedTarget = async (rawUrl) => {
  if (typeof rawUrl !== "string" || rawUrl.length > 2048) {
    throw new Error("Invalid URL");
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("URL credentials are not allowed");
  }

  const hostname = parsedUrl.hostname
    .replace(/^\[|\]$/g, "")
    .toLowerCase();

  if (!hostname) {
    throw new Error("Hostname is required");
  }

  if (
    BLOCKED_HOSTS.some(
      (blocked) =>
        hostname === blocked ||
        (blocked.startsWith(".") && hostname.endsWith(blocked))
    )
  ) {
    throw new Error("Local hostnames are not allowed");
  }

  let addresses;

  if (ipaddr.isValid(hostname)) {
    const parsedIp = ipaddr.process(hostname);

    addresses = [
      {
        address: parsedIp.toString(),
        family: parsedIp.kind() === "ipv4" ? 4 : 6,
      },
    ];
  } else {
    try {
      addresses = await dns.lookup(hostname, {
        all: true,
        verbatim: true,
      });
    } catch {
      throw new Error("Unable to resolve hostname");
    }
  }

  if (!addresses.length) {
    throw new Error("No IP addresses found");
  }

  if (addresses.some(({ address }) => !isPublicIp(address))) {
    throw new Error("Private or restricted IP addresses are not allowed");
  }

  return {
    parsedUrl,
    hostname,
    addresses,
  };
};

const validateMonitorUrl = async (url) => {
  const { parsedUrl } = await getValidatedTarget(url);

  return parsedUrl.href;
};

const safeAxiosRequest = async ({
  url,
  method = "GET",
  timeout = 10000,
}) => {
  const { parsedUrl, hostname, addresses } =
    await getValidatedTarget(url);

  method = method.toUpperCase();

  if (!["GET", "HEAD"].includes(method)) {
    throw new Error("Only GET and HEAD methods are allowed");
  }

  const pinnedLookup = (requestedHostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    const requested = requestedHostname
      .toLowerCase()
      .replace(/\.$/, "");

    if (requested !== hostname.replace(/\.$/, "")) {
      return callback(new Error("Hostname mismatch"));
    }

    if (options && options.all) {
      return callback(null, addresses);
    }

    const selected = addresses[0];

    return callback(
      null,
      selected.address,
      selected.family
    );
  };

  const httpAgent = new http.Agent({
    lookup: pinnedLookup,
  });

  const httpsAgent = new https.Agent({
    lookup: pinnedLookup,
  });

  try {
    return await axios({
      method,
      url: parsedUrl.href,
      timeout,

      httpAgent,
      httpsAgent,

      maxRedirects: 0,

      proxy: false,

      maxContentLength: 1024 * 1024,

      validateStatus: () => true,
    });
  } finally {
    httpAgent.destroy();
    httpsAgent.destroy();
  }
};

module.exports = {
  validateMonitorUrl,
  safeAxiosRequest,
};