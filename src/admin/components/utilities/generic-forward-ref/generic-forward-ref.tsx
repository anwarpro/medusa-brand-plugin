import { ReactNode, Ref, RefAttributes, forwardRef } from "react"

export function genericForwardRef<T, P = {}>(
  render: (props: P, ref: Ref<T>) => ReactNode
): (props: P & RefAttributes<T>) => ReactNode {
  // @ts-ignore
  return forwardRef(render) as any
}
