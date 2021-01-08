import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable, throwError } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "../models/user";
import * as Random from "random-js";

@Injectable({
  providedIn: "root",
})
export class UsersService {
  public users: User[] = [];

  public userColors = [
    "#006BA4",
    "#FF800E",
    "#ABABAB",
    "#595959",
    "#5F9ED1",
    "#C85200",
  ];

  private randomEngine = Random.browserCrypto;

  constructor(private http: HttpClient) {
    this.resume();
  }

  public login(username: string, password: string): Observable<User> {
    if (this.isAlreadyLoggedIn(username)) {
      return throwError("Already logged in");
    }

    return this.http
      .post(`${environment.url}/api-token-auth/`, {
        username,
        password,
      })
      .pipe(
        map((user: User) => {
          user.username = username;
          return user;
        })
      );
  }

  public assignPlayerIndexes(shuffle: boolean) {
    if (shuffle) {
      Random.shuffle(this.randomEngine, this.users);
    }

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].index = i;
    }
  }

  public setNumberOfUsers(val: number) {
    this.users = this.users.slice(0, val);

    Random.shuffle(this.randomEngine, this.userColors);

    for (let i = 0; i < val; i++) {
      if (!this.users[i]) {
        this.users[i] = new User();
      }
      this.users[i].color = this.userColors[i];
    }
  }

  public create(username, password) {
    return this.http.post(`${environment.url}/api/users/`, {
      username,
      password,
    });
  }

  public reset() {
    this.users = [];
  }

  public isAlreadyLoggedIn(username: string): boolean {
    return this.users.filter((u) => u.username === username).length > 1;
  }

  /*
    Persistence
  */

  public save() {
    localStorage.setItem("academy:users", JSON.stringify(this.users));
  }

  public resume() {
    this.users =
      JSON.parse(localStorage.getItem("academy:users")) || this.users;
  }
}
