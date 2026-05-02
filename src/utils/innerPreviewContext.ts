import { createContext, useContext } from "solid-js"
import { ArchiveObj } from "~/types"
import { objStore } from "~/store"

export type InnerPreviewCtx = {
  obj: ArchiveObj
  rawUrl: string
}

export const InnerPreviewContext = createContext<InnerPreviewCtx | undefined>(undefined)

export const useInnerPreview = () => useContext(InnerPreviewContext)

/**
 * Returns obj and raw_url from the inner preview context if active,
 * otherwise falls back to the global objStore.
 * Use this in preview components instead of reading objStore directly.
 */
export const usePreviewObj = () => {
  const ctx = useContext(InnerPreviewContext)
  return {
    get obj() {
      return ctx?.obj ?? objStore.obj
    },
    get raw_url() {
      return ctx?.rawUrl ?? objStore.raw_url
    },
  }
}
