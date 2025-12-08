# UI Components Guide

Reusable components with micro-interactions for the admin console.

## Components

### Card

Flexible card component with hover effects.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

<Card hover onClick={() => console.log('clicked')}>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
</Card>
```

### DataTable

Sortable, paginated table component.

```tsx
import { DataTable } from '@/components/ui/DataTable'

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', render: (item) => <Badge>{item.status}</Badge> },
  { key: 'created', label: 'Created', sortable: true },
]

<DataTable
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
  onRowClick={(item) => console.log(item)}
  pageSize={10}
/>
```

### FormInput & TextArea

Form inputs with validation states.

```tsx
import { FormInput, TextArea } from '@/components/ui/FormInput'

<FormInput
  label="Username"
  placeholder="Enter username"
  error={errors.username}
  helperText="Must be unique"
/>

<TextArea
  label="Description"
  rows={4}
  error={errors.description}
/>
```

### FileDropzone

Drag-and-drop file upload with preview.

```tsx
import { FileDropzone } from '@/components/ui/FileDropzone'

<FileDropzone
  onFilesSelected={(files) => console.log(files)}
  accept="image/*"
  maxSize={10 * 1024 * 1024}
  multiple={false}
  label="Drop image here"
/>
```

### TagMultiSelect

Multi-select dropdown with tags.

```tsx
import { TagMultiSelect } from '@/components/ui/TagMultiSelect'

const options = [
  { value: '1', label: 'Channel 1' },
  { value: '2', label: 'Channel 2' },
]

<TagMultiSelect
  options={options}
  selected={selectedIds}
  onChange={setSelectedIds}
  label="Select Channels"
  placeholder="Choose channels..."
/>
```

### Toast System

Global toast notifications.

```tsx
// 1. Wrap app with ToastProvider
import { ToastProvider } from '@/components/ui/Toast'

<ToastProvider>
  <App />
</ToastProvider>

// 2. Use in components
import { useToast } from '@/components/ui/Toast'

const { showToast } = useToast()

showToast('success', 'Banner created successfully!')
showToast('error', 'Failed to delete item')
showToast('info', 'Processing your request...')
```

### Toggle

Toggle switch with optimistic updates.

```tsx
import { Toggle } from '@/components/ui/Toggle'

<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable feature"
  optimistic={true}
/>
```

### CommandPalette

Keyboard-accessible command palette.

```tsx
import { CommandPalette } from '@/components/ui/CommandPalette'

// Add to layout
<CommandPalette />

// Keyboard shortcuts:
// - Cmd/Ctrl + K: Open palette
// - G: Open palette (when not in input)
// - ESC: Close palette
```

## Micro-Interactions

### Optimistic Updates

Toggle component supports optimistic UI updates:

```tsx
const mutation = useMutation({
  mutationFn: updateBanner,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['banners'] })
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['banners'])
    
    // Optimistically update
    queryClient.setQueryData(['banners'], (old) => ({
      ...old,
      ...newData,
    }))
    
    return { previous }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['banners'], context.previous)
    showToast('error', 'Update failed')
  },
  onSuccess: () => {
    showToast('success', 'Updated successfully!')
  },
})
```

### Loading Skeletons

Use in DataTable and Card components:

```tsx
{isLoading ? (
  <div className="space-y-3">
    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
    <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
  </div>
) : (
  <DataTable data={data} columns={columns} />
)}
```

### Success/Error Toasts

Automatic toast on mutations:

```tsx
const mutation = useMutation({
  mutationFn: createBanner,
  onSuccess: () => {
    showToast('success', 'Banner created!')
    queryClient.invalidateQueries({ queryKey: ['banners'] })
  },
  onError: (error) => {
    showToast('error', error.message)
  },
})
```

## Keyboard Shortcuts

### Global Shortcuts

- `Cmd/Ctrl + K` - Open command palette
- `G` - Quick open command palette
- `ESC` - Close modals/dialogs

### In Tables

- `Arrow Up/Down` - Navigate rows
- `Enter` - Select row
- `Space` - Toggle checkbox

### In Forms

- `Tab` - Next field
- `Shift + Tab` - Previous field
- `Enter` - Submit form
- `ESC` - Cancel/close

## Styling

All components use Tailwind CSS with custom design tokens:

```css
/* Colors */
background-primary: #000000
background-secondary: #0a0a0a
background-tertiary: #1a1a1a
brand-accent: #52991f
brand-forest: #1a330b

/* Shadows */
shadow-card: soft shadow
shadow-card-hover: elevated shadow

/* Animations */
animate-pulse: loading state
animate-in: enter animation
slide-in-from-right: toast animation
```

## Best Practices

1. **Always use Toast for feedback**
   ```tsx
   showToast('success', 'Action completed')
   ```

2. **Show loading states**
   ```tsx
   {isLoading ? <Skeleton /> : <Content />}
   ```

3. **Validate forms**
   ```tsx
   <FormInput error={errors.field} />
   ```

4. **Use optimistic updates for toggles**
   ```tsx
   <Toggle optimistic={true} />
   ```

5. **Provide keyboard shortcuts**
   ```tsx
   <CommandPalette />
   ```

## Examples

### Complete Form

```tsx
import { FormInput, TextArea, FileDropzone, Toggle } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

function BannerForm() {
  const { showToast } = useToast()
  const [enabled, setEnabled] = useState(true)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createBanner(data)
      showToast('success', 'Banner created!')
    } catch (error) {
      showToast('error', error.message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput label="Name" required />
      <TextArea label="Message" rows={4} />
      <FileDropzone onFilesSelected={setFiles} />
      <Toggle checked={enabled} onChange={setEnabled} label="Enabled" />
      <button type="submit" className="brand-btn">Create</button>
    </form>
  )
}
```

### Complete Table

```tsx
import { DataTable } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'

function BannersTable() {
  const { data, isLoading } = useBanners()
  const { showToast } = useToast()
  
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'enabled', label: 'Status', render: (item) => (
      <Toggle checked={item.enabled} onChange={() => toggle(item.id)} />
    )},
  ]
  
  if (isLoading) return <Skeleton />
  
  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(item) => item.id}
      onRowClick={(item) => showToast('info', `Clicked ${item.name}`)}
    />
  )
}
```
