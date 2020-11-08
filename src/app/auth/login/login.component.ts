import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, {validators: [Validators.required, Validators.email, Validators.minLength(3)]}),
      password: new FormControl(null, {validators: [Validators.required]}),
    });
  }

  onLogin() {
    if (!this.form.valid) {
      return;
    }
    this.authService.login(this.form.value.email, this.form.value.password);
    this.form.reset();
  }

}
