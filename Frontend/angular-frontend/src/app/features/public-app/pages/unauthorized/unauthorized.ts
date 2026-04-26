import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.html',
  styleUrls: ['./unauthorized.css'],
  imports: [RouterLink],
  standalone: true
})
export class Unauthorized {
  constructor(private router: Router) {}

}