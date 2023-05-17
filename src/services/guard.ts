export class Guard {
  private correctPassword: number;
  private suspects = new Map<number, { date: number; attempt: number; id: number }>();
  private bloked: number[] = [];
  private authorizationStatus = false;
  constructor(pass: number) {
    this.correctPassword = pass;
  }

  public checkPassword(password: number): boolean {
    this.authorizationStatus = password === this.correctPassword;
    console.log(password === this.correctPassword, this.authorizationStatus);
    return (this.authorizationStatus = password === this.correctPassword);
  }

  public isAuthorized(): boolean {
    return this.authorizationStatus;
  }

  public isBlocked(userID: number): boolean {
    return this.bloked.includes(userID);
  }

  public getSuspectAttempt(userID: number): number {
    return this.suspects.get(userID)?.attempt ?? -1;
  }

  public addSuspects(userID: number): boolean {
    if (this.suspects.has(userID)) {
      let { attempt } = this.suspects.get(userID) ?? { attempt: 3 };
      if (attempt <= 0) {
        this.bloked.push(userID);
        return false;
      }
      const newRecordUser = { date: Date.now(), attempt: --attempt, id: userID };
      this.suspects.set(userID, newRecordUser);
      return true;
    }
    const newRecordUser = { date: Date.now(), attempt: 2, id: userID };
    this.suspects.set(userID, newRecordUser);
    return true;
  }
}
