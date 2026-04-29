import { createContext, useContext } from "solid-js"
import { ArchiveObj } from "~/types"

export type InnerPreviewContext = {
  obj: ArchiveObj
  rawUrl: string
}

export const InnerPreviewContext = createContext<InnerPreviewContext | undefined>(undefined)

export const useInnerPreview = () => useContext(InnerPreviewContext)
