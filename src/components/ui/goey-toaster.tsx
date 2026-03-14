"use client"

import * as GoeyToastModule from "goey-toast"
import type { ComponentType } from "react"
import type { GoeyToasterProps } from "goey-toast"
// import "goey-toast/styles.css"

const GoeyToasterPrimitive = (
  // ESM build exports `GoeyToaster`, CJS build exports `GooeyToaster`.
  (GoeyToastModule as unknown as { GoeyToaster?: ComponentType<GoeyToasterProps> })
    .GoeyToaster ??
  (GoeyToastModule as unknown as { GooeyToaster?: ComponentType<GoeyToasterProps> })
    .GooeyToaster ??
  (() => {
    throw new Error(
      "goey-toast export not found. Expected GoeyToaster or GooeyToaster."
    )
  })
  ) as ComponentType<GoeyToasterProps>

const goeyToast = (
  // ESM build exports `goeyToast`, CJS build exports `gooeyToast`.
  (GoeyToastModule as unknown as { goeyToast?: typeof GoeyToastModule.goeyToast }).goeyToast ??
  (GoeyToastModule as unknown as { gooeyToast?: typeof GoeyToastModule.goeyToast }).gooeyToast ??
  (() => {
    throw new Error(
      "goey-toast export not found. Expected goeyToast or gooeyToast."
    )
  })
  ) as typeof GoeyToastModule.goeyToast

export { goeyToast }
export type { GoeyToasterProps }
export type {
  GoeyToastOptions,
  GoeyPromiseData,
  GoeyToastAction,
  GoeyToastClassNames,
  GoeyToastTimings,
} from "goey-toast"

function GoeyToaster(props: GoeyToasterProps) {
  return <GoeyToasterPrimitive position="bottom-right" {...props} />
}

export { GoeyToaster }
