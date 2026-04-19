import { ElementBuilder } from './ElementBuilder'

export type DialogConfiguration = {
  title: string
  lightDismissable?: boolean
}

export class Dialog {
  private readonly dialog: HTMLDialogElement
  constructor(configuration: DialogConfiguration, content: HTMLElement) {
    this.dialog = new ElementBuilder('dialog')
      .addStyle((style) => (style.borderRadius = '0.25rem'))
      .addChild(new ElementBuilder('h3').addText(configuration.title))
      .build()
    this.dialog.appendChild(content)

    this.dialog.closedBy = configuration.lightDismissable ? 'any' : 'closerequest'
  }

  show() {
    this.dialog.showModal()
  }

  close() {
    this.dialog.close()
  }

  createShowButton(label: string): HTMLButtonElement {
    const controlButton = new ElementBuilder('button').addText(label).build()
    controlButton.command = 'show-modal'
    controlButton.commandForElement = this.dialog

    return controlButton
  }

  getDOMElement(): Readonly<HTMLDialogElement> {
    return this.dialog
  }
}
