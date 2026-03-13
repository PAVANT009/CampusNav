declare module "next" {
  export type Metadata = Record<string, unknown>
}

declare module "next/link" {
  const Link: any
  export default Link
}

declare module "next/navigation" {
  export const usePathname: any
  export const useRouter: any
  export const redirect: any
}

declare module "next/dynamic" {
  const dynamic: any
  export default dynamic
}

declare module "next/image" {
  const Image: any
  export default Image
}

declare module "next/headers" {
  export const headers: any
}

declare module "next/font/google" {
  export const Geist: any
  export const Geist_Mono: any
}
