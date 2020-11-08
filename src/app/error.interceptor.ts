import { ErrorComponent } from './error/error.component';
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(public dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'an unknown error occured!';
        if (error.error.message) {
          message = error.error.message;
        }
        this.dialog.open(ErrorComponent, { data: {message} });
        return throwError(error);
      })
    );
  }
}
