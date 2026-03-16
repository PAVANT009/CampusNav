"use client"

import { GooeyToaster as GooeyToasterBase, gooeyToast } from "goey-toast"
import type { GooeyToasterProps } from "goey-toast"
// import "goey-toast/styles.css"

export { gooeyToast }
export type { GooeyToasterProps }


function GoeyToaster(props: GooeyToasterProps) {
  return <GooeyToasterBase position="bottom-right" {...props} />
}

export { GoeyToaster }
 
