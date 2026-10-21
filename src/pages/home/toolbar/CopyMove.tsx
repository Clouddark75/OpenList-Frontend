import { Checkbox, createDisclosure, VStack, Button } from "@hope-ui/solid"
import { createSignal, onCleanup } from "solid-js"
import { ModalFolderChoose, FolderTreeHandler } from "~/components"
import { useFetch, usePath, useRouter, useT } from "~/hooks"
import { selectedObjs, userCan } from "~/store"
import { bus, fsCopy, fsMove, handleRespWithNotifySuccess } from "~/utils"
import { CgFolderAdd } from "solid-icons/cg"

// Persistencia de preferencias (overwrite y follow_seed NO se persisten a propósito:
// son opciones destructivas / por operación, así que siempre arrancan desmarcadas)
const KEY_SKIP_EXISTING = "conflict-policy-skip-existing"
const KEY_MERGE = "conflict-policy-merge"

const loadBool = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === "true"
  } catch {
    return false
  }
}

const saveBool = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // localStorage no disponible: se ignora
  }
}

export const CreateFolderButton = (props: { handler?: FolderTreeHandler }) => {
  if (!userCan("write_content")) {
    return null
  }
  const t = useT()
  return (
    <Button
      leftIcon={<CgFolderAdd />}
      size="sm"
      onClick={() => props.handler?.startCreateFolder()}
    >
      {t("home.toolbar.mkdir")}
    </Button>
  )
}

export const Copy = () => {
  const t = useT()
  const { isOpen, onOpen, onClose } = createDisclosure()
  const [loading, ok] = useFetch(fsCopy)
  const { pathname } = useRouter()
  const { refresh } = usePath()
  const [overwrite, setOverwrite] = createSignal(false)
  const [skipExisting, setSkipExisting] = createSignal(loadBool(KEY_SKIP_EXISTING))
  const [merge, setMerge] = createSignal(
    !loadBool(KEY_SKIP_EXISTING) && loadBool(KEY_MERGE),
  )
  const [followSeed, setFollowSeed] = createSignal(false)
  const handler = (name: string) => {
    if (name === "copy") {
      onOpen()
      const skip = loadBool(KEY_SKIP_EXISTING)
      setOverwrite(false)
      setSkipExisting(skip)
      setMerge(!skip && loadBool(KEY_MERGE))
      setFollowSeed(false)
    }
  }
  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })
  return (
    <ModalFolderChoose
      header={t("home.toolbar.choose_dst_folder")}
      opened={isOpen()}
      onClose={onClose}
      loading={loading()}
      headerSlot={(handler) => <CreateFolderButton handler={handler} />}
      footerSlot={
        <VStack w="$full" spacing="$2">
          <Checkbox
            mr="auto"
            checked={overwrite()}
            onChange={() => {
              const curOverwrite = !overwrite()
              if (curOverwrite) {
                // Solo estado en pantalla: lo guardado en localStorage no se toca
                setSkipExisting(false)
                setMerge(false)
              } else {
                // Al desmarcar overwrite, se restauran las preferencias guardadas
                setSkipExisting(loadBool(KEY_SKIP_EXISTING))
                setMerge(!loadBool(KEY_SKIP_EXISTING) && loadBool(KEY_MERGE))
              }
              setOverwrite(curOverwrite)
            }}
          >
            {t("home.conflict_policy.overwrite_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={skipExisting()}
            onChange={() => {
              const next = !skipExisting()
              setSkipExisting(next)
              saveBool(KEY_SKIP_EXISTING, next)
            }}
            disabled={overwrite() || merge()}
          >
            {t("home.conflict_policy.skip_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={merge()}
            onChange={() => {
              const next = !merge()
              setMerge(next)
              saveBool(KEY_MERGE, next)
            }}
            disabled={overwrite() || skipExisting()}
          >
            {t("home.conflict_policy.merge")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={followSeed()}
            disabled={selectedObjs().some((obj) => obj.is_dir)}
            onChange={() => setFollowSeed(!followSeed())}
          >
            {t("home.toolbar.follow_seed")}
          </Checkbox>
        </VStack>
      }
      onSubmit={async (dst) => {
        const resp = await ok(
          pathname(),
          dst,
          selectedObjs().map((obj) => obj.name),
          overwrite(),
          skipExisting(),
          merge(),
          followSeed(),
        )
        handleRespWithNotifySuccess(resp, () => {
          refresh()
          onClose()
        })
      }}
    />
  )
}

export const Move = () => {
  const t = useT()
  const { isOpen, onOpen, onClose } = createDisclosure()
  const [loading, ok] = useFetch(fsMove)
  const { pathname } = useRouter()
  const { refresh } = usePath()
  const [overwrite, setOverwrite] = createSignal(false)
  const [skipExisting, setSkipExisting] = createSignal(loadBool(KEY_SKIP_EXISTING))
  const [followSeed, setFollowSeed] = createSignal(false)
  const handler = (name: string) => {
    if (name === "move") {
      onOpen()
      setOverwrite(false)
      setSkipExisting(loadBool(KEY_SKIP_EXISTING))
      setFollowSeed(false)
    }
  }
  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })
  return (
    <ModalFolderChoose
      header={t("home.toolbar.choose_dst_folder")}
      opened={isOpen()}
      onClose={onClose}
      loading={loading()}
      headerSlot={(handler) => <CreateFolderButton handler={handler} />}
      footerSlot={
        <VStack w="$full" spacing="$2">
          <Checkbox
            mr="auto"
            checked={overwrite()}
            onChange={() => {
              const curOverwrite = !overwrite()
              if (curOverwrite) {
                setSkipExisting(false)
              } else {
                setSkipExisting(loadBool(KEY_SKIP_EXISTING))
              }
              setOverwrite(curOverwrite)
            }}
          >
            {t("home.conflict_policy.overwrite_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={skipExisting()}
            onChange={() => {
              const next = !skipExisting()
              setSkipExisting(next)
              saveBool(KEY_SKIP_EXISTING, next)
            }}
            disabled={overwrite()}
          >
            {t("home.conflict_policy.skip_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={followSeed()}
            disabled={selectedObjs().some((obj) => obj.is_dir)}
            onChange={() => setFollowSeed(!followSeed())}
          >
            {t("home.toolbar.follow_seed")}
          </Checkbox>
        </VStack>
      }
      onSubmit={async (dst) => {
        const resp = await ok(
          pathname(),
          dst,
          selectedObjs().map((obj) => obj.name),
          overwrite(),
          skipExisting(),
          followSeed(),
        )
        handleRespWithNotifySuccess(resp, () => {
          refresh()
          onClose()
        })
      }}
    />
  )
}
