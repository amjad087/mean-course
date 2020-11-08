import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
  if (typeof(control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const fObs = new Observable((observer: Observer<ValidationErrors | null>) => {
    fileReader.addEventListener('loadend', () => {
      const arr = new Uint8Array(fileReader.result as ArrayBufferLike).subarray(0, 4);
      let header = '';
      let isValid = false;

      for (let i = 0; i < 4; i++) {
        header += arr[i].toString(16);
      }

      // Checking for mime-type
      switch (header) {
        case '89504e47':
            isValid = true;
            break;
          case 'ffd8ffdb':
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
          isValid = false;
      }

      if (isValid) {
        observer.next(null);
      } else {
        observer.next({invalidMimeType: true});
      }
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file);
  });
  return fObs;
};
