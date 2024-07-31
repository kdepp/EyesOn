import { nanoid } from "nanoid"

export enum AppMode {
  Off = "off",
  Error = "error",
  Dev = "dev",
}

export function negateMode(mode: AppMode): AppMode {
  switch (mode) {
    case AppMode.Off:
      return AppMode.Dev

    case AppMode.Dev:
    case AppMode.Error:
      return AppMode.Off
  }
}

export type SiteOption = {
  id: string
  mode: AppMode
  isDomainLevel: boolean
  domain?: string
  urlRegexp?: string
  enabledFilterGroups?: string[]
}

export class SiteOptionStorage {
  private static readonly STORAGE_KEY = "site_options"

  public async getAll(): Promise<SiteOption[]> {
    const data = await chrome.storage.sync.get(SiteOptionStorage.STORAGE_KEY)
    return data[SiteOptionStorage.STORAGE_KEY] || []
  }

  public async add(option: Omit<SiteOption, "id">): Promise<void> {
    const list = await this.getAll()
    const opt = { ...option, id: nanoid() }

    list.push(opt)
    await this.setAll(list)
  }

  public async update(option: SiteOption): Promise<boolean> {
    const list = await this.getAll()
    const i = list.findIndex((o) => o.id === option.id)

    if (i === -1) {
      return false
    }

    list[i] = option
    await this.setAll(list)
    return true
  }

  public async delete(id: string): Promise<boolean> {
    const list = await this.getAll()
    const i = list.findIndex((o) => o.id === id)

    if (i === -1) {
      return false
    }

    list.splice(i, 1)
    await this.setAll(list)
    return true
  }

  public async matchURL(url: string): Promise<SiteOption[]> {
    const list = await this.getAll()
    const u = new URL(url)
    const domain = u.hostname

    return list.filter((o) => {
      if (o.isDomainLevel) {
        return o.domain?.toLowerCase() === domain.toLowerCase()
      }

      if (o.urlRegexp) {
        const re = new RegExp(o.urlRegexp, "i")
        return re.test(url)
      }

      return false
    })
  }

  public async getSiteOptionForURL(url: string): Promise<SiteOption | null> {
    const list = await this.matchURL(url)

    if (list.length === 0) {
      return null
    }

    const urlLevelOption = list.find((o) => !o.isDomainLevel)

    return !!urlLevelOption ? urlLevelOption : list[0]
  }

  private async setAll(options: SiteOption[]): Promise<void> {
    await chrome.storage.sync.set({ [SiteOptionStorage.STORAGE_KEY]: options })
  }
}
