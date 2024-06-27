import { simpleGit } from "simple-git";
import { getCwdContext } from "../contexts";
import { Context } from "./Context";

export type GitContextData = { repository: string; id: string };

export class GitContext extends Context<GitContextData> {
  get simpleGit() {
    return simpleGit(getCwdContext().cwd);
  }

  async checkout({ branch, force }: { branch: string; force?: boolean }) {
    try {
      await this.simpleGit.checkout(branch);
    } catch (e) {
      if (force) {
        await this.simpleGit.checkout(["-b", branch]);
      } else {
        throw e;
      }
    }
  }
}
