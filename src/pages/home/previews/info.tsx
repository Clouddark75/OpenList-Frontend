import { Heading, Icon, Image, Text, VStack } from "@hope-ui/solid"
import { JSXElement } from "solid-js"
import { getMainColor } from "~/store"
import { formatDate, getFileSize, usePreviewObj } from "~/utils"
import { getIconByObj } from "~/utils/icon"

export const FileInfo = (props: { children: JSXElement }) => {
  const store = usePreviewObj()
  return (
    <VStack class="fileinfo" py="$6" spacing="$6">
      <Image
        boxSize="$20"
        fallback={
          <Icon
            color={getMainColor()}
            boxSize="$20"
            as={getIconByObj(store.obj)}
          />
        }
        src={store.obj.thumb}
      />
      <VStack spacing="$2">
        <Heading
          size="lg"
          css={{
            wordBreak: "break-all",
          }}
        >
          {store.obj.name}
        </Heading>
        <Text color="$neutral10" size="sm">
          {getFileSize(store.obj.size)} · {formatDate(store.obj.modified)}
        </Text>
      </VStack>
      <VStack spacing="$2">{props.children}</VStack>
    </VStack>
  )
}
