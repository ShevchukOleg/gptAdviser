import { createHash } from 'crypto';

export class Guard {
  private correctPassword: string;
  private suspects = new Map<number, { date: number; attempt: number; id: number }>();
  private bloked: number[] = [];
  private authorizedUsers: number[] = [];
  constructor(corePass: string) {
    this.correctPassword = corePass;
  }

  public checkPassword(password: string, userID: number): boolean {
    const result = this.checkPassHash(password) ? (this.authorizedUsers.push(userID), true) : false;
    console.log(String(password) === this.correctPassword, this.authorizedUsers);
    return result;
    // return String(password) === this.correctPassword ? (this.authorizedUsers.push(userID), true) : false;
  }

  private checkPassHash(passValue: string): boolean {
    const start = Date.now();
    const encryptedSalt = String(start).split('');
    function salt(pass: string): string {
      const processEncryptedSalt = [...encryptedSalt];
      const passCharList = pass.split('');
      const encryptedPassCharList = [];
      const encryptingIndexes = [2, 3, 5, 8, 13, 21];
      while (encryptedPassCharList.length < 22) {
        if (encryptingIndexes.includes(encryptedPassCharList.length)) {
          encryptedPassCharList.push(passCharList.shift());
        } else if (encryptedPassCharList.length === 0 || encryptedPassCharList.length === 20) {
          encryptedPassCharList.push('S');
        } else if (encryptedPassCharList.length === 1) {
          encryptedPassCharList.push('H');
        } else {
          encryptedPassCharList.push(processEncryptedSalt.shift());
        }
      }
      const hash = createHash('sha512');
      hash.update(encryptedPassCharList.join());
      return hash.digest('hex');
    }
    const hashCorePass = salt(this.correctPassword);
    const hashUserInputPass = salt(passValue);

    return hashCorePass === hashUserInputPass;
  }

  public isAuthorized(userID: number): boolean {
    return this.authorizedUsers.includes(userID);
  }

  public isBlocked(userID: number): boolean {
    return this.bloked.includes(userID);
  }

  public getSuspectAttempt(userID: number): number {
    return this.suspects.get(userID)?.attempt ?? 0;
  }

  public isUserSuspected(userID: number) {
    return this.suspects.has(userID);
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

  public banUser(userID: number): void {
    this.bloked.push(userID);
  }
}
