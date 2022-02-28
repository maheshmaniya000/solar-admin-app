import { HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UrlEncodeInterceptor implements HttpInterceptor {
  /**
   * Same browser do not encode url path (example Safari).
   * This Interceptor encode path of url that is not yet encoding.
   *
   * Example:
   *   from:   http://www.domain.edu:2333/pat:234/to/video|id/filename.ext?a=q|1
   *   is path for encoding:   /pat:234/to/video|id/filename.ext
   *   output: http://www.domain.edu:2333/pat%3A234/to/video%7Cid/filename.ext?a=q|1
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let url;
    try {
      url = new URL(req.urlWithParams);
    } catch (err) {
      url = new URL(req.urlWithParams, location.origin);
    }

    const urlPath = url.pathname;
    const newUrlPath = urlPath
    .split('/')
    .map(pathPart => {
      if (pathPart.indexOf('%') === -1) {
        return encodeURIComponent(pathPart);
      } else {
        return pathPart;
      }
    })
    .join('/');

    let origin = url.origin;
    if (url.href.indexOf(location.origin) > -1) {origin = '';}

    const queries = {};
    url.search.replace(/(\?|&)([^&]+)=([^&]*)/g, (all, a, key, val) => {
      queries[key] = decodeURIComponent(val);
    });

    return next.handle(req.clone({
      url: origin + newUrlPath,
      params: new HttpParams({ fromObject: queries})
    }));
  }
}
