import Button from './Button'

// Icons for demonstration
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'The Button component is the primary interactive element in Scratch Pad. It supports multiple variants, sizes, and states while maintaining our unique dark mode aesthetic with pink accents.'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger', 'success'],
      description: 'Visual style variant of the button'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the button'
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state of the button'
    },
    loading: {
      control: 'boolean',
      description: 'Loading state of the button'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width of its container'
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler'
    }
  }
}

// Default story
export const Default = {
  args: {
    children: 'Start Round',
    variant: 'primary',
    size: 'medium'
  }
}

// All variants
export const Variants = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="danger">Danger Button</Button>
        <Button variant="success">Success Button</Button>
      </div>
    </div>
  )
}

// All sizes
export const Sizes = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button size="small">Small Button</Button>
        <Button size="medium">Medium Button</Button>
        <Button size="large">Large Button</Button>
      </div>
    </div>
  )
}

// With icons
export const WithIcons = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Button icon={<PlayIcon />}>Play Round</Button>
        <Button variant="secondary" icon={<SaveIcon />}>Save Score</Button>
        <Button variant="success" icon={<CheckIcon />} iconPosition="right">
          Round Complete
        </Button>
        <Button variant="danger" icon={<TrashIcon />} size="small">
          Delete
        </Button>
      </div>
    </div>
  )
}

// States
export const States = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Normal State</h3>
        <div className="flex gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Disabled State</h3>
        <div className="flex gap-4">
          <Button disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="ghost" disabled>Ghost</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Loading State</h3>
        <div className="flex gap-4">
          <Button loading>Saving...</Button>
          <Button variant="secondary" loading>Processing...</Button>
          <Button variant="success" loading icon={<CheckIcon />}>Submitting...</Button>
        </div>
      </div>
    </div>
  )
}

// Full width examples
export const FullWidth = {
  render: () => (
    <div className="max-w-md space-y-4">
      <Button fullWidth>Full Width Primary</Button>
      <Button variant="secondary" fullWidth icon={<SaveIcon />}>
        Full Width with Icon
      </Button>
      <Button variant="ghost" fullWidth size="small">
        Full Width Small Ghost
      </Button>
    </div>
  )
}

// Real world examples
export const RealWorldExamples = {
  render: () => (
    <div className="space-y-8">
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">Score Entry Form</h3>
        <div className="bg-slate-900/80 p-6 rounded-lg border border-pink-900/30">
          <div className="space-y-4">
            <input 
              type="number" 
              placeholder="Enter score" 
              className="w-full px-4 py-2 bg-slate-800 border border-pink-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
            />
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth>Cancel</Button>
              <Button variant="primary" fullWidth icon={<SaveIcon />}>Save Score</Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">Round Actions</h3>
        <div className="bg-slate-900/80 p-6 rounded-lg border border-pink-900/30">
          <div className="space-y-3">
            <Button variant="primary" fullWidth icon={<PlayIcon />}>Start New Round</Button>
            <Button variant="secondary" fullWidth>View Statistics</Button>
            <Button variant="ghost" fullWidth size="small">Previous Rounds</Button>
          </div>
        </div>
      </div>
    </div>
  )
}