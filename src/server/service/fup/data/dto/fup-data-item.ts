/**
 * Entity which is saved/returned when saving/querying requests for protected resources
 */
export class FUPDataItem {
  ts: number;
  ip: string;
  ua: string;
  userJwt: any;
  sub: string;
  resName: string;

  allowed = false;

  constructor(
    ip: string,
    userAgent: string,
    userJwt: any,
    resourceName: string
  ) {
    this.ts = Date.now();

    this.ip = ip;
    this.ua = userAgent;

    this.userJwt = userJwt;
    if (this.userJwt) {
      this.sub = this.userJwt.sub;
    }
    this.resName = resourceName;
  }

  allow(): void {
    this.allowed = true;
  }
}
