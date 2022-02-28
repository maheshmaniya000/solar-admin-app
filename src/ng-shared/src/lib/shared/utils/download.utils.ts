import { MatSnackBar } from '@angular/material/snack-bar';

// TODO move to @solargis/types/api
export enum MimeType {
  CSV = 'text/csv',
  PDF = 'application/pdf',
  PNG = 'image/png',
  SVG = 'image/svg+xml',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = fileName;
  downloadLink.click();
}

export function downloadBase64File(base64File: any, fileName: string, mimeType = MimeType.PDF): void {
  downloadDataUrl('data:' + mimeType + ';base64,' + base64File, fileName);
}

export function downloadBinaryFile(res: any, fileName: string, headerType: string, snackBar?: MatSnackBar): boolean {
  const downloadLink = document.createElement('a');
  let blob;

  try {
    blob = new Blob([res], {type: headerType});
  } catch (e) {
      // TypeError old chrome and FF
      (window as any).BlobBuilder = (window as any).BlobBuilder
                                 || (window as any).WebKitBlobBuilder
                                 || (window as any).MozBlobBuilder
                                 || (window as any).MSBlobBuilder;
      if (e.name === 'TypeError' && (window as any).BlobBuilder) {
          const bb = new (window as any).BlobBuilder();
          bb.append(res.buffer);
          blob = bb.getBlob(headerType);
      } else if (e.name === 'InvalidStateError') {
          // InvalidStateError (tested on FF13 WinXP)
          blob = new Blob( [res.buffer], {type : headerType});
      } else {
          // We're screwed, blob constructor unsupported entirely
          const msg = 'Blob is not supported.';
          console.error(msg);

          if (snackBar) {
            snackBar.open(msg, null, { duration: 3000, panelClass: ['snackbarError', 'snackbarTextCenter'] });
            return false;
          } else {
            throw new Error(msg);
          }
      }
  }

  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = fileName;
  downloadLink.click();

  return true;
}

export function downloadCSV(file: string, name: string): void {
  const blob = new Blob([file], { type: `${MimeType.CSV};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, name);
}
