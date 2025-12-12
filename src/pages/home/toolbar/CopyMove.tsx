import { Checkbox, createDisclosure, VStack, Button } from "@hope-ui/solid"
import { createSignal, onCleanup, onMount } from "solid-js"
import { ModalFolderChoose, FolderTreeHandler } from "~/components"
import { useFetch, usePath, useRouter, useT } from "~/hooks"
import { selectedObjs } from "~/store"
import { bus, fsCopy, fsMove, handleRespWithNotifySuccess } from "~/utils"
import { CgFolderAdd } from "solid-icons/cg"

// Claves para localStorage
const STORAGE_KEY_OVERWRITE = "file-operation-overwrite"
const STORAGE_KEY_SKIP_EXISTING = "file-operation-skip-existing"
const STORAGE_KEY_MERGE = "file-operation-merge"

// Funciones helper para localStorage
const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
  const stored = localStorage.getItem(key)
  if (stored === null) return defaultValue
  return stored === "true"
}

const setStoredBoolean = (key: string, value: boolean): void => {
  localStorage.setItem(key, value.toString())
}

const CreateFolderButton = (props: { handler?: FolderTreeHandler }) => {
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
  
  // Inicializar con valores de localStorage
  const [overwrite, setOverwrite] = createSignal(
    getStoredBoolean(STORAGE_KEY_OVERWRITE, false)
  )
  const [skipExisting, setSkipExisting] = createSignal(
    getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false)
  )
  const [merge, setMerge] = createSignal(
    getStoredBoolean(STORAGE_KEY_MERGE, false)
  )

  // Cargar valores al montar
  onMount(() => {
    setOverwrite(getStoredBoolean(STORAGE_KEY_OVERWRITE, false))
    setSkipExisting(getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false))
    setMerge(getStoredBoolean(STORAGE_KEY_MERGE, false))
  })

  const handler = (name: string) => {
    if (name === "copy") {
      onOpen()
      // Recargar valores guardados al abrir
      setOverwrite(getStoredBoolean(STORAGE_KEY_OVERWRITE, false))
      setSkipExisting(getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false))
      setMerge(getStoredBoolean(STORAGE_KEY_MERGE, false))
    }
  }

  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })

  const handleOverwriteChange = () => {
    const newValue = !overwrite()
    if (newValue) {
      // Si activamos overwrite, desactivamos skip y merge
      setSkipExisting(false)
      setMerge(false)
      setStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false)
      setStoredBoolean(STORAGE_KEY_MERGE, false)
    }
    setOverwrite(newValue)
    setStoredBoolean(STORAGE_KEY_OVERWRITE, newValue)
  }

  const handleSkipExistingChange = () => {
    const newValue = !skipExisting()
    if (newValue) {
      // Si activamos skip, desactivamos merge
      setMerge(false)
      setStoredBoolean(STORAGE_KEY_MERGE, false)
    }
    setSkipExisting(newValue)
    setStoredBoolean(STORAGE_KEY_SKIP_EXISTING, newValue)
  }

  const handleMergeChange = () => {
    const newValue = !merge()
    if (newValue) {
      // Si activamos merge, desactivamos skip
      setSkipExisting(false)
      setStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false)
    }
    setMerge(newValue)
    setStoredBoolean(STORAGE_KEY_MERGE, newValue)
  }

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
            onChange={handleOverwriteChange}
          >
            {t("home.conflict_policy.skip_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={merge()}
            onChange={handleMergeChange}
            disabled={overwrite() || skipExisting()}
          >
            {t("home.conflict_policy.merge")}
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
  
  // Inicializar con valores de localStorage
  const [overwrite, setOverwrite] = createSignal(
    getStoredBoolean(STORAGE_KEY_OVERWRITE, false)
  )
  const [skipExisting, setSkipExisting] = createSignal(
    getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false)
  )

  // Cargar valores al montar
  onMount(() => {
    setOverwrite(getStoredBoolean(STORAGE_KEY_OVERWRITE, false))
    setSkipExisting(getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false))
  })

  const handler = (name: string) => {
    if (name === "move") {
      onOpen()
      // Recargar valores guardados al abrir
      setOverwrite(getStoredBoolean(STORAGE_KEY_OVERWRITE, false))
      setSkipExisting(getStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false))
    }
  }

  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })

  const handleOverwriteChange = () => {
    const newValue = !overwrite()
    if (newValue) {
      setSkipExisting(false)
      setStoredBoolean(STORAGE_KEY_SKIP_EXISTING, false)
    }
    setOverwrite(newValue)
    setStoredBoolean(STORAGE_KEY_OVERWRITE, newValue)
  }

  const handleSkipExistingChange = () => {
    const newValue = !skipExisting()
    setSkipExisting(newValue)
    setStoredBoolean(STORAGE_KEY_SKIP_EXISTING, newValue)
  }

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
        </VStack>
      }
      onSubmit={async (dst) => {
        const resp = await ok(
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
}.conflict_policy.overwrite_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={skipExisting()}
            onChange={handleSkipExistingChange}
            disabled={overwrite() || merge()}
          >
            {t("home
