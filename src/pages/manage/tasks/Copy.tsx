import { useManageTitle, useT } from "~/hooks"
import { TypeTasks } from "./Tasks"
import { getPath } from "./helper"

const Copy = () => {
  const t = useT()
  useManageTitle("manage.sidemenu.copy")
  return (
    <TypeTasks
      type="copy"
      canRetry
      nameAnalyzer={{
        // Regex mejorado para capturar correctamente copy y merge
        regex:
          /^(?:copy|merge) \[([^\]]*)\]\(([^)]*)\) to \[([^\]]*)\]\(([^)]*)\)$/,
        title: (matches) => {
          // matches[1] = src storage mount path
          // matches[2] = src actual path (path completo)
          // matches[3] = dst storage mount path  
          // matches[4] = dst actual path
          
          const srcPath = matches[2]
          
          // Debug: ver qué estamos recibiendo
          console.log('Task name matches:', matches)
          console.log('Source path:', srcPath)
          
          // Extraer el último segmento del path (nombre del archivo/carpeta)
          const lastSlashIndex = srcPath.lastIndexOf('/')
          const fileName = lastSlashIndex >= 0 
            ? srcPath.substring(lastSlashIndex + 1)
            : srcPath
          
          console.log('Extracted fileName:', fileName)
          
          // Si el nombre está vacío, es raíz
          if (fileName === "") {
            return "/"
          }
          
          return fileName
        },
        attrs: {
          [t("tasks.attr.copy.src")]: (matches) =>
            getPath(matches[1], matches[2]),
          [t("tasks.attr.copy.dst")]: (matches) =>
            getPath(matches[3], matches[4]),
        },
      }}
    />
  )
}

export default Copy
