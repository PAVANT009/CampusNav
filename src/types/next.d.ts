declare module "next" {
  export type Metadata = Record<string, unknown>
  export type NextConfig = Record<string, unknown>
}

declare module "next/link" {
  import type * as React from "react"
  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }
  const Link: React.ForwardRefExoticComponent<
    React.PropsWithChildren<LinkProps> & React.RefAttributes<HTMLAnchorElement>
  >
  export default Link
}

declare module "next/navigation" {
  export function usePathname(): string
  export function useRouter(): {
    push: (href: string) => void
    replace: (href: string) => void
    back: () => void
    refresh: () => void
    prefetch?: (href: string) => void
  }
  export function redirect(href: string): never
}

declare module "next/dynamic" {
  export default function dynamic<T = unknown>(
    loader: (...args: unknown[]) => Promise<T> | T,
    options?: Record<string, unknown>
  ): T
}

declare module "next/image" {
  import type * as React from "react"
  type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string
    alt: string
  }
  const Image: React.ForwardRefExoticComponent<
    React.PropsWithChildren<ImageProps> & React.RefAttributes<HTMLImageElement>
  >
  export default Image
}

declare module "next/headers" {
  export function headers(): Headers
}

declare module "next/font/google" {
  type FontConfig = {
    subsets?: string[]
    weight?: string | string[]
    variable?: string
    display?: string
  }
  type FontResult = {
    className: string
    variable?: string
  }
  export function Geist(config: FontConfig): FontResult
  export function Geist_Mono(config: FontConfig): FontResult
}
