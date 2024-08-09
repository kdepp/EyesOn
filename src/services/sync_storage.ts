import { IStorage } from "./types"

export class SyncStorage implements IStorage {
  constructor(private key: string) {}

  public get(): Promise<string | null> {
    return chrome.storage.sync.get(this.key).then((obj) => obj[this.key] ?? null)
  }

  public set(value: string): Promise<void> {
    return chrome.storage.sync.set({ [this.key]: value })
  }

  public remove(): Promise<void> {
    return chrome.storage.sync.remove(this.key)
  }
}
