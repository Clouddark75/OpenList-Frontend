import {
  Button,
  Icon,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@hope-ui/solid"
import { createMemo, For, Show } from "solid-js"
import { useLink, useT } from "~/hooks"
import { getExternalPreviews } from "~/store"
import { FaSolidAngleDown } from "solid-icons/fa"
import { convertURL, usePreviewObj } from "~/utils"

export const OpenWith = () => {
  const t = useT()
  const store = usePreviewObj()
  const previews = createMemo(() => {
    return getExternalPreviews(store.obj.name)
  })
  const { currentObjLink } = useLink()
  return (
    <Show when={previews().length}>
      <Menu>
        <MenuTrigger
          as={Button}
          colorScheme="success"
          rightIcon={<Icon as={FaSolidAngleDown} />}
        >
          {t("home.preview.open_with")}
        </MenuTrigger>
        <MenuContent>
          <For each={previews()}>
            {(preview) => (
              <MenuItem
                as="a"
                target="_blank"
                href={convertURL(preview.value, {
                  raw_url: store.raw_url,
                  name: store.obj.name,
                  d_url: store.raw_url,
                })}
              >
                {preview.key}
              </MenuItem>
            )}
          </For>
        </MenuContent>
      </Menu>
    </Show>
  )
}
