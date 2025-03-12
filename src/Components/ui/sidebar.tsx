import * as React from "react"
import { type VariantProps, cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

// Constants with underscore prefix to indicate intentional non-usage
const _SIDEBAR_COOKIE_NAME = "sidebar_state"
const _SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const _SIDEBAR_WIDTH = "16rem"
const _SIDEBAR_WIDTH_MOBILE = "18rem"
const _SIDEBAR_WIDTH_ICON = "3rem"
const _SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextType = {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva("h-full flex flex-col", {
  variants: {
    variant: {
      default: "",
      sidebar: "bg-background",
      floating: "m-4 rounded-lg shadow-xl",
      inset: "border-r-0 border-y-0",
    },
    side: {
      left: "left-0",
      right: "right-0 border-r-0 border-l",
    },
    collapsible: {
      none: "",
      icon: "",
      offcanvas: "",
    },
  },
  defaultVariants: {
    variant: "sidebar",
    side: "left",
    collapsible: "none",
  },
})

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsed?: boolean
}

export function Sidebar({
  className,
  children,
  variant,
  side,
  collapsible,
  collapsed: customCollapsed,
  ...props
}: SidebarProps) {
  const sidebarContext = React.useContext(SidebarContext)
  const collapsed = customCollapsed ?? sidebarContext?.collapsed ?? false

  const styles = React.useMemo(
    () =>
      cn(
        sidebarVariants({ variant, side, collapsible }),
        className,
        collapsed
          ? collapsible === "icon"
            ? "w-[4rem]"
            : "w-0 overflow-hidden opacity-0"
          : ""
      ),
    [className, variant, side, collapsible, collapsed]
  )

  return (
    <div className={styles} {...props}>
      {children}
    </div>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  _dummy?: boolean;
}

export function SidebarHeader({
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  return (
    <div
      className={cn("sticky top-0 z-10 w-full bg-background", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  _dummy?: boolean;
}

export function SidebarFooter({
  className,
  children,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn("sticky bottom-0 z-10 w-full bg-background", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  _dummy?: boolean;
}

export function SidebarContent({
  className,
  children,
  ...props
}: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

export function SidebarGroup({
  className,
  children,
  label,
  ...props
}: SidebarGroupProps) {
  return (
    <div
      className={cn("px-2 py-2", className)}
      data-label={label}
      {...props}
    >
      {label && (
        <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">
          {label}
        </h3>
      )}
      {children}
    </div>
  )
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  _dummy?: boolean;
}

export function SidebarMenu({
  className,
  children,
  ...props
}: SidebarMenuProps) {
  return (
    <ul className={cn("min-w-0 space-y-1", className)} {...props}>
      {children}
    </ul>
  )
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  _dummy?: boolean;
}

export function SidebarMenuItem({
  className,
  children,
  ...props
}: SidebarMenuItemProps) {
  return (
    <li className={cn("min-w-0", className)} {...props}>
      {children}
    </li>
  )
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, asChild = false, ...props }, ref) => {
  if (asChild) {
    return <div className={cn("min-w-0", className)}>{props.children}</div>
  }
  
  return (
    <button
      ref={ref}
      className={cn(
        "min-w-0 flex w-full items-center justify-start gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const badgeVariants = cva(
  "ml-auto inline-flex items-center rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        success: "bg-green-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-blue-500 text-white",
      },
      size: {
        xs: "h-4 px-1.5",
        sm: "h-5 px-2",
        md: "h-6 px-2.5",
        lg: "h-7 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xs",
    },
  }
)

interface SidebarMenuBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function SidebarMenuBadge({
  className,
  variant,
  size,
  ...props
}: SidebarMenuBadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

interface SidebarMenuActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  _dummy?: boolean;
}

export const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuActionProps
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "ml-auto flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

interface SidebarMenuSubProps extends React.HTMLAttributes<HTMLDivElement> {
  _dummy?: boolean;
}

export function SidebarMenuSub({
  className,
  children,
  ...props
}: SidebarMenuSubProps) {
  return (
    <div
      className={cn("relative mt-1 pl-4 before:sub-indicator", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarMenuSkeleton() {
  return (
    <div className="group min-w-0 space-y-4 rounded-md px-3 py-2 hover:bg-accent/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

interface SidebarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  _dummy?: boolean;
}

export function SidebarSeparator({
  className,
  ...props
}: SidebarSeparatorProps) {
  return (
    <div
      className={cn("my-2 h-px w-full bg-border", className)}
      {...props}
    />
  )
}

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  _dummy?: boolean;
}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(({ className, children, ...props }, ref) => {
  const sidebar = useSidebar()

  return (
    <button
      ref={ref}
      onClick={() => sidebar.setCollapsed(!sidebar.collapsed)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <path d="M9 3v18" />
        </svg>
      )}
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"
