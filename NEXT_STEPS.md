# Next Session: Complete Admin Setup

## What's Done ✅

### Architecture Finalized
- **Decision**: Custom admin (Refine + shadcn/ui) → nexus-commerce API
- **No gateway needed** - Direct connection
- **Full ownership** - All code is yours

### Project Created
- **Location**: `/Users/kibuka/IdeaProjects/nexus-admin-v2`
- **Dependencies installed**:
  - Refine core + routing
  - TanStack Query & Table
  - Tailwind CSS v4
  - shadcn/ui dependencies (Radix, clsx, etc.)
  - TypeScript

### Backend Ready
- **nexus-commerce** running on port 8080
- Admin endpoints exist:
  - `/admin/products` (GET, POST, PUT)
  - `/admin/orders` (GET, GET/:id, POST/:id/cancel)
  - `/admin/customers` (GET, GET/:id)
  - `/admin/users` (GET, POST/create, POST/:id/deactivate)
- Authentication at `/api/v1/internal/auth/login`

## Next Steps (30-45 minutes)

### 1. Configure Tailwind CSS (5 min)

Create `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2. Initialize shadcn/ui (10 min)

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Create `src/components/ui/button.tsx` (first component):
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 hover:bg-gray-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 3. Set Up Refine App (10 min)

Update `src/App.tsx`:
```typescript
import { Refine } from "@refinedev/core";
import { BrowserRouter, Routes, Route } from "react-router";
import routerProvider from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";

function App() {
  return (
    <BrowserRouter>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider("http://localhost:8080")}
        resources={[
          {
            name: "products",
            list: "/products",
            create: "/products/create",
            edit: "/products/:id/edit",
          },
        ]}
      >
        <Routes>
          <Route path="/products" element={<div>Products List</div>} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}

export default App;
```

### 4. Create Products List Page (15 min)

Create `src/pages/products/list.tsx`:
```typescript
import { useTable } from "@refinedev/core";

export const ProductList = () => {
  const { data, isLoading } = useTable({
    resource: "admin/products",
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Title</th>
            <th className="p-2">Handle</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((product: any) => (
            <tr key={product.id} className="border-t">
              <td className="p-2">{product.title}</td>
              <td className="p-2">{product.handle}</td>
              <td className="p-2">{product.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 5. Start Dev Server

```bash
cd /Users/kibuka/IdeaProjects/nexus-admin-v2
pnpm dev
```

Visit: `http://localhost:3001`

## Expected Result

After these steps, you'll have:
- ✅ Working admin UI
- ✅ Product list pulling from your backend
- ✅ Professional styling with Tailwind
- ✅ Foundation for adding more features

## Files to Create

1. `tailwind.config.js`
2. `postcss.config.js`
3. `src/lib/utils.ts`
4. `src/components/ui/button.tsx`
5. `src/pages/products/list.tsx`
6. Update `src/App.tsx`
7. Update `src/index.css`

## Common Issues

**CORS Error?**
- Backend CORS is already configured for `localhost:3001`
- If different port, update SecurityConfig.kt

**API Not Found?**
- Check nexus-commerce is running on 8080
- Test: `curl http://localhost:8080/admin/products`

**Styling Not Working?**
- Ensure Tailwind directives are in `src/index.css`
- Restart dev server after Tailwind config changes

## Architecture Summary

```
nexus-admin-v2 (React, port 3001)
  ↓ HTTP requests
nexus-commerce (Spring Boot, port 8080)
  ↓ Workflows
PostgreSQL (nexuscommerce DB)
```

Clean. Simple. Yours.

## Resources

- [Refine Docs](https://refine.dev/docs)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

Good luck! 🚀
