import { assertNonNullable } from '../misc'
import { ElementBuilder } from './ElementBuilder'

export type Tab<K extends string> = {
  id: K
  content: () => Promise<HTMLElement>
}

export async function createTabs<K extends string>(tabs: Tab<K>[]) {
  const contentMap = new Map<string, HTMLElement>()
  const tabContainer = new ElementBuilder('div').build()

  let currentTabId = tabs[0].id
  const initialContent = await tabs[0].content()
  initialContent.setAttribute('tab-id', currentTabId)

  contentMap.set(currentTabId, initialContent)
  tabContainer.appendChild(initialContent)

  const changeTab = async (tabId: K) => {
    if (tabId === currentTabId) return

    let content = contentMap.get(tabId)
    contentMap.get(currentTabId)!.style.display = 'none'

    if (content) {
      content.style.display = 'block'
    } else {
      content = await tabs.find((tab) => tab.id === tabId)?.content()
      assertNonNullable(content)

      contentMap.set(tabId, content)
      tabContainer.appendChild(content)
    }

    currentTabId = tabId
  }

  return {
    changeTab,
    tabs: tabContainer,
  }
}
