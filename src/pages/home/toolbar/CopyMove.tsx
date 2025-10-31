import { Checkbox, createDisclosure, HStack } from "@hope-ui/solid"
import { createSignal, onCleanup, onMount } from "solid-js"
import { ModalFolderChoose } from "~/components"
import { useFetch, usePath, useRouter, useT } from "~/hooks"
import { selectedObjs } from "~/store"
import { bus, fsCopy, fsMove, handleRespWithNotifySuccess } from "~/utils"

type ConflictPolicyChooseProps = {
  toolName: string
  header: string
  loading?: boolean
  onOk: (
    src: string,
    dst: string,
    names: string[],
    overwrite: boolean,
    skip_existing: boolean,
  ) => Promise<any>
}

// Claves para localStorage
const STORAGE_KEY_OVERWRITE = "file-operation-overwrite"
const STORAGE_KEY_SKIP_EXISTING = "file-operation-skip-existing"

// Funciones helper para localStorage
const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
  const stored = localStorage.getItem(key)
  if (stored === null) return defaultValue
  return stored === "true"
}

const setStoredBoolean = (key: string, value: boolean): void => {
  localStorage.setItem(key, value.toString())
}

export const ConflictPolicyChoose = (props: ConflictPolicyChooseProps) => {
  const t = useT()
  const { isOpen, onOpen, onClose } = createDisclosure()
  const { pathname } = useRouter()
  const { refresh } = usePath()
  
  // Inicializar con valores de localStorage
  const [overwrite, setOverwrite] = createSignal(
    getStoredBoolean(STORAGE_KEY_OVERWRITE, false)
  )
  const [skipExisting, setSkipExisting] = createSignal(
    getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false)
  )

  // Cargar valores al montar el componente
  onMount(() => {
    setOverwrite(getStoredBoolean(STORAGE_KEY_OVERWRITE, false))
    setSkipExisting(getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false))
  })

  const handler = (name: string) => {
    if (name === props.toolName) {
      onOpen()
      // Cargar valores guardados al abrir el modal
      setOverwrite(getStoredBoolean(STORAGE_KEY_OVERWRITE, false))
      setSkipExisting(getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false))
    }
  }

  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })

  const handleOverwriteChange = () => {
    const curOverwrite = !overwrite()
    if (curOverwrite) {
      setSkipExisting(false)
      setStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false)
    }
    setOverwrite(curOverwrite)
    setStoredBoolean(STORAGE_KEY_OVERWRITE, curOverwrite)
  }

  const handleSkipExistingChange = () => {
    const newValue = !skipExisting()
    setSkipExisting(newValue)
    setStoredBoolean(STORAGE_KEY_SKIP_EXISTING, newValue)
  }

  return (
    <ModalFolderChoose
      header={props.header}
      opened={isOpen()}
      onClose={onClose}
      loading={props.loading}
      footerSlot={
        <HStack class="title" w="$full" p="$2">
          <Checkbox
            mr="auto"
            checked={overwrite()}
            onChange={handleOverwriteChange}
          >
            {t("home.conflict_policy.overwrite_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={skipExisting()}
            onChange={handleSkipExistingChange}
            disabled={overwrite()}
          >
            {t("home.conflict_policy.skip_existing")}
          </Checkbox>
        </HStack>
      }
      onSubmit={async (dst) => {
        const resp = await props.onOk(
          pathname(),
          dst,
          selectedObjs().map((obj) => obj.name),
          overwrite(),
          skipExisting(),
        )
        handleRespWithNotifySuccess(resp, () => {
          refresh()
          onClose()
        })
      }}
    />
  )
}

export const Copy = () => {
  const t = useT()
  const [loading, ok] = useFetch(fsCopy)
  return (
    <ConflictPolicyChoose
      toolName="copy"
      header={t("home.toolbar.choose_dst_folder")}
      loading={loading()}
      onOk={ok}
    />
  )
}

export const Move = () => {
  const t = useT()
  const [loading, ok] = useFetch(fsMove)
  return (
    <ConflictPolicyChoose
      toolName="move"
      header={t("home.toolbar.choose_dst_folder")}
      loading={loading()}
      onOk={ok}
    />
  )
}
