import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-chip border border-transparent bg-clip-padding font-bold leading-tight whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-cord text-paper hover:bg-brass hover:text-ink",
        secondary: "border-cord-line bg-paper-raise text-ink hover:border-cord",
        outline: "border-cord-line text-ink hover:border-cord aria-pressed:border-cord aria-pressed:bg-cord aria-pressed:text-paper",
        ghost: "text-ink hover:bg-cord-soft",
        onCord: "bg-paper text-cord hover:bg-brass hover:text-ink",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-cord underline-offset-4 hover:underline",
        bare: "",
      },
      size: {
        default: "min-h-11 px-5 text-[0.95rem]",
        sm: "min-h-9 px-3 text-[0.88rem]",
        lg: "min-h-12 px-6 text-base",
        icon: "size-11",
        "icon-lg": "size-12",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
