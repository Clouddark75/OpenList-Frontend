import { HStack, VStack } from "@hope-ui/solid"
import { createMemo, Show, Suspense } from "solid-js"
import { Dynamic } from "solid-js/web"
import { FullLoading, SelectWrapper } from "~/components"
import { objStore } from "~/store"
import { useRouter } from "~/hooks"
import { Download } from "../previews/download"
import { OpenWith } from "./open-with"
import { getPreviews } from "../previews"

const File = () => {
  const { searchParams, setSearchParams } = useRouter()
  // Capture previews once for the current file and freeze them while an inner
  // preview is active. This prevents File.tsx from remounting the archive
  // preview component when archive.tsx mutates objStore.obj for inner files.
  let frozenPreviews: ReturnType<typeof getPreviews> | undefined
  const previews = createMemo(() => {
    if (objStore.isInnerPreview) {
      return frozenPreviews ?? getPreviews({ ...objStore.obj, provider: objStore.provider })
    }
    frozenPreviews = getPreviews({ ...objStore.obj, provider: objStore.provider })
    return frozenPreviews
  })
  const selectedPreviewKey = createMemo(() => searchParams["preview"] || "")
  const cur = createMemo(() => {
    const list = previews()
    if (list.length === 0) return undefined
    const selected = selectedPreviewKey()
    return list.find((p) => p.key === selected) || list[0]
  })

  return (
    <Show when={previews().length > 1} fallback={<Download openWith />}>
      <VStack w="$full" spacing="$2">
        <HStack w="$full" spacing="$2">
          <SelectWrapper
            alwaysShowBorder
            value={cur()?.key || ""}
            onChange={(key) => {
              setSearchParams({ preview: key }, { replace: true })
            }}
            options={previews().map((item) => ({
              value: item.key,
              label: item.name,
            }))}
          />
          <OpenWith />
        </HStack>
        <Suspense fallback={<FullLoading />}>
          <Dynamic component={cur()?.component} />
        </Suspense>
      </VStack>
    </Show>
  )
}

export default File
