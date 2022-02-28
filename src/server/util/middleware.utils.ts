
export function resolveRemoteIP(req, debug = false): string {
  const ips = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const [ip, ...forwardedIps] = ips.split(',').map(ipAddress => ipAddress.trim());

  if (debug && forwardedIps && forwardedIps.length) {
    console.log(`Resolved forwarded remote IP: ${ips} -> ${ip}`);
  }

  return ip;
}
