import { singletonGetter } from "@/common/singleton"

export class StyleInjector {
  constructor(private root: HTMLElement | null) {}

  public setRoot(root: HTMLElement) {
    this.root = root
  }

  public injectStyles(styles: { use: Function }) {
    if (!this.root) {
      throw new Error("Root element is not set")
    }

    styles.use({ target: this.root })
  }
}

export const getStyleInjector = singletonGetter(() => new StyleInjector(null))
