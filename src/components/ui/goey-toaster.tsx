"use client"

import { GooeyToaster , gooeyToast  } from "goey-toast"
import type { GooeyToasterProps } from "goey-toast"
// import "goey-toast/styles.css"

export { gooeyToast }
export type { GooeyToasterProps }


function GoeyToaster(props: GooeyToasterProps) {
  return <GooeyToaster position="bottom-right" {...props} />
}

export { GoeyToaster }
