import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BlobDownloaderService {
  private readonly doc = inject(DOCUMENT);

  download(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = this.doc.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    this.doc.body.appendChild(a);
    a.click();
    this.doc.body.removeChild(a);
    URL.revokeObjectURL(url); // free memory
  }
}
